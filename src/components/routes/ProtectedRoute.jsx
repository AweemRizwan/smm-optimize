import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '../../utils/tokenUtils';


const ProtectedRoute = ({ children }) => {
    const isVerified = !!getAccessToken()
    const location = useLocation()

    if (!isVerified) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ProtectedRoute;