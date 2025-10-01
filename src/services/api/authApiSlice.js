import { apiSlice } from './apiSlice';
import { API_ROUTES } from '../../constants/apiRoutes';
import { logout, setUser } from '../../features/auth/authSlice';
import { setTokens } from '../../utils/tokenUtils';

// ✅ Common error handler
const handleApiError = (error, context) => {
    console.error(`[${context}] API Error:`, error);
};  

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (formData) => ({
                url: API_ROUTES.AUTH.REGISTER,
                method: 'POST',
                body: formData,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    handleApiError(error, 'Register');
                }
            },
        }),
        login: builder.mutation({
            query: (credentials) => ({
                url: API_ROUTES.AUTH.LOGIN,
                method: 'POST',
                body: credentials,
                // credentials: 'include', 
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser({
                        user: data.user,
                        access_token: data.access_token,
                        refresh_token: data.refresh_token
                    }));
                    setTokens(data.access_token, data.refresh_token);
                    
                } catch (error) {
                    handleApiError(error, 'Login');

                }
            },
        }),
        logout: builder.mutation({
            query: (refreshToken) => ({
                url: API_ROUTES.AUTH.LOGOUT,
                method: 'POST',
                body: { refresh_token: refreshToken },
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    handleApiError(error, 'Logout');
                }
                // Invalidate Profile Data
                // dispatch(apiSlice.util.invalidateTags(['Profile','Clients']));
                dispatch(logout());

            },
        }),
        verifyToken: builder.mutation({
            query: (token) => ({
                url: API_ROUTES.AUTH.TOKEN_VERIFY,
                method: 'POST',
                body: { token },
            }),
        }),
        setNewPassword: builder.mutation({
            query: ({ uid, token, password }) => ({
                url: API_ROUTES.AUTH.SET_PASSWORD(uid, token),
                method: 'POST',
                body: { password },
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    handleApiError(error, 'SetNewPassword');
                }
            },  
        }),
        forgotPassword: builder.mutation({
            query: (email) => ({
                url: API_ROUTES.AUTH.FORGOT_PASSWORD,
                method: 'POST',
                body: { email },
            }),
            // eslint-disable-next-line no-unused-vars
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    console.log('Forgot password request sent:', arg.email);
                } catch (error) {
                    console.error('Error in forgot password request:', error);
                }
            },
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutMutation,
    useVerifyTokenMutation,
    useSetNewPasswordMutation,
    useForgotPasswordMutation,
} = authApiSlice;
