import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FieldAndError from '../../components/Form/FieldAndError';
import { useForgotPasswordMutation } from '../../services/api/authApiSlice';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/Auth/UserFlow.scss';
import { useState } from 'react';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';


const ForgotPassword = () => {
    const navigate = useNavigate();
    const [forgotPassword] = useForgotPasswordMutation();
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const initialValues = {
        email: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email').required('Required'),
    });

    const handleSubmit = async (values, { setSubmitting, setErrors, resetForm }) => {
        try {
            await forgotPassword(values.email).unwrap();
            setSuccessMessage('Password reset link sent! Check your email.');
            setErrorMessage(''); // Clear any previous error messages
            resetForm(); // Reset form after success

            // Redirect user to a confirmation page
            navigate('/reset-link-sent');
        } catch (error) {
            console.error('Forgot Password failed:', error);
            setErrorMessage(error.data?.error || 'Failed to send reset link');
            setSuccessMessage(''); // Clear success message on failure
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container">
            <div className="userflow-container">
                <div className="userflow-bx">
                    <h2>Forgot Password</h2>

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
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="Email Address"
                                    labelClass="label-base label-white"
                                />
                                <button className='button button-secondary' type="submit" disabled={isSubmitting}>Reset Password</button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
