import { API_ROUTES } from '../../constants/apiRoutes'
import { apiSlice } from './apiSlice';

export const accountManagerApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAccountManager: builder.query({
            query: (accMngrId) => ({
                url: API_ROUTES.ACCOUNT_MANAGER.DETAILS(accMngrId),
                method: 'GET',
            }),
            providesTags: ['AccountManager'],
        }),
    }),
});

export const { useGetAccountManagerQuery } = accountManagerApiSlice;
