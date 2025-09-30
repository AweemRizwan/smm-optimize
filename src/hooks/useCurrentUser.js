import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';

const useCurrentUser = () => {
    
    const user = useSelector(selectCurrentUser);
    return {
        userId: user?.id,
        role: user?.role,
        account_manager_id: user?.acc_mngr_id,
    };
};

export default useCurrentUser;
