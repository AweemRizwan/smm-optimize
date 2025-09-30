export const taskRoutes = {
    'assign_team': () => `/`,
    'create_proposal': (clientId) => `/clients/${clientId}/proposal`,
    'approve_proposal': (clientId) => `/clients/${clientId}/proposal`,
    'schedule_brief_meeting': () => `/meetings/new`,
    'is_meeting_completed': (clientId) => `/meetings/${clientId}/view`,
    'assigned_plan_to_client': (clientId) => `/clients/${clientId}/plan`,
    'create_strategy': (clientId) => `/clients/${clientId}/strategy`,
    'content_writing': (clientId) => `/clients/${clientId}/content-calendars`,
    'approve_content_by_marketing_manager': (clientId) => `/clients/${clientId}/content-calendars`,
    'approve_content_by_account_manager': (clientId) => `/clients/${clientId}/content-calendars`,
    'creatives_design': (clientId) => `/clients/${clientId}/content-calendars`,
    'approve_creatives_by_marketing_manager': (clientId) => `/clients/${clientId}/content-calendars`,
    'approve_creatives_by_account_manager': (clientId) => `/clients/${clientId}/content-calendars`,
    'schedule_onboarding_meeting': () => `/meetings/new`,
    'onboarding_meeting': (clientId) => `/clients/${clientId}/threads`,
    'smo_scheduling': (clientId) => `/clients/${clientId}/strategy`,
    'invoice_submission': (clientId) => `/clients/${clientId}/invoices`,
    'invoice_verification': (clientId) => `/clients/${clientId}/invoices`,
    'payment_confirmation': (clientId) => `/clients/${clientId}/invoices`,
    'schedule_meeting': () => `/meetings/new`,
    'brief_meeting': (clientId) => `/clients/${clientId}/threads`,
    'monthly_reporting': (clientId) => `/clients/${clientId}/invoices`,
};

// Default route for undefined task types
export const defaultTaskRoute = (clientId) => `/assigned-task/${clientId}`;
