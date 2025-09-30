import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "../../constants/apiRoutes";

export const planApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all plans
        getPlans: builder.query({
            query: () => API_ROUTES.PLANS.LIST_CREATE,
            providesTags: (result) =>
                result ? [...result.map(({ id }) => ({ type: 'Plans', id })), 'Plans'] : ['Plans'],
        }),
        // Create a new plan
        createPlan: builder.mutation({
            query: (newPlan) => ({
                url: API_ROUTES.PLANS.LIST_CREATE,
                method: 'POST',
                body: newPlan,
            }),
            invalidatesTags: ['Plans'],
        }),
        // Get a specific plan by ID
        getPlanById: builder.query({
            query: (id) => API_ROUTES.PLANS.DETAIL(id),
            providesTags: (result, error, id) => [{ type: 'Plans', id }],
        }),
        // Update a plan (PUT request with attribute merging)
        updatePlan: builder.mutation({
            query: ({ id, ...planData }) => ({
                url: API_ROUTES.PLANS.DETAIL(id),
                method: 'PUT',
                body: planData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Plans', id }],
        }),
        // Delete a plan
        deletePlan: builder.mutation({
            query: (id) => ({
                url: API_ROUTES.PLANS.DETAIL(id),
                method: 'DELETE',
            }),
            invalidatesTags: ['Plans'],
        }),
        // Assign account managers to a plan
        assignAccountManagers: builder.mutation({
            query: ({ id, accountManagers }) => ({
                url: API_ROUTES.PLANS.ASSIGN_TO_MANAGERS(id),
                method: 'PATCH',  // Update specific fields
                body: { account_managers: accountManagers },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Plans', id }],
        }),
        removeAccountManager: builder.mutation({
            query: ({ planId, accountManagerId }) => ({
                url: API_ROUTES.PLAN_ACCOUNT_MANAGERS.REMOVE_FROM_PLAN,
                method: 'POST',
                body: { plan_id: planId, account_manager_id: accountManagerId },
            }),
            invalidatesTags: (result, error, { planId }) => [{ type: 'Plans', id: planId }],
        }),
        searchUnassignedAccountManagers: builder.mutation({
            query: (searchParams) => ({
                url: API_ROUTES.PLAN_ACCOUNT_MANAGERS.SEARCH_UNASSIGNED,
                method: 'POST',
                body: searchParams,
            }),
        }),
        getAssignedPlansForAccountManager: builder.query({
            query: (clientId) => ({
                url: API_ROUTES.PLAN_ACCOUNT_MANAGERS.ASSIGNED_PLANS(clientId),
            }),
            transformResponse: (response) => response, // Transform the response if needed
        }),
    }),
});

export const {
    useGetPlansQuery,
    useCreatePlanMutation,
    useGetPlanByIdQuery,
    useUpdatePlanMutation,
    useDeletePlanMutation,
    useAssignAccountManagersMutation,
    useSearchUnassignedAccountManagersMutation,
    useRemoveAccountManagerMutation,
    useGetAssignedPlansForAccountManagerQuery
} = planApiSlice;

