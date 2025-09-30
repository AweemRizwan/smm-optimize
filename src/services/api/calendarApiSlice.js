import { API_ROUTES } from '../../constants/apiRoutes';
import { apiSlice } from './apiSlice'

export const calendarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Calendar RUD
        getClientCalendar: builder.query({
            query: ({ clientId, calendarId }) => ({
                url: API_ROUTES.CALENDAR.RUD(clientId, calendarId),
                method: 'GET',
            }),
            providesTags: (result, error, { calendarId }) => [{ type: 'Calendar', id: calendarId }],
        }),
        updateClientCalendar: builder.mutation({
            query: ({ clientId, calendarId, data }) => ({
                url: API_ROUTES.CALENDAR.RUD(clientId, calendarId),
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { calendarId }) => [{ type: 'Calendar', id: calendarId }],
        }),
        // Calendar Dates
        listCalendarDates: builder.query({
            query: (calendarId) => ({
                url: API_ROUTES.CALENDAR_DATE.LIST_CREATE(calendarId),
                method: 'GET',
            }),
            transformResponse: (response) =>
                response.map(item => ({
                    ...item,
                    comments: item.comments ?? '',
                    creatives_text: item.creatives_text ?? '',
                    hashtags: item.hashtags ?? '',
                    e_hooks: item.e_hooks ?? '',
                })),
            // eslint-disable-next-line no-unused-vars
            providesTags: (result, error, calendarId) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'CalendarDate', id })), { type: 'CalendarDate', id: 'LIST' }]
                    : [{ type: 'CalendarDate', id: 'LIST' }],
        }),
        createCalendarDate: builder.mutation({
            query: ({ calendarId, data }) => ({
                url: API_ROUTES.CALENDAR_DATE.LIST_CREATE(calendarId),
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'CalendarDate', id: 'LIST' }],
        }),
        updateCalendarDate: builder.mutation({
            query: ({ calendarId, dateId, data }) => ({
                url: API_ROUTES.CALENDAR_DATE.RUD(calendarId, dateId),
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { dateId }) => [{ type: 'CalendarDate', id: dateId }],
        }),
        deleteCalendarDate: builder.mutation({
            query: ({ calendarId, dateId }) => ({
                url: API_ROUTES.CALENDAR_DATE.RUD(calendarId, dateId),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { dateId }) => [{ type: 'CalendarDate', id: dateId }],
        }),
    }),
});

export const {
    useGetClientCalendarQuery,
    useUpdateClientCalendarMutation,
    useListCalendarDatesQuery,
    useCreateCalendarDateMutation,
    useUpdateCalendarDateMutation,
    useDeleteCalendarDateMutation,
} = calendarApi;
