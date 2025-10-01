import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer, { logout } from "../features/auth/authSlice";
import { apiSlice } from "../services/api/apiSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

const appReducer = combineReducers({
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  notifications: notificationsReducer,
});

// 👇 rootReducer jo logout pe state reset karega
const rootReducer = (state, action) => {
  if (action.type === logout.type) {
    // apiSlice ka cache bhi clear hoga
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});