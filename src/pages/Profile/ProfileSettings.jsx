import { useState, useEffect } from 'react'
import { useGetProfileQuery, useUpdateProfileMutation } from '../../services/api/profileApiSlice'
import UserForm from '../../components/Form/UserForm';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const ProfileSettings = () => {
    const { data: profile, isError, error, refetch } = useGetProfileQuery()
    const [updateProfile] = useUpdateProfileMutation();

    // State for form initial values
    const [initialValues, setInitialValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: 'conten_writer',
        agency_name: '',
        agency_slug: '',
        profile: null,
    });

    // State for feedback messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        if (profile) {
            setInitialValues({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                email: profile.email || '',
                role: profile.role || 'content_writer',
                agency_name: profile.agency_name || '',
                agency_slug: profile.agency_slug || '',
                profile: profile.profile || null,
            })
        }
    }, [profile])


    const handleProfileSettings = async (formData) => {
        try {
            const response = await updateProfile(formData).unwrap();
            console.log('Profile Updated:', response);
            setSuccessMessage('Profile updated successfully!');
            setErrorMessage(null);
            refetch();
        } catch (err) {
            console.error('Error updating profile:', err);
            setErrorMessage('Failed to update profile. Please try again.');
            setSuccessMessage(null);
        }
    };

    return (
        <div className='section'>
            <h2>Profile Settings</h2>

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

            {/* API Fetch Error Message */}
            {isError && <div className="error-container">Error: {error?.message || 'Failed to load profile.'}</div>}

            <UserForm
                initialValues={initialValues}
                onSubmit={handleProfileSettings}
                submitLabel="Update Information"
                isOwnProfile={true}
            />
        </div>
    )
}

export default ProfileSettings