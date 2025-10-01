import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCompleteTaskMutation, useGetTasksQuery } from '../../services/api/tasksApiSlice';
import { useGetClientCalendarsQuery, useGetClientInvoicesQuery } from '../../services/api/clientApiSlice';
import workflowMapping from '../../constants/workflowMapping';
import useCurrentUser from '../../hooks/useCurrentUser';
import { useGetMeetingsQuery } from '../../services/api/meetingApiSlice';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import SelectField from '../../components/Form/SelectField';



const StatusActionBar = () => {
    const { clientId } = useParams();
    const { role } = useCurrentUser(); // Get the user role
    const { data: invoices = [] } = useGetClientInvoicesQuery(clientId, {
        // don’t fire the query if clientId is undefined/null/empty
        skip: clientId == null,
    });
    const { data: calendars = [] } = useGetClientCalendarsQuery(clientId);
    
    const { data: meetingsList = [] } = useGetMeetingsQuery();


    const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
    const [selectedCalendarId, setSelectedCalendarId] = useState('');
    const [selectedMeetingId, setSelectedMeetingId] = useState('');

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');


    const { data: tasks, isLoading } = useGetTasksQuery(clientId, {
        skip: !clientId,
    });
    const [completeTask, { isLoading: isSubmitting }] = useCompleteTaskMutation();


    const filteredMeetings = meetingsList.filter(
        (meeting) => meeting.client.toString() === clientId
    );

    if (!clientId || isLoading) {
        return null;
    }

    // Filter for incomplete tasks
    const incompleteTasks = tasks?.filter((task) => !task.is_completed) || [];
    const currentTask = incompleteTasks[0]; // Get the first incomplete task

    const { id: taskId, task_type: taskType, assigned_to_name: assignedToName } = currentTask || {};

    const taskMapping = workflowMapping[taskType] || {};
    if (!taskMapping) {
        // console.log('taskType:', taskType);
        // console.log('workflowMapping:', workflowMapping);
    }
    const { status, buttons = [], allowedRoles = [] } = taskMapping;

    const filteredButtons = allowedRoles.includes(role) ? buttons : [];


    // Only show invoice selection for specific task types
    const showInvoiceDropdown =
        (taskType === 'invoice_verification' && role === 'account_manager') ||
        ((taskType === 'invoice_submission' || taskType === 'payment_confirmation') && role === 'accountant');

    // Define a mapping for task types that require a calendar selection
    const calendarTaskMapping = {
        create_strategy: 'marketing_manager',
        content_writing: 'content_writer',
        creatives_design: 'graphics_designer',
        smo_scheduling: 'marketing_assistant',
        approve_content_by_marketing_manager: 'marketing_manager',
        approve_content_by_account_manager: 'account_manager',
        approve_creatives_by_marketing_manager: 'marketing_manager',
        approve_creatives_by_account_manager: 'account_manager',
    };

    // Show calendar dropdown if current task type matches and role is as expected
    const showCalendarDropdown = calendarTaskMapping[taskType] === role;


    // Meeting dropdown: shown for these tasks when role is account_manager
    const meetingTaskMapping = {
        schedule_onboarding_meeting: 'account_manager',
        onboarding_meeting: 'account_manager',
        schedule_meeting: 'account_manager',
        schedule_brief_meeting: 'account_manager',
    };

    const showMeetingDropdown = meetingTaskMapping[taskType] === role;

    // Handle button click
    const handleButtonClick = async (status) => {
        if (showInvoiceDropdown && !selectedInvoiceId) {
            setErrorMessage('Please select an invoice before completing the task.');
            // clearMessages();
            return;
        }
        if (showCalendarDropdown && !selectedCalendarId) {
            setErrorMessage('Please select a calendar before completing the task.');
            // clearMessages();
            return;
        }
        if (showMeetingDropdown && !selectedMeetingId) {
            setErrorMessage('Please select a meeting before completing the task.');
            // clearMessages();
            return;
        }

        const payload = { taskId, status };

        if (showInvoiceDropdown) {
            payload.invoice_id = selectedInvoiceId;
        }

        if (showCalendarDropdown) {
            payload.calendar_id = selectedCalendarId;
        }

        if (showMeetingDropdown) {
            payload.meeting_id = selectedMeetingId;
        }


        try {
            await completeTask(payload).unwrap();
            setSuccessMessage(`Task marked as '${status}' successfully.`);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage(error?.data?.error || 'Something went wrong');
            setSuccessMessage('');
        }
    };

    return (
        <div className="status-action-bar d-flex gap-20 align-center my-4 wrap">
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


            <div className="status">
                Status: <button className='button-secondary-light pointer-none px-3'>{status || 'Not Available'}</button>
            </div>
            <div className="status">
                Assigned to: <button className='button-secondary-light pointer-none px-3'>{assignedToName || 'No Assignee Available at the Moment'} </button>
            </div>

            {showInvoiceDropdown && (
                <SelectField
                    // label="Select Invoice:"
                    name="invoice-select"
                    placeholder="Select Invoice"
                    value={selectedInvoiceId}
                    onChange={setSelectedInvoiceId} // <-- pass value directly
                    options={invoices.map((invoice) => ({
                        value: invoice.id,
                        label: `${invoice.billing_from} - ${invoice.billing_to}`,
                    }))}
                    className="teaf1"
                    margincls="margin-auto-8"
                    smallicon="width-1rem"
                />
            )}

            {showCalendarDropdown && (
                <div className="calendar-selection">
                    <SelectField
                        name="calendar-select"
                        value={selectedCalendarId}
                        onChange={setSelectedCalendarId} // or if SelectField passes just value, use: onChange={setSelectedCalendarId}
                        placeholder="-- Select a Calendar --"
                        options={calendars.map((calendar) => ({
                            value: calendar.calendar_id,
                            label: calendar.month_name,
                        }))}
                        className="teaf1"
                        margincls="margin-auto-8"
                        smallicon="width-1rem"
                    />
                </div>
            )}

            {/* Conditionally render the meeting dropdown */}
            {showMeetingDropdown && (
                <div className="meeting-selection">
                    <SelectField
                        // label="Select Meeting"
                        name="meeting-select"
                        placeholder="-- Select a Meeting --"
                        options={filteredMeetings.map(meeting => ({
                            key: meeting.id,
                            value: meeting.id,
                            label: meeting.meeting_name
                        }))}
                        value={selectedMeetingId || ''} // Ensure value is never undefined
                        onChange={(e) => {
                            // Handle both direct value and event object cases
                            const value = e?.target?.value ?? e?.value ?? e;
                            setSelectedMeetingId(value);
                        }}
                        className="teaf1"
                        margincls="margin-auto-8"
                        smallicon="width-1rem"
                    />
                </div>
            )}


            <div className="actions">
                {filteredButtons.map((button) => {
                    const isChange = button.status === 'changes_required';
                    return (
                        <button
                            key={button.label}
                            onClick={() => handleButtonClick(button.status)}
                            disabled={isSubmitting}
                            className={[
                                'button',
                                'ml-2',
                                isChange ? 'button-danger' : 'button-primary',
                                isSubmitting && 'disabled',
                            ]
                                .filter(Boolean)
                                .join(' ')}
                        >
                            {button.label}
                        </button>
                    );
                })}
            </div>
        </div >
    );
};

export default StatusActionBar;
