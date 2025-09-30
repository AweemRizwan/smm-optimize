import { createSlice } from '@reduxjs/toolkit';
import { notificationsApiSlice } from '../../services/api/notificationsApiSlice';

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: [],
    reducers: {
        addNotification: (state, action) => {
            state.push(action.payload);
        },
        clearNotifications: () => [],
        markNotificationAsRead(state, action) {
            const notification = state.find((n) => n.id === action.payload);
            if (notification) {
                notification.is_read = true;
            }
        },
        markAllNotificationsAsRead(state) {
            return state.map((notification) => ({ ...notification, is_read: true }));
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            notificationsApiSlice.endpoints.getNotifications.matchFulfilled,
            (state, { payload }) => {
                return payload; // Update state with fresh notifications
            }
        );
    }
});

export const { addNotification, clearNotifications, markNotificationAsRead, markAllNotificationsAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
