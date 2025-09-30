import { useState, useMemo } from 'react';
import { Formik, Form } from 'formik';
import FieldAndError from '../../components/Form/FieldAndError';
import { useCreatePlanMutation } from '../../services/api/planApiSlice';
import { useGetPostAttributesByTypeQuery } from '../../services/api/postAttributeApiSlice';
import platforms from "../../constants/platforms";
import { sanitizeName, toSnakeCase } from '../../utils/generalUtils';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';


const CreatePlanSets = () => {
    const [createPlan] = useCreatePlanMutation();
    const { data: postTypes = [], isLoading: isLoadingTypes } = useGetPostAttributesByTypeQuery('post_type');

    const [platformAddOns] = useState({
        // facebook: 0,
        // instagram: 0,
        tiktok: 0,
        snapchat: 0,
        twitter: 0,
        linkedin: 0,
        youtube: 0,
        pinterest: 0
    });

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);


    // Generate initial values dynamically based on post types
    const initialValues = useMemo(() => {
        const defaultAttributes = postTypes.filter((postType) => postType.is_active).reduce((acc, postType) => {
            const sanitized = sanitizeName(postType.name);
            acc[sanitized] = 0; // Default value
            return acc;
        }, {});

        return {
            plan_name: '',
            standard_attributes: { ...defaultAttributes },
            standard_plan_inclusion: '',
            standard_netprice: '',
            advanced_attributes: { ...defaultAttributes },
            advanced_plan_inclusion: '',
            advanced_netprice: '',
            pricing_attributes: { ...defaultAttributes },
            pricing_platforms: { ...platformAddOns }
        };
    }, [postTypes, platformAddOns]);

    const handleSavePlanSet = async (values, { resetForm }) => {
        try {
            const result = await createPlan(values).unwrap();
            setSuccessMessage(result.message || 'Plan Set created successfully!');
            setErrorMessage(null);
            resetForm(); // Reset form after successful submission
        } catch (error) {
            setErrorMessage(error?.data?.message || 'Failed to create Plan Set. Please try again.');
            setSuccessMessage(null);
        }
    };



    return (
        <>
            <div className='mb-2'>
                <h2>Create Plan Sets</h2>
            </div>
            <div className='section d-flex justify-center'>
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
                    enableReinitialize // Reinitialize form values when initialValues change
                    onSubmit={handleSavePlanSet}
                >
                    {() => (
                        <Form>
                            <div className="form-group mb-2 Create-plan-set">
                                <div className='col-md-6'>
                                    <FieldAndError
                                        name="plan_name"
                                        label="Plan Set Name"
                                        placeholder="Lorem Ipsum"
                                        customClass="w-100 border-input"
                                        parentClass="d-flex flex-direction-row align-center relative"
                                    />
                                </div>
                            </div>

                            <div className='row flex-direction-row wrap Create-plan-set gap-10 justify-center'>
                                {/* Standard Plan */}
                                <div className="plan standard-plan col-md-4 section">
                                    <h2 className='mb-2 text-center'>Standard Plan</h2>
                                    {isLoadingTypes ? (
                                        <p>Loading...</p>
                                    ) : (
                                        postTypes
                                            .filter((postType) => postType.is_active)
                                            .map((postType) => (
                                                <FieldAndError
                                                    key={postType.id}
                                                    name={`standard_attributes.${sanitizeName(postType.name)}`}
                                                    label={postType.label || postType.name}
                                                    type="number"
                                                    customClass="w-100 border-input"
                                                    parentClass="d-flex align-center flex-direction-row-reverse relative plan-card"
                                                />
                                            ))
                                    )}
                                    <FieldAndError
                                        name="standard_plan_inclusion"
                                        label="Plan Inclusions"
                                        type="textarea"
                                        rows={10}
                                        customClass="w-100 border-input"
                                        parentClass="d-block relative"
                                    />
                                    <FieldAndError
                                        name="standard_netprice"
                                        label="Price/Month"
                                        type="number"
                                        customClass="width-100 border-input"
                                        parentClass="d-flex flex-direction-row gap-10 align-center pri-mon"
                                    />
                                </div>

                                {/* Advanced Plan */}
                                <div className="plan advanced-plan col-md-4 section">
                                    <h2 className='mb-2 text-center'>Advanced Plan</h2>
                                    {isLoadingTypes ? (
                                        <p>Loading...</p>
                                    ) : (
                                        postTypes
                                            .filter((postType) => postType.is_active)
                                            .map((postType) => (
                                                <FieldAndError
                                                    key={postType.id}
                                                    name={`advanced_attributes.${sanitizeName(postType.name)}`}
                                                    label={postType.label || postType.name}
                                                    type="number"
                                                    customClass="w-100 border-input"
                                                    parentClass="d-flex align-center flex-direction-row-reverse plan-card relative"
                                                />
                                            ))
                                    )}
                                    <FieldAndError
                                        name="advanced_plan_inclusion"
                                        label="Plan Inclusions"
                                        type="textarea"
                                        rows={10}
                                        customClass="w-100 border-input"
                                        parentClass="d-block"
                                    />
                                    <FieldAndError
                                        name="advanced_netprice"
                                        label="Price/Month"
                                        type="number"
                                        customClass="width-100 border-input"
                                        parentClass="flex-direction-row gap-10 d-flex align-center pri-mon"
                                    />
                                </div>

                                {/* Add Ons Section */}
                                <div className=" pri-mon add-ons-container col-md-4 px-3">
                                    <div className="creative-add-ons">
                                        <h2 className='mb-2 mt-3'>Creative Add Ons</h2>
                                        {isLoadingTypes ? (
                                            <p>Loading...</p>
                                        ) : (
                                            postTypes
                                                .filter((postType) => postType.is_active)
                                                .map((postType) => (
                                                    <FieldAndError
                                                        key={postType.id}
                                                        name={`pricing_attributes.${sanitizeName(postType.name)}`}
                                                        label={postType.label || postType.name}
                                                        type="number"
                                                        customClass="border-input width-50 pxy-10"
                                                        parentClass="add-on-item d-flex align-center"
                                                    />
                                                ))
                                        )}
                                    </div>

                                    {/* Platform Add Ons */}
                                    <div className="platform-add-ons">
                                        <h2 className='mb-2'>Platform Add Ons</h2>
                                        <div className='row no-gutter'>
                                            {[0, 4].map((start) => (
                                                <div key={start} className='col-md-6'>
                                                    {platforms
                                                        .filter(platform => {
                                                            const platformKey = toSnakeCase(platform.name);
                                                            return !['facebook', 'instagram'].includes(platformKey);
                                                        })
                                                        .slice(start, start + 4)
                                                        .map((platform) => (
                                                            <div key={platform.name} className="d-flex align-center add-on-item gap-10 mb-1">
                                                                <img src={platform.icon} alt={platform.name} className="platform-img" />
                                                                <FieldAndError
                                                                    name={`pricing_platforms.${toSnakeCase(platform.name)}`}
                                                                    type="number"
                                                                    customClass="border-input width-50 pxy-10"
                                                                    parentClass="m-0"
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button className='button-secondary' type="submit">Save Plan Set</button>
                            </div>
                        </Form>
                    )}
                </Formik>



            </div>
        </>
    );
};

export default CreatePlanSets;
