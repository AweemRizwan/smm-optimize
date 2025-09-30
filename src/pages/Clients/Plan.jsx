import { useEffect, useState } from 'react'
import platforms from "../../constants/platforms";
import { Formik, Form, Field } from 'formik'
import FieldAndError from '../../components/Form/FieldAndError'
import { useGetAssignedPlansForAccountManagerQuery } from '../../services/api/planApiSlice'
import useCurrentUser from '../../hooks/useCurrentUser'
import { formatString, toSnakeCase } from '../../utils/generalUtils'
import { useGetPostAttributesByTypeQuery } from '../../services/api/postAttributeApiSlice';
import { useCreateClientPlanMutation, useGetClientPlanQuery, useUpdateClientPlanMutation } from '../../services/api/clientApiSlice';
import { useParams } from 'react-router-dom';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import SelectField from '../../components/Form/SelectField';

const PlanForm = () => {
    const { clientId } = useParams(); // Get clientId from the URL
    const { role } = useCurrentUser();
    const { data: clientPlanData, isLoading: isClientPlanLoading } = useGetClientPlanQuery(clientId, {
        skip: !clientId // or some logic if needed
    });
    // eslint-disable-next-line no-unused-vars
    const { data: assignedPlans, error, isLoading } = useGetAssignedPlansForAccountManagerQuery(clientId);
    const { data: postTypes = [], isLoading: isLoadingTypes } = useGetPostAttributesByTypeQuery('post_type');
    const [createClientPlan, { isLoading: isCreating }] = useCreateClientPlanMutation();
    const [updateClientPlan, { isLoading: isUpdating }] = useUpdateClientPlanMutation();
    /* ✅  who is allowed to see money? */
    const showPrices = ['account_manager', 'accountant', 'marketing_director']
        .includes(role);


    const [selectedPlan, setSelectedPlan] = useState(null);
    const [pricingAttributes, setPricingAttributes] = useState({});
    const [pricingPlatforms, setPricingPlatforms] = useState({});

    // ✅ Added state for error and success messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (clientPlanData && assignedPlans?.length) {
            const planData = assignedPlans[0];
            setPricingAttributes(planData.pricing_attributes);
            setPricingPlatforms(planData.pricing_platforms);

            const chosenPlanType = clientPlanData?.plan_type?.toLowerCase();
            if (chosenPlanType === "standard") {
                setSelectedPlan({
                    price: planData.standard_netprice,
                    inclusion: planData.standard_plan_inclusion,
                    attributes: planData.standard_attributes,
                });
            } else if (chosenPlanType === "advanced") {
                setSelectedPlan({
                    price: planData.advanced_netprice,
                    inclusion: planData.advanced_plan_inclusion,
                    attributes: planData.advanced_attributes,
                });
            }

        }
    }, [clientPlanData, assignedPlans]);

    const recalculateTotals = (values) => {
        const totalAddOnsCost = Object.entries(values.attributes).reduce((sum, [key, value]) => {
            const unitPrice = pricingAttributes[key] || 0;
            return sum + value * unitPrice;
        }, 0);

        const platformCost = Object.entries(values.platforms).reduce((sum, [key, value]) => {
            if (value && !['facebook', 'instagram'].includes(key)) {
                const unitPrice = pricingPlatforms[key] || 0;
                return sum + unitPrice;
            }
            return sum;
        }, 0);

        const totalCost = totalAddOnsCost + platformCost;

        const grandTotal = (selectedPlan?.price || 0) + totalAddOnsCost + platformCost;
        return { totalAddOnsCost: totalCost, platformCost, grandTotal };
    };

    const handlePlanChange = (value) => {
        if (assignedPlans?.length) {
            const planData = assignedPlans[0];
            // console.log(planData.pricing_attributes);
            setPricingAttributes(planData.pricing_attributes);
            setPricingPlatforms(planData.pricing_platforms);
            if (value === "standard") {
                setSelectedPlan({
                    price: planData.standard_netprice,
                    inclusion: planData.standard_plan_inclusion,
                    attributes: planData.standard_attributes,
                });
            } else if (value === "advanced") {
                setSelectedPlan({
                    price: planData.advanced_netprice,
                    inclusion: planData.advanced_plan_inclusion,
                    attributes: planData.advanced_attributes,
                });
            }
        } else {
            setSelectedPlan({
                price: 0,
                inclusion: "Please select a valid plan.",
                attributes: {},
            });
            setPricingAttributes({});
            setPricingPlatforms({});
        }
    };

    const handleAddOnChange = (name, value, setFieldValue) => {
        const snakeCaseName = toSnakeCase(name); // Convert name to snake_case
        setFieldValue(`attributes.${snakeCaseName}`, value); // Update nested field
    };


    const handleCheckboxChange = (name, checked, setFieldValue) => {
        const snakeCaseName = toSnakeCase(name); // Ensure platform key is snake_case
        setFieldValue(`platforms.${snakeCaseName}`, checked);
    };



    const handleSubmit = async (values) => {
        const { grandTotal } = recalculateTotals(values);

        // Filter out 'facebook' and 'instagram' from platforms
        const filteredPlatforms = Object.entries(values.platforms).reduce((acc, [key, value]) => {
            if (!['facebook', 'instagram'].includes(key)) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const payload = {
            plan_type: values.planName,
            addon_attributes: values.attributes,
            platforms: filteredPlatforms,
            grand_total: grandTotal,
        };

        try {
            if (clientPlanData) {
                await updateClientPlan({ clientId, planData: payload }).unwrap();
                setSuccessMessage('Client plan updated successfully!');
            } else {
                await createClientPlan({ clientId, planData: payload }).unwrap();
                setSuccessMessage('Client plan created successfully!');
            }
            setErrorMessage(null);
        } catch (err) {
            setErrorMessage('Failed to assign the plan. Please try again.');
            setSuccessMessage(null);
        }

        // ✅ Auto-hide messages after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
            setErrorMessage(null);
        }, 3000);
    };

    if (isLoading || isLoadingTypes || isClientPlanLoading) {
        return <p>Loading...</p>;
    }

    const initialValues = {
        planName: clientPlanData?.plan_type?.toLowerCase() || '',
        platforms: clientPlanData?.platforms || {},
        attributes: clientPlanData?.addon_attributes || {}
    };

    return (
        <div className="section">

            <ToastContainer>
                {successMessage && (
                    <SuccessContainer
                        message={successMessage}
                        onClose={() => setSuccessMessage(null)}
                    />
                )}
                {errorMessage && (
                    <ErrorContainer
                        message={errorMessage}
                        onClose={() => setErrorMessage(null)}
                    />
                )}
            </ToastContainer>

            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue }) => {
                    const { totalAddOnsCost, grandTotal } = recalculateTotals(values);
                    return (
                        <Form>
                            <div className="row display-block-mob no-gutter gap-20 justify-center wrap">
                                <div className="col-xl-6 col-md-12">
                                    <div className="field-and-error form-section">
                                        <div className="field-container form-group">
                                            <SelectField
                                                label="Selected Plan"
                                                name="planName"
                                                placeholder="Select Plan"
                                                options={
                                                    assignedPlans
                                                        ? [
                                                            {
                                                                value: 'standard',
                                                                label: (
                                                                    <>
                                                                        <div className="option-title">
                                                                            <strong>Standard Plan</strong>
                                                                        </div>
                                                                        {showPrices && (
                                                                            <div className="option-details">
                                                                                ${assignedPlans[0]?.standard_netprice || 0} / month
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ),
                                                            },
                                                            {
                                                                value: 'advanced',
                                                                label: (
                                                                    <>
                                                                        <div className="option-title">
                                                                            <strong>Advanced Plan</strong>
                                                                        </div>
                                                                        {showPrices && (
                                                                            <div className="option-details">
                                                                                ${assignedPlans[0]?.advanced_netprice || 0} / month
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                ),
                                                            },
                                                        ]
                                                        : []
                                                }
                                                value={values.planName}
                                                onChange={(value) => {
                                                    setFieldValue('planName', value);
                                                    handlePlanChange(value);
                                                }}
                                                className={!selectedPlan ? 'highlight-border' : ''}
                                                disabled={role !== 'account_manager'}
                                                required
                                            />
                                            {!selectedPlan && <p className="warning-message">Please select a plan to unlock Add-Ons!</p>}

                                        </div>

                                        <div className="form-group mt-3">
                                            <label className='mb-1'> Add Ons </label>
                                            <div className="inclusions row gap-20 wrap no-gutter align-center">
                                                {isLoadingTypes ? (
                                                    <p>Loading...</p>
                                                ) : (
                                                    postTypes
                                                        .filter((postType) => postType.is_active)
                                                        .map((postType) => (
                                                            <div className='d-flex gap-10 align-center' key={postType.id}>
                                                                <label>{postType.name}</label>
                                                                <FieldAndError
                                                                    name={`attributes.${toSnakeCase(postType.name)}`} // Use dynamic attribute keys
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder={`00`}
                                                                    customClass=" border-input py-2"
                                                                    parentClass="m-0 w-60"
                                                                    disabled={!selectedPlan}
                                                                    onChange={(e) =>
                                                                        handleAddOnChange(postType.name, e.target.value, setFieldValue)
                                                                    }
                                                                />
                                                            </div>
                                                        ))
                                                )}
                                            </div>

                                        </div>

                                        <div className="form-group mt-3">
                                            <label>Platforms</label>
                                            <div className="platform-checkbox d-flex wrap gap-20 pt-1">
                                                {platforms
                                                    .filter(platform => {
                                                        const snakeCaseName = toSnakeCase(platform.name);
                                                        return !['facebook', 'instagram'].includes(snakeCaseName);
                                                    })
                                                    .map((platform) => {
                                                        const snakeCaseName = toSnakeCase(platform.name);
                                                        // const isPreSelected = ['facebook', 'instagram'].includes(snakeCaseName); // Check if preselected

                                                        return (
                                                            <label key={snakeCaseName} className="d-flex gap-20 chk-scochi">
                                                                <input
                                                                    type="checkbox"
                                                                    value={snakeCaseName}
                                                                    name={snakeCaseName}
                                                                    onChange={(e) =>
                                                                        handleCheckboxChange(platform.name, e.target.checked, setFieldValue)
                                                                    }
                                                                    checked={values.platforms[snakeCaseName]} // Always checked if preselected
                                                                    disabled={role !== 'account_manager' || !selectedPlan || platform.selected} // Disable preselected platforms
                                                                />
                                                                <img src={platform.icon} alt={platform.name} width="24" height="24" />
                                                            </label>
                                                        );
                                                    })}
                                            </div>
                                        </div>

                                        {role === 'account_manager' && (
                                            <button
                                                type="submit"
                                                className="button-secondary mt-5"
                                                disabled={isCreating || isUpdating}
                                            >
                                                {isCreating || isUpdating ? 'Submitting...' : 'Update Plan'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-xl-6 col-md-12">
                                    <div className="container-secondary-bg pxy-3">
                                        <div className="border-bottom pb-2">
                                            <div className="plan-name d-flex d-flex-space-between mb-1">
                                                <h3 className="plicn">Plan Inclusions</h3>
                                                <h4 className="plicn"> {showPrices ? `$${selectedPlan?.price || 0}` : ''}</h4>
                                            </div>
                                            <ul className="px-3">
                                                {selectedPlan ? (
                                                    Object.entries(selectedPlan?.attributes || {}).map(([key, value]) => (
                                                        <li key={key}>
                                                            {value} Social Media {formatString(key)}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="placeholder-message">
                                                        📝 Select a plan to see the amazing inclusions you&apos;ll get!
                                                    </li>
                                                )}
                                                {selectedPlan && (
                                                    <>
                                                        <li>Platforms: Facebook, Instagram</li>
                                                        <li>Validity: 30 Days</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                        <div className='Bill pt-2'>
                                            <div className='Add-ons d-flex d-flex-space-between mb-1'>
                                                <h4>Add Ons</h4>
                                                <h4>{showPrices ? `$${totalAddOnsCost}` : ''}</h4>
                                            </div>
                                            {selectedPlan ? (
                                                <>
                                                    {isLoadingTypes ? (
                                                        <p>Loading...</p>
                                                    ) : (
                                                        postTypes
                                                            .filter((postType) => postType.is_active)
                                                            .map((postType) => {
                                                                const snakeCaseName = toSnakeCase(postType.name); // Convert to snake_case for consistency
                                                                const unitPrice = pricingAttributes[snakeCaseName] || 0; // Fetch unit price
                                                                const quantity = values.attributes[snakeCaseName] || 0; // Get the quantity from Formik values
                                                                const totalCost = unitPrice * quantity; // Calculate total cost
                                                                return (
                                                                    <div className="services d-flex d-flex-space-between" key={postType.id}>
                                                                        <p>
                                                                            {postType.name} (${unitPrice} x {values.attributes[toSnakeCase(postType.name)] || 0})
                                                                        </p>
                                                                        <p>{showPrices ? `$${totalCost}` : ''}</p>
                                                                    </div>
                                                                );
                                                            })
                                                    )}
                                                    {Object.keys(values.platforms)
                                                        .filter((platformName) => values.platforms[platformName]) // Include only checked platforms
                                                        // .filter((platformName) => !['facebook', 'instagram'].includes(platformName)) // Exclude Facebook and Instagram
                                                        .map((platformName) => {
                                                            const key = Object.keys(pricingPlatforms).find((k) => k === platformName);
                                                            const unitPrice = pricingPlatforms[key] || 0; // Fetch unit price for the platform
                                                            return (
                                                                <div className="services d-flex d-flex-space-between" key={platformName}>
                                                                    <p>{formatString(platformName)}</p>
                                                                    <p>{showPrices ? `$${unitPrice}` : ''}</p>                                                                </div>
                                                            );
                                                        })}
                                                </>
                                            ) : (
                                                <p className="placeholder-message">
                                                    🎉 Choose a plan to customize your Add-Ons and unlock more possibilities!
                                                </p>
                                            )}
                                            {showPrices && (
                                                <div className='d-flex d-flex-space-between button-dark pxy-2 border-radius-10 mt-3'>
                                                    <p>Grand Total</p>
                                                    <p>${grandTotal}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default PlanForm;