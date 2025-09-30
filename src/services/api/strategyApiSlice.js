import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "../../constants/apiRoutes";

export const strategyApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all strategies for a client
        getStrategies: builder.query({
            query: (clientId) => API_ROUTES.STRATEGIES.LIST_CREATE(clientId),
            providesTags: (result, error, clientId) => [{ type: "Strategy", id: clientId }],
        }),

        // Create or update strategies
        createOrUpdateStrategy: builder.mutation({
            query: ({ clientId, data }) => ({
                url: API_ROUTES.STRATEGIES.LIST_CREATE(clientId),
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: "Strategy", id: clientId }],
        }),

        // Delete a strategy by title
        deleteStrategy: builder.mutation({
            query: ({ clientId, data }) => ({
                url: API_ROUTES.STRATEGIES.LIST_CREATE(clientId),
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { clientId }) => [{ type: "Strategy", id: clientId }],
        }),

    }),
});

export const {
    useGetStrategiesQuery,
    useCreateOrUpdateStrategyMutation,
    useDeleteStrategyMutation
} = strategyApiSlice;
