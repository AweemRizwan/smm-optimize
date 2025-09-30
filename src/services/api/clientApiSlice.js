import { apiSlice } from "./apiSlice"
import { API_ROUTES } from "../../constants/apiRoutes"

export const clientApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        //Fetch all clients
        getClients: builder.query({
            query: () => API_ROUTES.CLIENTS.LIST,
            providesTags: ['Clients'], // For cache invalidation
        }),

        // Create a new client
        createClient: builder.mutation({
            query: (newClient) => ({
                url: API_ROUTES.CLIENTS.CREATE,
                method: 'POST',
                body: newClient
            }),
            invalidatesTags: ['Clients']
        }),
        // Get a specific client by ID
        getClientById: builder.query({
            query: (id) => API_ROUTES.CLIENTS.DETAILS(id),
            providesTags: (result, error, id) => [{ type: 'Clients', id }]
        }),
        // Update a Client
        updateClient: builder.mutation({
            query: ({ id, ...clientData }) => ({
                url: API_ROUTES.CLIENTS.UPDATE(id),
                method: 'PUT',
                body: clientData
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Clients', id }]
        }),
        //Delete a Client
        deleteClient: builder.mutation({
            query: (id) => ({
                url: API_ROUTES.CLIENTS.DELETE(id),
                method: 'DELETE',
            }),
            invalidatesTags: ['Clients']
        }),
        assignClientToTeam: builder.mutation({
            query: ({ clientId, team_id }) => ({
                url: API_ROUTES.CLIENTS.ASSIGN_TEAM(clientId),
                method: 'PATCH',
                body: { team_id },
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: 'Clients' },  // Invalidates the whole clients list
                { type: 'Clients', id: clientId } // Specifically invalidate this client
            ],
        }),
        createClientPlan: builder.mutation({
            query: ({ clientId, planData }) => ({
                url: API_ROUTES.CLIENTS.PLAN_CRUD(clientId),
                method: 'POST',
                body: planData,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: 'ClientPlan', id: clientId }],
        }),
        getClientPlan: builder.query({
            query: (clientId) => API_ROUTES.CLIENTS.PLAN_CRUD(clientId), // Adjust to your actual endpoint
            transformResponse: (response) => response,
        }),
        updateClientPlan: builder.mutation({
            query: ({ clientId, planData }) => ({
                url: API_ROUTES.CLIENTS.PLAN_CRUD(clientId),
                method: 'POST',
                body: planData,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: 'ClientPlan', id: clientId }],
            async onQueryStarted({ clientId, planData }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    clientApiSlice.util.updateQueryData('getClientPlan', clientId, (draft) => {
                        Object.assign(draft, planData);
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
        }),
        // Fetch thread messages for a specific client
        getThreadMessages: builder.query({
            query: (clientId) => API_ROUTES.CLIENTS.THREADS(clientId),
            providesTags: (result, error, clientId) => [{ type: 'ThreadMessages', id: clientId }],
        }),

        // Create a new message in the thread
        createThreadMessage: builder.mutation({
            query: ({ clientId, messageData }) => ({
                url: API_ROUTES.CLIENTS.THREADS(clientId),
                method: 'POST',
                body: messageData,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: 'ThreadMessages', id: clientId }],
        }),

        // Fetch calendars for a specific client
        getClientCalendars: builder.query({
            query: (clientId) => API_ROUTES.CLIENTS.CALENDARS(clientId),
            providesTags: (result, error, clientId) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Calendars', id })), // Tags each calendar item
                    { type: 'Calendars', id: clientId }, // Tags the parent client ID
                ]
                : [{ type: 'Calendars', id: clientId }], // Fallback if no result
        }),

        // Create a new calendar for a specific client
        createClientCalendar: builder.mutation({
            query: ({ clientId, calendarData }) => ({
                url: API_ROUTES.CLIENTS.CALENDARS(clientId), // Fix the url
                method: 'POST',
                body: calendarData,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: 'Calendars', id: clientId }],
        }),

        // Delete a calendar for a specific client
        deleteClientCalendar: builder.mutation({
            query: ({ clientId, calendarId }) => ({
                // Make sure your API_ROUTES has a corresponding route.
                url: API_ROUTES.CLIENTS.CALENDAR_DETAIL(clientId, calendarId),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { clientId }) => [
                { type: 'Calendars', id: clientId },
            ],
        }),

        getProposal: builder.query({
            query: (clientId) => ({
                url: API_ROUTES.CLIENTS.PROPOSAL(clientId),
                method: 'GET',
            }),
            providesTags: (result, error, clientId) => [{ type: 'Proposal', id: clientId }],
        }),

        // Upload or Edit proposal
        uploadProposal: builder.mutation({
            query: ({ clientId, formData }) => ({
                url: API_ROUTES.CLIENTS.PROPOSAL(clientId),
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: 'Proposal', id: clientId }],
        }),

        // Delete proposal
        deleteProposal: builder.mutation({
            query: (clientId) => ({
                url: API_ROUTES.CLIENTS.PROPOSAL(clientId),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, clientId) => [{ type: 'Proposal', id: clientId }],
        }),

        getClientInvoices: builder.query({
            query: (clientId) => ({
                url: API_ROUTES.CLIENTS.INVOICES(clientId),
                method: 'GET',
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Invoices', id })),
                        { type: 'Invoices', id: 'LIST' },
                    ]
                    : [{ type: 'Invoices', id: 'LIST' }],
        }),

        // Create a new invoice for a specific client
        createClientInvoice: builder.mutation({
            query: ({ clientId, formData }) => ({
                url: API_ROUTES.CLIENTS.INVOICES(clientId),
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'Invoices', id: 'LIST' }],
        }),

        // Update an existing invoice
        updateClientInvoice: builder.mutation({
            query: ({ clientId, invoiceId, formData }) => ({
                url: API_ROUTES.CLIENTS.INVOICE_DETAIL(clientId, invoiceId),
                method: 'PUT',
                body: formData,
            }),
            invalidatesTags: (result, error, { invoiceId }) => [{ type: 'Invoices', id: invoiceId }],
        }),

        // Delete an invoice
        deleteClientInvoice: builder.mutation({
            query: ({ clientId, invoiceId }) => ({
                url: API_ROUTES.CLIENTS.INVOICE_DETAIL(clientId, invoiceId),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { invoiceId }) => [{ type: 'Invoices', id: invoiceId }],
        }),

    })
})

export const {
    useGetClientsQuery,
    useCreateClientMutation,
    useGetClientByIdQuery,
    useUpdateClientMutation,
    useDeleteClientMutation,
    useAssignClientToTeamMutation,
    useCreateClientPlanMutation,
    useGetClientPlanQuery,
    useUpdateClientPlanMutation,
    useGetThreadMessagesQuery,
    useCreateThreadMessageMutation,
    useGetClientCalendarsQuery,
    useCreateClientCalendarMutation,
    useDeleteClientCalendarMutation,
    useGetProposalQuery,
    useUploadProposalMutation,
    useDeleteProposalMutation,
    useGetClientInvoicesQuery,
    useCreateClientInvoiceMutation,
    useUpdateClientInvoiceMutation,
    useDeleteClientInvoiceMutation,
} = clientApiSlice;