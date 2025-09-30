export const MAIN_NAV_LINKS = [
    {
        path: '/',
        label: 'Clients',
        buttonText: 'Add Client',
        buttonLink: '/clients/new',
        pageHeader: 'Clients',
        roles: ['user', 'marketing_director', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer', 'account_manager', 'accountant'],
        buttonRoles: ['account_manager']
    },
    {
        path: '/assigned-task',
        label: 'Assigned Tasks',
        pageHeader: 'Tasks',
        roles: ['user', 'marketing_director', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer', 'account_manager', 'accountant']
    },
    {
        path: '/custom-assigned-task',
        label: 'Custom Assigned Tasks',
        pageHeader: 'Custom Tasks',
        roles: ['user', 'marketing_director', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer', 'accountant']
    },
    {
        path: '/teams',
        label: 'Teams',
        buttonText: 'Create New Team',
        buttonLink: '/teams/new',
        pageHeader: 'Teams Page',
        roles: ['marketing_director'],
        buttonRoles: ['marketing_director']

    },
    {
        path: '/users',
        label: 'Users',
        buttonText: 'Add User',
        buttonLink: '/users/new',
        pageHeader: 'Users Page',
        roles: ['marketing_director'],
        buttonRoles: ['marketing_director']

    },
    {
        path: '/meetings',
        label: 'Meetings',
        buttonText: 'Schedule Meeting',
        buttonLink: '/meetings/new',
        pageHeader: 'Meetings Page',
        roles: ['marketing_director', 'account_manager', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer'],
        buttonRoles: ['account_manager']

    },
];

export const SETTINGS_NAV_LINKS = [
    {
        path: '/settings/profile',
        label: 'Profile',
        roles: ['user', 'marketing_director', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer', 'account_manager', 'accountant']
    },
    {
        path: '/settings/calendar-variables',
        label: 'Calendar Variables',
        roles: ['marketing_director']
    },
    {
        path: '/settings/plan-sets',
        label: 'Plan Sets',
        roles: ['marketing_director']
    },
];

export const SECONDARY_NAV_LINKS = (clientId) => [
    {
        path: `/clients/${clientId}/view`,
        label: 'Business Details',
        roles: ['user', 'marketing_director', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer', 'account_manager', 'accountant']
    },
    {
        path: `/clients/${clientId}/proposal`,
        label: 'Proposal',
        roles: ['marketing_director', 'marketing_manager', 'account_manager']
    },
    {
        path: `/clients/${clientId}/content-calendars`,
        label: 'Content Calendars',
        roles: ['marketing_assistant', 'marketing_director', 'graphics_designer', 'content_writer', 'account_manager', 'marketing_manager']
    },
    {
        path: `/clients/${clientId}/plan`,
        label: 'Plan',
        roles: ['marketing_director', 'account_manager', 'accountant', 'graphics_designer', 'content_writer', 'marketing_manager']
    },
    {
        path: `/clients/${clientId}/threads`,
        label: 'Threads',
        roles: ['marketing_director', 'marketing_manager', 'marketing_assistant', 'graphics_designer', 'content_writer', 'account_manager']
    },
    {
        path: `/clients/${clientId}/notes`,
        label: 'Notes',
        roles: ['marketing_director', 'marketing_manager', 'marketing_assistant', 'content_writer', 'graphics_designer']
    },
    {
        path: `/clients/${clientId}/invoices`,
        label: 'Invoices',
        roles: ['marketing_director', 'accountant', 'account_manager']
    },
    {
        path: `/clients/${clientId}/strategy`,
        label: 'Strategy',
        roles: ['marketing_director', 'marketing_manager', 'marketing_assistant', 'content_writer', 'graphics_designer', 'account_manager']
    },
    {
        path: `/clients/${clientId}/reports`,
        label: 'Reports',
        roles: ['marketing_director', 'account_manager', 'marketing_manager']
    },
    {
        path: `/clients/${clientId}/custom-tasks`,
        label: 'Custom Tasks',
        roles: ['account_manager']
    },
];


export const CUSTOMER_NAV_LINKS = (clientId) => [
    {
        path: '/',
        label: 'Home',
        roles: ['user']
    },
    {
        path: `/clients/${clientId}/content-calendars`,
        label: 'Calendars',
        roles: ['user']
    }
];