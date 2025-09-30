import { Link } from 'react-router-dom';
import '../../styles/pages/Auth/UserFlow.scss'

const ResetPasswordLink = () => {

    return (
        <div className="container">
            <div className="userflow-container">
                <div className="userflow-bx">
                    <h2>Forgot Password</h2>
                    <p className='fnt-16'>A one-time password reset link has been sent to your registered email address. Follow that link to reset your password.</p>
                    <Link to={'/login'} className='button button-secondary btn-link plicn' type="submit" >Back to login </Link>

                </div>
            </div>
        </div>
    );
};

export default ResetPasswordLink;
