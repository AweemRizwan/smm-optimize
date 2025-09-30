import { apiSlice } from './apiSlice';
import { API_ROUTES } from '../../constants/apiRoutes';


export const notificationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => ({
                url: API_ROUTES.NOTIFICATIONS.LIST, // Example: '/api/notifications'
                method: 'GET',
            }),
            providesTags: ['Notifications'],
        }),
        markAsRead: builder.mutation({
            query: (notificationId) => ({
                url: API_ROUTES.NOTIFICATIONS.MARK_READ(notificationId),
                method: 'POST',
            }),
            invalidatesTags: ['Notifications'],
        }),
        markAllAsRead: builder.mutation({
            query: () => ({
                url: API_ROUTES.NOTIFICATIONS.LIST, // Define this in your API routes
                method: 'POST',
            }),
            invalidatesTags: ['Notifications'],
        }),
    }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } = apiSlice;
