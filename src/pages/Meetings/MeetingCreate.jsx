import { useState } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FieldAndError from '../../components/Form/FieldAndError'
import { useCreateMeetingMutation } from '../../services/api/meetingApiSlice'
import { useGetClientsQuery } from '../../services/api/clientApiSlice'
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import SelectField from '../../components/Form/SelectField'
// import SelectField from './SelectField';

const MeetingCreate = () => {
    const [createMeeting] = useCreateMeetingMutation()
    const { data: clients, isLoading: isClientsLoading } = useGetClientsQuery()
    const [successMessage, setSuccessMessage] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)

    const initialValues = {
        date: '',
        time: '',
        meeting_name: '',
        client: '',
        assignee_type: '',        // ← added
        meeting_link: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    const validationSchema = Yup.object({
        date: Yup.string().required('Date is required'),
        time: Yup.string().required('Time is required'),
        meeting_name: Yup.string().required('Meeting name is required'),
        client: Yup.string().required('Client is required'),
        assignee_type: Yup.string().required('Assignee type is required'),  // ← added
        meeting_link: Yup.string().url('Invalid URL').required('Link is required'),
    })

    // Form submission handler
    const handleSubmit = async (values, { resetForm }) => {
        try {
            await createMeeting(values).unwrap();
            setSuccessMessage('Meeting created successfully!');
            setErrorMessage(null);
            resetForm(); // Reset form after success
        } catch (err) {
            setErrorMessage('Failed to create meeting. Please try again.');
            setSuccessMessage(null);
            console.error('Error creating meeting:', err);
        }
    };

    return (
        <div className="section">
            <h2 className='mb-5'>Meeting Form</h2>

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
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                validateOnMount    // ← ensures isValid is set on mount
            >
                {({ isValid, isSubmitting }) => (
                    <Form>
                        <div className='row wrap gap-10 m-0'>
                            <div className='col-md-6'>
                                <FieldAndError
                                    name="date"
                                    label="Date"
                                    type="date"
                                    placeholder="Enter date"
                                    customClass="border-input titlt-light"
                                />
                            </div>
                            <div className='col-md-6'>
                                <FieldAndError
                                    name="time"
                                    label="Time"
                                    type="time"
                                    placeholder="Enter time"
                                    customClass="border-input titlt-light"
                                />
                            </div>
                            <div className='col-md-6'>
                                <FieldAndError
                                    name="meeting_name"
                                    label="Meeting Name"
                                    type="text"
                                    placeholder="Enter meeting name"
                                    customClass="border-input titlt-light"
                                />
                            </div>
                            <div className='col-md-6'>
                                <SelectField
                                    label="Client"
                                    name="client"
                                    placeholder="Select Client"
                                    options={clients || []}
                                    isLoading={isClientsLoading}
                                    getOptionLabel={c => c.business_name}
                                    getOptionValue={c => c.id}
                                    // className="border-input"
                                    labelclassName="m-0"
                                />
                            </div>
                            <div className='col-md-6'>
                                <SelectField
                                    label="Assignee Type"
                                    name="assignee_type"
                                    placeholder="Select Assignee"
                                    options={[
                                        { value: 'team', label: 'Team' },
                                        { value: 'marketing_manager', label: 'Marketing Manager' }
                                    ]}
                                    getOptionLabel={o => o.label}
                                    getOptionValue={o => o.value}
                                    labelclassName="m-0"
                                />
                            </div>
                            <div className='col-md-6'>
                                <FieldAndError
                                    name="meeting_link"
                                    label="Meeting Link"
                                    type="url"
                                    placeholder="Enter meeting link"
                                    customClass="border-input titlt-light"
                                />
                            </div>
                            <button
                                type="submit"
                                className="button-dark"
                                disabled={!isValid || isSubmitting}  // ← disabled until valid
                            >
                                {isSubmitting ? 'Submitting…' : 'Submit'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default MeetingCreate