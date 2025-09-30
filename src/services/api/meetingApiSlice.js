import { apiSlice } from "./apiSlice"
import { API_ROUTES } from "../../constants/apiRoutes"

export const meetingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMeetings: builder.query({
            query: () => API_ROUTES.MEETINGS.LIST,
            providesTags: ['Meetings'],
        }),

        createMeeting: builder.mutation({
            query: (newMeeting) => ({
                url: API_ROUTES.MEETINGS.CREATE,
                method: 'POST',
                body: newMeeting,
            }),
            invalidatesTags: ['Meetings'],
        }),

        updateMeeting: builder.mutation({
            query: ({ id, ...meetingData }) => ({
                url: API_ROUTES.MEETINGS.UPDATE(id),
                method: 'PATCH',
                body: meetingData
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Meetings', id }],
        }),
    }),
})

export const {
    useGetMeetingsQuery,
    useCreateMeetingMutation,
    useUpdateMeetingMutation,
} = meetingApiSlice