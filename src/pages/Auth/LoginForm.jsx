import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import FieldAndError from '../../components/Form/FieldAndError'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useLoginMutation } from '../../services/api/authApiSlice'
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';


const LoginForm = () => {
    const [login] = useLoginMutation()
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const location = useLocation();
    const navigate = useNavigate()
    const from = location.state?.from?.pathname || '/';
    const initialValues = {
        username: '',
        password: ''
    }

    const validationSchema = Yup.object({
        username: Yup.string().required('Required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
    })

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const data = await login(values).unwrap();
            setSuccessMessage(data.message)
            navigate(from, { replace: true });
            // sendMessage({ message: 'User logged in' });
        } catch (error) {
            console.error('Login failed:', error);
            setErrorMessage('Invalid username or password');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container">
            <div className="userflow-container">
                <div className="userflow-bx position-relative">
                    <h2>Login</h2>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <FieldAndError
                                    name="username"
                                    label="Username"
                                    type="text"
                                    placeholder="Username"
                                    labelClass="label-base label-white"
                                />
                                <FieldAndError
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="Password"
                                    showPasswordToggle={true} // Enable show/hide password
                                    labelClass="label-base label-white"
                                />
                                <Link to={'/forgot-password'} className='forget-link'>Forgot password?</Link>
                                <button className='button button-secondary' type="submit" disabled={isSubmitting}>Login</button>
                            </Form>
                        )}
                    </Formik>
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
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
