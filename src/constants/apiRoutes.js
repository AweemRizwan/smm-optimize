export const API_ROUTES = {
    AUTH: {
        REGISTER: '/clients/signup',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/token/refresh',
        TOKEN_VERIFY: '/auth/token/verify',
        SET_PASSWORD: (uid, token) => `/auth/set-password/${token}/${uid}`,
        USER_PROFILE: '/auth/profile',        // GET current user's profile
        UPDATE_PROFILE: '/auth/profile/update',  // PUT update current user's profile
        FORGOT_PASSWORD: '/password/forgot',
    },
    USERS: {
        LIST: '/users',
        CREATE: '/users/create',
        BY_ROLE: '/users/by-role',
        DETAIL: (id) => `/users/${id}`,
        UPDATE: (id) => `/users/${id}`,
        DELETE: (id) => `/users/${id}`,
    },
    TEAMS: {
        LIST: '/teams',
        CREATE: '/teams',
        DETAILS: (id) => `/teams/${id}`,
        UPDATE: (id) => `/teams/${id}`,
        DELETE: (id) => `/teams/${id}`,
    },
    CLIENTS: {
        LIST: '/clients',
        CREATE: '/clients',
        DETAILS: (id) => `/clients/${id}`,
        UPDATE: (id) => `/clients/${id}`,
        DELETE: (id) => `/clients/${id}`,
        ASSIGN_TEAM: (id) => `/clients/${id}/assign-team`,
        PLAN_CRUD: (id) => `/clients/${id}/plans`,
        THREADS: (id) => `/clients/${id}/threads`,
        CALENDARS: (id) => `/clients/${id}/calendars`,
        CALENDAR_DETAIL: (clientId, calendarId) => `/clients/${clientId}/calendars/${calendarId}`,
        PROPOSAL: (clientId) => `/clients/${clientId}/proposal`,
        INVOICES: (clientId) => `/clients/${clientId}/invoices`,
        INVOICE_DETAIL: (clientId, invoiceId) => `/clients/${clientId}/invoices/${invoiceId}`,
        TEAM: (clientId) => `/clients/${clientId}/client-team`,
        CUSTOM_TASKS: (clientId) => `/clients/${clientId}/custom-tasks`,
    },
    MEETINGS: {
        LIST: '/meetings',
        CREATE: '/meetings',
        UPDATE: (id) => `/meetings/${id}`,
    },
    CALENDAR: {
        RUD: (clientId, calendarId) => `/clients/${clientId}/calendars/${calendarId}`,
        CLIENT_CALENDAR: (clientBusinessName, accountManagerUsername, monthName) => `/client-calendar/${clientBusinessName}/${accountManagerUsername}/${monthName}/`,
    },
    CALENDAR_DATE: {
        LIST_CREATE: (calendarId) => `/calendars/${calendarId}/dates`,
        RUD: (calendarId, dateId) => `/calendars/${calendarId}/dates/${dateId}`,
    },
    TASKS: {
        CLIENT_TASK: (id) => `/tasks/${id}`,
        COMPLETE_TASK: (id) => `/tasks/${id}/complete`,
        ASSIGNED: '/my/tasks',
        CUSTOM_TASKS: "/tasks/my-custom-tasks",
        CUSTOM_TASK_STATUS: (taskId) => `/tasks/${taskId}/complete-custom-task`,
    },
    POST_ATTRIBUTES: {
        LIST_CREATE: '/post-attributes',
        UPDATE: (id) => `/post-attributes/update/${id}`,
        BY_TYPE: (type) => `/post-attributes/${type}`,
    },
    PLANS: {
        LIST_CREATE: '/plans',
        DETAIL: (id) => `/plans/${id}`,
        ASSIGN_TO_MANAGERS: (id) => `/plans/${id}/assign`,
    },
    PLAN_ACCOUNT_MANAGERS: {
        SEARCH_UNASSIGNED: '/search-unassigned-account-managers',
        REMOVE_FROM_PLAN: '/remove-account-manager',
        ASSIGNED_PLANS: (id) => `/plans/${id}/account-manager-plans`,
    },
    STRATEGIES: {
        LIST_CREATE: (clientId) => `/clients/${clientId}/strategy`,
        DETAIL: (strategyId) => `/strategies/${strategyId}`,
    },
    NOTES: {
        GET: '/notes',
        UPDATE_OR_DELETE: (id) => `/notes/${id}`,
    },
    MONTHLY_REPORTS: {
        LIST_CREATE: (clientId, month) => `/clients/monthly-reports/${clientId}/${month}`,
        RUD: (reportId) => `/clients/monthly-reports/${reportId}`,
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        MARK_READ: (id) => `/notifications/mark-read/${id}`,
        MARK_ALL_READ: '/notifications/mark-all-read',
    },
    ACCOUNT_MANAGER: {
        DETAILS: (accMngrId) => `/account-manager/agency-slug/?acc_mngr_id=${accMngrId}`,
    },
};
