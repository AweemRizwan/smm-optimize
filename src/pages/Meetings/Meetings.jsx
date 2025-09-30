import { useState } from 'react';
import DynamicTable from '../../components/shared/DynamicTable'
import { useGetMeetingsQuery, useUpdateMeetingMutation } from '../../services/api/meetingApiSlice';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import { formatDate, formatString } from '../../utils/generalUtils';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const Meetings = () => {
    const { data: meetings = [], isLoading, isError, error, refetch } = useGetMeetingsQuery();
    const [updateMeeting] = useUpdateMeetingMutation();
    const { role } = useCurrentUser(); // Get the current user's role

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Handle action button click
    const onActionClick = async (id) => {
        try {
            await updateMeeting({ id, is_completed: true }).unwrap();
            setSuccessMessage('Meeting marked as completed successfully!');
            setErrorMessage(null);
            refetch();
        } catch (err) {
            setErrorMessage('Failed to update the meeting.');
            setSuccessMessage(null);
            console.error('Failed to update the meeting:', err);
        }
    };

    // Define columns for the DynamicTable
    const columns = [
        { key: 'date', label: 'Date', className: 'min-width-200' },
        { key: 'time', label: 'Time', className: 'min-width-200' },
        { key: 'meeting_name', label: 'Meeting Name', className: 'min-width-200' },
        { key: 'client_name', label: 'Clients', className: 'min-width-200' },
        { key: 'meeting_link', label: 'Meeting Links', className: 'min-width-200' },
        { key: 'Assignees', label: 'Assignees', className: 'min-width-300' },
    ]

    // Format meeting data
    const formattedMeetings = meetings.map((meeting) => ({
        ...meeting,
        date: formatDate(meeting.date, true), // Format date with time
    }));

    // Custom renderer for the "Assignees" column
    const renderAssignees = (row) => (
        <div className='d-flex flex-direction gap-10'>
            {row.details && row.details.filter(assignee => assignee !== null).map((assignee, index) => (
                <button key={index} className="view-btn button-secondary-light pointer-none">
                    {formatString(assignee)}
                </button>
            ))}
        </div>
    )

    // Custom renderer for the "Action" column
    const renderActions = (row) => (
        <div className='min-width-300'>
            {row.is_completed ? (
                <button className="view-btn button-secondary" disabled>
                    Completed
                </button>
            ) : (
                <button
                    className="view-btn button-accent-2"
                    onClick={() => onActionClick(row.id)}
                    disabled={role !== 'account_manager'} 
                >
                    Mark as Completed
                </button>
            )}
        </div>
    ) 

    if (isLoading) {
        return (
            <div className="section" data-testid="skeleton-loader">
                <SkeletonLoader count={5} height={30} width="100%" style={{ marginBottom: '10px' }} />
            </div>
        );
    }

    if (isError) {
        return <div>Error: {error?.message || 'Failed to load meetings.'}</div>;
    }

    

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

            {/* Error Handling */}
            {isError && <div className="error-container">Error: {error?.message || 'Failed to load meetings.'}</div>}

            <div className='max-height'>
                <DynamicTable
                    columns={columns}
                    data={formattedMeetings}
                    renderActions={renderActions}
                    renderColumnContent={{ Assignees: renderAssignees }}
                />
            </div>
        </div>
    )
}

export default Meetings