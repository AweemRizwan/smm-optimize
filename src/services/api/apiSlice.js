import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getRefreshToken, setTokens, clearTokens } from '../../utils/tokenUtils';
import { logout, setUser } from '../../features/auth/authSlice';
import { isJsonifiable } from '../../utils/generalUtils'


const API_URL = import.meta.env.VITE_API_URL || 'https://api.smmexperts.pro/api';

// Configure the base query to include credentials and set headers (including the access token if available)
const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include', // ensures cookies (HTTP-only or otherwise) are included
    prepareHeaders: (headers, { body }) => {
        // Set JSON header if applicable
        if (isJsonifiable(body)) {
            headers.set('Content-Type', 'application/json');
        } else {
            // Let the browser automatically handle `multipart/form-data` for FormData objects
            headers.delete('Content-Type');
        }
        // Optionally use sessionStorage (or other storage) for the access token.
        const token = sessionStorage.getItem('access_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

// --- Refresh Lock Variables ---
// These help us ensure that if multiple requests face a 401, we only run one refresh call.
let isRefreshing = false;
let refreshPromise = null;

// --- Base Query With Reauthentication ---
const baseQueryWithReauth = async (args, api, extraOptions) => {

    if (typeof args === 'string') {
        args = { url: args };
    }
    
    let result = await baseQuery(args, api, extraOptions);

    // If we got a 401, attempt to refresh the token.
    if (result.error && result.error.status === 401) {
        // If no refresh call is running, start one.
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = (async () => {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    return { success: false, error: 'No refresh token available' };
                }

                // Attempt token refresh
                const refreshResult = await baseQuery(
                    {
                        url: '/auth/token/refresh',
                        method: 'POST',
                        body: { refresh: refreshToken },
                    },
                    api,
                    extraOptions
                );

                if (refreshResult.data) {
                    // Update tokens and Redux state
                    setTokens(refreshResult.data.access, refreshResult.data.refresh);
                    api.dispatch(
                        setUser({
                            user: api.getState().auth.user, // You may need to fetch/update user data on refresh
                            access_token: refreshResult.data.access,
                            refresh_token: refreshResult.data.refresh,
                        })
                    );
                    return { success: true };
                } else {
                    return { success: false, error: refreshResult.error };
                }
            })();

            try {
                const refreshResponse = await refreshPromise;
                if (refreshResponse.success) {
                    // If refresh succeeds, retry the original request with the new token.
                    const retryResult = await baseQuery({ ...args, _retry: true }, api, extraOptions);
                    return retryResult;
                } else {
                    // Refresh failed – log the user out.
                    clearTokens();
                    api.dispatch(logout());
                    return {
                        error: {
                            status: 401,
                            data: 'Unauthorized',
                            message: refreshResponse.error,
                        },
                    };
                }
            } finally {
                // Cleanup the lock regardless of outcome.
                isRefreshing = false;
                refreshPromise = null;
            }
        } else {
            // If a refresh call is already in progress, wait for it to complete.
            const refreshResponse = await refreshPromise;
            if (refreshResponse.success) {
                const retryResult = await baseQuery({ ...args, _retry: true }, api, extraOptions);
                return retryResult;
            } else {
                clearTokens();
                api.dispatch(logout());
                return { error: { status: 401, data: 'Unauthorized' } };
            }
        }
    }

    return result;
};

// --- Create the API Slice ---
export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'Teams',
        'Notifications',
        'Clients',
        'Tasks',
        'Task',
        'Users',
        'Calendar',
        'CalendarDate',
        'ThreadMessages',
        'ClientPlan',
        'Proposal',
        'ClientTasks',
        'Meetings',
        'Report',
        'Note',
        'Plans',
        'PostAttributes',
        'Strategy',
        'UsersByRole',
        'Calendars',
        'ContentCalendars',
        'Invoices',
        'PlanSets',
        'CalendarVariables',
        'CalendarMonthlyView',
        'Profile',
        'CustomTasks',
        'ClientTeam',
        'AccountManager',
    ],
    endpoints: (builder) => ({}),
});
