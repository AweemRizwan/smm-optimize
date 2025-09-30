import { useState } from 'react';
import UserForm from '../../components/Form/UserForm';
import { useCreateUserMutation } from '../../services/api/userApiSlice';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const CreateUser = () => {
    const [successMessage, setSuccessMessage] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [createUser] = useCreateUserMutation()

    const initialValues = {
        first_name: '',
        last_name: '',
        email: '',
        role: 'content_writer',
        agency_name: '',
        agency_slug: '',
        profile: null,
    };


    const handleCreateUser = async (userData) => {
        try {
            // Call the mutation with FormData
            const response = await createUser(userData).unwrap();
            setSuccessMessage(response.message || 'User created successfully!');
            setErrorMessage(null);
        } catch (error) {
            // Check if the error response contains a message from the server
            const message = error?.data?.message || 'Failed to create user. Please try again.';
            setErrorMessage(message);
            setSuccessMessage(null);
        }
    };


    return (

        <div className='section'>
            <h2>Create User</h2>
            <p className='mb-2'>New User</p>

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

            <UserForm
                initialValues={initialValues}
                onSubmit={handleCreateUser}
                submitLabel="Create New User"
            />
        </div>

    )
}

export default CreateUser