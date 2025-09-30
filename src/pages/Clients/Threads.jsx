import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FieldAndError from '../../components/Form/FieldAndError';
import avatar from '../../assets/Images/profileAwatar.webp';
import { useGetThreadMessagesQuery, useCreateThreadMessageMutation } from '../../services/api/clientApiSlice';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import { formatDate } from '../../utils/generalUtils';


const ThreadPage = () => {
    const { clientId } = useParams(); // Assume clientId is passed in the route params
    const { data: messages = [], isLoading, isError, refetch } = useGetThreadMessagesQuery(clientId);
    const [createThreadMessage] = useCreateThreadMessageMutation();

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Show error toast when fetch fails
    useEffect(() => {
        if (isError) {
            setErrorMessage('Error loading messages. Please try again later.');
        }
    }, [isError]);

    const handleSendMessage = async (values, { resetForm }) => {
        try {
            await createThreadMessage({ clientId, messageData: { message: values.message } }).unwrap();
            setSuccessMessage('Message sent successfully!');
            setErrorMessage(null);
            resetForm();
            refetch(); // Refresh messages after sending
        } catch (error) {
            setErrorMessage('Failed to send message. Please try again.');
            setSuccessMessage(null);
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="section d-flex flex-direction-column d-flex-space-between min-height relative">

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

            {isLoading ? (
                <div className="loading-message text-center pxy-20">
                    {/* You can replace this with a spinner component if you have one */}
                    <p>Loading messages...</p>
                </div>
            ) : (
                <div className="chat-window pxy-10">
                    {messages.map((message, index) => (
                        <div key={index} className="chat-message d-flex flex-direction-column mb-2">
                            <div className="chat-message-info d-flex align-center mb-1">
                                <div className="chat-avatar-wrapper relative inline-block">
                                    <img
                                        src={message.sender_info?.profile || avatar}
                                        alt={message.sender_info?.first_name || 'Sender'}
                                        className="chat-avatar relative"
                                    />
                                </div>
                                <div className="chat-message-text">{message.message}</div>
                            </div>
                            <div className="chat-sender-information d-flex align-center">
                                <span className="chat-sender-info">
                                    {message.sender_info?.first_name} {message.sender_info?.last_name}
                                </span>
                                <span className="chat-sender-info">({message.sender_info?.role})</span>
                                <span className="chat-sender-info">
                                    - {formatDate(message.created_at, true)}
                                </span>
                            </div>
                        </div>
                    ))} 
                </div>
            )}
            <Formik
                initialValues={{ message: '' }}
                validationSchema={Yup.object({
                    message: Yup.string().required('Message is required'),
                })}
                onSubmit={handleSendMessage}
            >
                {({ isSubmitting }) => (
                    <Form className="chat-input-container d-flex align-center mt-3 d-flex-space-between gap-10">
                        <FieldAndError
                            name="message"
                            type="text"
                            placeholder="Type your message here..."
                            customClass="chat-input"
                            parentClass="m-0 width-100"
                            customError='position-absolute bottom-5'
                        />
                        <button
                            type="submit"
                            className="button-secondary px-3"
                            disabled={isSubmitting}
                        >
                            Send
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ThreadPage;