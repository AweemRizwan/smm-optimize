import { createSlice } from "@reduxjs/toolkit"
import { setTokens, clearTokens } from "../../utils/tokenUtils"

const initialState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload.user;
            setTokens(action.payload.access_token, action.payload.refresh_token);
        },
        logout: (state) => {
            state.user = null;
            clearTokens();
        },
    }
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;


export const selectCurrentUser = (state) => state.auth.user