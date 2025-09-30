import { apiSlice } from "./apiSlice"
import { API_ROUTES } from "../../constants/apiRoutes"

export const teamApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTeams: builder.query({
            query: () => API_ROUTES.TEAMS.LIST,
            providesTags: ['Teams']
        }),

        getTeamById: builder.query({
            query: (id) => `${API_ROUTES.TEAMS.DETAILS(id)}`,
            providesTags: (result, error, id) => [{ type: 'Teams', id }],
        }),

        createTeam: builder.mutation({
            query: (newTeam) => ({
                url: API_ROUTES.TEAMS.CREATE,
                method: 'POST',
                body: newTeam,
            }),
            invalidatesTags: ['Teams']
        }),
        updateTeam: builder.mutation({
            query: ({ id, ...teamData }) => ({
                url: `${API_ROUTES.TEAMS.UPDATE(id)}`,
                method: 'PATCH',
                body: teamData
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Teams', id }],
        }),

        deleteTeam: builder.mutation({
            query: (id) => ({
                url: `${API_ROUTES.TEAMS.DELETE(id)}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Teams'],
        })
    })
})

export const {
    useGetTeamsQuery,
    useGetTeamByIdQuery,
    useCreateTeamMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
} = teamApiSlice