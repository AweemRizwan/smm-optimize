import { Link } from 'react-router-dom';
import '../../styles/pages/Auth/UserFlow.scss'

const SuccessPassword = () => {

    return (
        <div className="container">
            <div className="userflow-container">
                <div className="userflow-bx">
                    <h2>Success</h2>
                    <p className='fnt-16'>Your password has been reset. Go back to login screen to sign-in to your account using your email address and new password.</p>
                    <Link to={'/login'} className='button button-secondary btn-link plicn' type="submit" >Back to login </Link>

                </div>
            </div>
        </div>
    );
};

export default SuccessPassword;
