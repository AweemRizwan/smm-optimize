import { API_ROUTES } from "../../constants/apiRoutes";
import { apiSlice } from "./apiSlice";

export const calendarMonthlyViewApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        fetchClientCalendar: builder.query({
            query: ({ clientBusinessName, accountManagerUsername, monthName }) =>
                API_ROUTES.CALENDAR.CLIENT_CALENDAR(clientBusinessName, accountManagerUsername, monthName),
            transformResponse: (response) => response,
        }),
    }),
});

export const { useFetchClientCalendarQuery } = calendarMonthlyViewApiSlice;
