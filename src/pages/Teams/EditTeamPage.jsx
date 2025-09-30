import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetTeamByIdQuery, useUpdateTeamMutation } from '../../services/api/teamApiSlice';
import TeamForm from '../../components/Form/TeamForm';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const EditTeamPage = () => {
    const { teamId } = useParams(); // Get team ID from URL
    const [successMessage, setSuccessMessage] = useState(null);
    const { data: team, isLoading, isError, error } = useGetTeamByIdQuery(teamId);
    const [updateTeam, { isSuccess }] = useUpdateTeamMutation();
    // State for success and error messages
    const [errorMessage, setErrorMessage] = useState(null);


    // Set initial values for the form
    const initialValues = {
        teamName: team?.team?.name || '',
        marketingManager: team?.members?.find(member => member.role === 'Marketing Manager')?.user_id || '',
        marketingAssistant: team?.members?.find(member => member.role === 'Marketing Assistant')?.user_id || '',
        graphicDesigner: team?.members?.find(member => member.role === 'Graphics Designer')?.user_id || '', // Fixed role name
        contentWriter: team?.members?.find(member => member.role === 'Content Writer')?.user_id || '',
    }

    const handleSubmit = async (values) => {
        try {
            const payload = {
                team: {
                    name: values.teamName,
                    // Include other team fields as needed
                },
                members: [
                    { user_id: values.marketingManager, role: 'Marketing Manager' },
                    { user_id: values.marketingAssistant, role: 'Marketing Assistant' },
                    { user_id: values.graphicDesigner, role: 'Graphics Designer' },
                    { user_id: values.contentWriter, role: 'Content Writer' },
                ]
            }
            await updateTeam({ id: teamId, ...payload }).unwrap();
            setSuccessMessage('Team updated successfully!');
            setErrorMessage(null);
        } catch (error) {
            console.error('Failed to update the team:', error);
            setErrorMessage(error?.data?.message || 'Failed to create team.');
            setSuccessMessage(null);

        }
    }
    if (isLoading) {
        return (
            <div className='section'>
                <SkeletonLoader count={1} height={50} width="100%" />
            </div>
        );
    }

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
                    heading="Edit Team"
                    subHeading={team?.team?.name}
                    buttontext="Upadte Team"
                />
            </div>
        </>
    );
};

export default EditTeamPage;
