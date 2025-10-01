import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FieldAndError from '../../components/Form/FieldAndError';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetNewPasswordMutation } from '../../services/api/authApiSlice';
import { useState } from 'react';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const NewPassword = () => {
    const { token, uid } = useParams();
    const navigate = useNavigate();
    const [newPassword] = useSetNewPasswordMutation();

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const initialValues = {
        password: '',
        confirmPassword: ''
    };

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], '*Passwords do not match')
            .required('Required'),
    });

    const handleSubmit = async (values, { setSubmitting, setErrors }) => {
        try {
            const result = await newPassword({ uid, token, password: values.password });

            if (result.error) {
                console.error('Password reset failed:', result.error);
                setErrorMessage('Failed to reset password. Please try again.');
                setSuccessMessage(''); // Clear success message
            } else {
                setSuccessMessage('Your password has been reset successfully!');
                setErrorMessage(''); // Clear any previous errors
                navigate('/success-password');
            }
        } catch (error) {
            console.error('Unexpected error during password reset:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
            setSuccessMessage(''); // Clear success message on failure
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="userflow-container">
                <div className="userflow-bx">
                    <h2>Create new password</h2>

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
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <FieldAndError
                                    name="password"
                                    label="Enter your new password"
                                    type="password"
                                    placeholder="Password"
                                    showPasswordToggle={true}  // Enable show/hide password
                                    labelClass="label-base label-white"
                                />
                                <FieldAndError
                                    name="confirmPassword"
                                    label="Re-enter your new password"
                                    type="password"
                                    placeholder="Password"
                                    showPasswordToggle={true}  // Enable show/hide password
                                    labelClass="label-base label-white"
                                />
                                <button className='button button-secondary' type="submit" disabled={isSubmitting}>
                                    Submit
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default NewPassword;
