export const setTokens = (accessToken, refreshToken) => {
    sessionStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
};

export const clearTokens = () => {
    sessionStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

export const getAccessToken = () => {
    return sessionStorage.getItem('access_token');
};

export const getRefreshToken = () => {
    return localStorage.getItem('refresh_token');
};
