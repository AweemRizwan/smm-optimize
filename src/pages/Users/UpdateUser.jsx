import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserForm from '../../components/Form/UserForm';
import { useGetUserByIdQuery, useUpdateUserMutation } from '../../services/api/userApiSlice';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const UpdateUser = () => {
    const { userId } = useParams();
    const [initialValues, setInitialValues] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'conten_writer',
        agency_name: '',
        agency_slug: '',
        profile: null,
    });

    const { data: user, isLoading } = useGetUserByIdQuery(userId);
    const [updateUser] = useUpdateUserMutation();
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (user) {
            setInitialValues({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                email: user?.email || '',
                role: user?.role || 'conten_writer',
                agency_name: user?.agency_name || '',
                agency_slug: user?.agency_slug || '',
                profile: user?.profile || null,
            })
        }
    }, [user])

    const handleUpdateUser = async (userData) => {
        try {
            console.log('userId', userId)
            const response = await updateUser({ id: userId, userData }).unwrap();
            setSuccessMessage(response.message || 'User updated successfully!');
            setErrorMessage(null);
        } catch (error) {
            const message = error?.data?.message || 'Failed to update user. Please try again.';
            setErrorMessage(message);
            setSuccessMessage(null);
        }
    }

    if (isLoading) {
        return <SkeletonLoader />
    }

    return (

        <div className='section'>
        <h2>View User</h2>
        <p className='mb-2'>{initialValues?.first_name} {initialValues?.last_name}</p>

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
            onSubmit={handleUpdateUser}
            submitLabel="Update User"
        />
    </div>

    )
}

export default UpdateUser
