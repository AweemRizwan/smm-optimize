import { apiSlice } from "./apiSlice"
import { API_ROUTES } from "../../constants/apiRoutes"

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all users
        getUsers: builder.query({
            query: () => API_ROUTES.USERS.LIST,
            providesTags: ['Users'], // Cache invalidation
        }),

        // Create a new user
        createUser: builder.mutation({
            query: (userData) => {
                // Return FormData directly without setting 'Content-Type'
                return {
                    url: API_ROUTES.USERS.CREATE,
                    method: 'POST',
                    body: userData, // FormData object
                };
            },
            invalidatesTags: ['Users'], // Invalidate users cache to refetch the list
        }),

        // Get a specific user by ID
        getUserById: builder.query({
            query: (id) => `${API_ROUTES.USERS.DETAIL(id)}`,
            providesTags: (result, error, id) => [{ type: 'Users', id }],
        }),

        // Update a user
        updateUser: builder.mutation({
            query: ({ id, userData }) => ({
                url: `${API_ROUTES.USERS.UPDATE(id)}`,
                method: 'PATCH',
                body: userData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }],
        }),

        // Delete a user
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `${API_ROUTES.USERS.DELETE(id)}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'], // Invalidate users cache to refetch the list
        }),

        getUsersByRole: builder.query({
            query: (role) => `${API_ROUTES.USERS.BY_ROLE}?role=${role}`,
            providesTags: ['UsersByRole'], // Cache invalidation for role-based users
        }),
    }),
})

export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useGetUserByIdQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetUsersByRoleQuery
} = userApiSlice
