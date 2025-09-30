import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DynamicTable from '../../components/shared/DynamicTable'; // Import the DynamicTable component
import { FaPlusSquare } from 'react-icons/fa';
import Modal from '../../components/shared/ReUsableModal'; // Import the Modal component
import { useGetClientCalendarsQuery, useCreateClientCalendarMutation, useDeleteClientCalendarMutation } from '../../services/api/clientApiSlice';
import useCurrentUser from '../../hooks/useCurrentUser';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'
import { formatMonthYear } from '../../utils/generalUtils';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const ContentCalendars = () => {
    const { role } = useCurrentUser(); // Get the user role
    const { clientId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [monthYear, setMonthYear] = useState(''); // State for the input field
    const { data: calendars = [], isLoading } = useGetClientCalendarsQuery(clientId);
    const [createClientCalendar, { isLoading: isCreating }] = useCreateClientCalendarMutation();
    const [deleteClientCalendar] = useDeleteClientCalendarMutation();

    // Success & Error Messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Delete confirmation modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [calendarToDelete, setCalendarToDelete] = useState(null);

    // Transform the API data so that each calendar has an "id" property.
    const processedCalendars = calendars.map((calendar) => ({
        ...calendar,
        id: calendar.calendar_id, // Use calendar_id as id
    }));

    // Generate the client view URL
    const generateClientViewPath = (calendar) => {
        const domain = import.meta.env.VITE_DOMAIN || window.location.origin; // Use Vite's env variable or fallback
        const accountManagerName = encodeURIComponent(calendar.account_manager_username);
        const businessName = encodeURIComponent(calendar.client_business_name);
        const yearMonth = encodeURIComponent(calendar.month_name);
        return `${domain}/${accountManagerName}/${businessName}/${yearMonth}`;
    };

    // Define columns for the DynamicTable
    const columns = [
        { key: 'month_name', label: 'Month - Year', className: 'width-25p' },
        {
            key: 'Calendar',
            label: 'Calendar (Client View)',
            className: 'width-50p',
            render: (calendar) => {
                const fullUrl = generateClientViewPath(calendar);
                return (
                    <Link to={fullUrl} className="text-link">
                        {fullUrl}
                    </Link>
                );
            },
        },
    ];

    // Render actions (View and Delete buttons)
    const renderActions = (calendar) => (
        <div className="gap-10 row">
            <Link
                to={`/clients/${clientId}/content-calendars/calendar/${calendar.calendar_id}`}
                className="view-btn button-primary table-btns-desig table-button-half"
            >
                View
            </Link>
            {role === 'marketing_manager' && (
                <button
                    className="delete-btn button-danger table-btns-desig table-button-half"
                    onClick={() => openDeleteModal(calendar)}
                >
                    Delete
                </button>
            )}
        </div>
    );

    // Open the modal
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Close the modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMonthYear(''); // Clear the input field on close
    };

    // Handle input change for month & year
    const handleInputChange = (date) => {
        setMonthYear(date);
    };

    const handleCreateCalendar = async () => {
        if (!monthYear) {
            setErrorMessage('Please enter Month & Year');
            setSuccessMessage(null);
            return;
        }
        try {
            const formattedMonth = formatMonthYear(monthYear);
            // Check for duplicate month-year
            const duplicate = processedCalendars.find(
                (calendar) => calendar.month_name === formattedMonth
            );
            if (duplicate) {
                setErrorMessage(`A calendar for ${formattedMonth} already exists.`);
                setSuccessMessage(null);
                return;
            }
            await createClientCalendar({ clientId, calendarData: { month_name: formattedMonth } }).unwrap();
            setSuccessMessage('Calendar created successfully.');
            setErrorMessage(null);
            handleCloseModal();
        } catch (error) {
            console.error('Failed to create calendar:', error);
            setErrorMessage('Failed to create calendar. Please try again.');
            setSuccessMessage(null);
        }
    };

    // Delete modal handlers
    const openDeleteModal = calendar => {
        setCalendarToDelete(calendar);
        setIsDeleteModalOpen(true);
    };

    // Delete calendar
    const handleDeleteConfirm = async () => {
        if (!calendarToDelete) return;
        try {
            await deleteClientCalendar({ clientId, calendarId: calendarToDelete.calendar_id }).unwrap();
            setSuccessMessage('Calendar deleted successfully.');
            setErrorMessage(null);
        } catch (error) {
            console.error('Failed to delete calendar:', error);
            setErrorMessage('Failed to delete calendar. Please try again.');
            setSuccessMessage(null);
        }
        setIsDeleteModalOpen(false);
        setCalendarToDelete(null);
    };

    return (
        <div className="section text-center content-calendars-ui">

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
                {isLoading ? (
                    <p>Loading calendars...</p>
                ) : processedCalendars.length === 0 ? (
                    <p style={{ padding: '20px', fontSize: '16px', color: '#666' }}>
                        No content calendars available at the moment.
                    </p>
                ) : (
                    <DynamicTable parentClass='mb-2' columns={columns} data={processedCalendars} renderActions={(row) => renderActions(row)} />
                )}
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    title="Create Content Calendar"
                    buttonText={isCreating ? 'Creating...' : 'Create Calendar'}
                    onConfirm={handleCreateCalendar}
                >
                    <div className="select-month-year">
                        <div className="field-and-error">
                            <div className="field-container form-group text-left">
                                <label>Month & Year</label>
                                <DatePicker
                                    selected={monthYear}
                                    onChange={(date) => handleInputChange(date)}
                                    dateFormat="MMMM yyyy"
                                    showMonthYearPicker
                                    placeholderText="Select Month & Year"
                                    className="month-year-input border-input"
                                />
                            </div>
                        </div>
                    </div>
                </Modal>
                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && calendarToDelete && (
                    <Modal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        title="Confirm Delete"
                        buttonText="Delete"
                        onConfirm={handleDeleteConfirm}
                    >
                        <p>Are you sure you want to delete the calendar for <strong>{calendarToDelete.month_name}</strong>?</p>
                    </Modal>
                )}
            </div>
            {role === 'marketing_manager' && (
                <button className="button-secondary " onClick={handleOpenModal}>
                    <FaPlusSquare /> Add Calendar
                </button>
            )}
        </div>
    );
};

export default ContentCalendars;