import { useState } from 'react';
import TeamForm from '../../components/Form/TeamForm'
import { useCreateTeamMutation } from '../../services/api/teamApiSlice'
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const CreateTeamPage = () => {
    const [createTeam, { isError, error, isSuccess }] = useCreateTeamMutation();

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const initialValues = {
        teamName: '',
        marketingManager: '',
        marketingAssistant: '',
        graphicDesigner: '',
        contentWriter: '',
    }

    const handleSubmit = async (values) => {
        try {
            // Prepare the payload for the API
            const payload = {
                team: {
                    name: values.teamName,
                },
                members: [
                    { user_id: values.marketingManager },
                    { user_id: values.marketingAssistant },
                    { user_id: values.graphicDesigner },
                    { user_id: values.contentWriter },
                ].filter(member => member.user_id) // Remove empty values
            };

            // Call the createTeam mutation
            await createTeam(payload).unwrap();
            setSuccessMessage('Team created successfully!');
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(error?.data?.message || 'Failed to create team.');
            setSuccessMessage(null);
            console.error('Failed to create team:', error);
        }
    };

    return (
        <>
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
                <TeamForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    heading="Create Team"
                    subHeading="New Team"
                    buttontext="Create Team"
                />
            </div>
        </>
    )
}

export default CreateTeamPage
