import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { FaEye, FaPlusSquare, FaSearch } from 'react-icons/fa'; // Import the view icon and search icon
import { RxCrossCircled } from "react-icons/rx";

import debounce from 'lodash.debounce';

import DynamicTable from '../../components/shared/DynamicTable';
import FieldAndError from '../../components/Form/FieldAndError'; // Adjust the import path as necessary
import { useAssignAccountManagersMutation, useGetPlansQuery, useRemoveAccountManagerMutation, useSearchUnassignedAccountManagersMutation } from '../../services/api/planApiSlice'; // Import the hook
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';


const PlanSets = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [activeRowIndex, setActiveRowIndex] = useState({}); // Track which rows have an active dropdown

    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Use the hook to get plans data
    const { data: plans = [], isLoading, isError, error } = useGetPlansQuery();
    const [searchUnassignedAccountManagers] = useSearchUnassignedAccountManagersMutation();
    const [assignAccountManagers] = useAssignAccountManagersMutation();
    const [removeAccountManager] = useRemoveAccountManagerMutation();

    // Debounce function
    const debouncedSearch = debounce(async (value, rowIndex) => {
        if (!value) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await searchUnassignedAccountManagers({ search: value }).unwrap();
            setSearchResults(response);
            setActiveRowIndex((prevState) => ({
                ...prevState,
                [rowIndex]: true,
            }));
        } catch (err) {
            console.error('Failed to fetch unassigned account managers: ', err);
            setErrorMessage('Failed to fetch account managers.');
        }
    }, 500);

    const handleFocus = (rowIndex) => {
        setActiveRowIndex((prevState) => ({
            ...prevState,
            [rowIndex]: true,
        }));
    };

    const handleBlur = (rowIndex) => {
        // Add a small delay to allow for dropdown click events
        setTimeout(() => {
            setActiveRowIndex((prevState) => ({
                ...prevState,
                [rowIndex]: false,
            }));
        }, 150);
    };

    const handleSearchChange = (value, rowIndex) => {
        debouncedSearch(value, rowIndex);
    };

    useEffect(() => {
        return () => {
            debouncedSearch.cancel(); // Cancel debounced calls on component unmount
        };
    }, [debouncedSearch]);

    const columns = [
        { key: 'plan_name', label: 'Plan Set Name' },
        { key: 'uuid', label: 'Plan Set ID', className: 'min-width-200' },
        {
            key: 'standard_netprice',
            label: 'Standard Plan',
            className: 'min-width-200',
            render: (row) => formatPrice(row.standard_netprice),
        },
        {
            key: 'advanced_netprice',
            label: 'Advanced Plan',
            className: 'min-width-200',
            render: (row) => formatPrice(row.advanced_netprice),
        },
        { key: 'account_managers', label: 'Assigned To', className: 'min-width-300' },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(price);
    };

    const handleAssignManager = async (planId, accountManager) => {
        try {
            await assignAccountManagers({ id: planId, accountManagers: [accountManager] }).unwrap();
            setSuccessMessage('Account manager assigned successfully.');
            setErrorMessage(null);
        } catch (err) {
            setErrorMessage('Failed to assign account manager.');
            setSuccessMessage(null);
        }
    };

    const handleRemoveManager = async (planId, accountManagerId) => {
        try {
            await removeAccountManager({ planId, accountManagerId }).unwrap();
            setSuccessMessage('Account manager removed successfully.');
            setErrorMessage(null);
        } catch (err) {
            setErrorMessage('Failed to remove account manager.');
            setSuccessMessage(null);
        }
    };

    const renderAssignedToColumn = (row, rowIndex) => (
        <div className='d-flex flex-direction-row-reverse gap-20 align-center'>
            <Link className='button border-radius-10 pxy-10 d-flex' to={`/settings/plan-sets/${row.id}/view`}>
                <FaEye />
            </Link>
            <Formik
                initialValues={{ search: '' }}
                onSubmit={() => { }}
            >
                {({ setFieldValue }) => (
                    <Form className="d-flex align-center">
                        <div className="position-relative search-input">
                            <FaSearch className="search-icon position-absolute" />
                            <FieldAndError
                                name="search"
                                placeholder="Search"
                                customClass="border-input pxy-10 pl-30"
                                parentClass="m-0"
                                autoComplete="off"
                                onFocus={() => handleFocus(rowIndex)} // Set the active row index on focus
                                onBlur={() => handleBlur(rowIndex)} // Hide dropdown on blur
                                onChange={(e) => {
                                    setFieldValue('search', e.target.value);
                                    handleSearchChange(e.target.value, rowIndex);
                                }} // Handle input change to search
                            />
                            {activeRowIndex[rowIndex] && ( // Show dropdown only for the focused row
                                <div className="dropdown position-absolute text-left pxy-10 z-index-1000">
                                    {searchResults.length > 0 && (
                                        <>
                                            <p>Results</p>
                                            <ul className="dropdown-list">
                                                {searchResults.map((search, index) => (
                                                    <li
                                                        key={index}
                                                        className="dropdown-item"
                                                        onClick={() => handleAssignManager(row.id, search.id)} // Pass plan ID and manager
                                                    >
                                                        {search.first_name} {search.last_name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                    <p>Assigned to</p>
                                    <ul className="dropdown-list">
                                        {Array.isArray(row.account_managers) && row.account_managers.length > 0 && row.account_managers.map((manager, index) => (
                                            <li key={index} className="dropdown-item d-flex d-flex-space-between">
                                                <span>{manager.name}</span>
                                                <span
                                                    onClick={() => handleRemoveManager(row.id, manager.id)}
                                                    className="cross-icon"
                                                >
                                                    <RxCrossCircled />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );

    return (
        <>
            <div className='d-flex-space-between d-flex flex-direction-row mb-2'>
                <h2>Plan Sets</h2>
                <Link to="/settings/plan-sets/new">
                    <button className="button-primary gap-20 align-center d-flex">
                        Create Plan Sets <FaPlusSquare />
                    </button>
                </Link>
            </div>

            <div className='section'>
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

                <div className='max-height'>
                    <DynamicTable
                        columns={columns}
                        data={plans}
                        renderColumnContent={{ account_managers: renderAssignedToColumn }}
                    />
                </div>
            </div>
        </>
    );
};

export default PlanSets;
