import { apiSlice } from './apiSlice';
import { API_ROUTES } from '../../constants/apiRoutes';

export const monthlyReportsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch reports for a specific month
        getMonthlyReports: builder.query({
            query: ({ clientId, month }) => API_ROUTES.MONTHLY_REPORTS.LIST_CREATE(clientId, month),
            providesTags: (result) =>
                result
                    ? [{ type: 'Report', id: result.id }]
                    : [{ type: 'Report', id: 'LIST' }],
        }),
        // Upload a new report
        createMonthlyReport: builder.mutation({
            query: ({ clientId, month, data }) => ({
                url: API_ROUTES.MONTHLY_REPORTS.LIST_CREATE(clientId, month),
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Report', id: 'LIST' }],
        }),
        // Delete a report
        deleteMonthlyReport: builder.mutation({
            query: (reportId) => ({
                url: API_ROUTES.MONTHLY_REPORTS.RUD(reportId),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, reportId) => [
                { type: 'Report', id: reportId },
                { type: 'Report', id: 'LIST' },
            ],
        }),
        // Update a report (file only)
        updateMonthlyReport: builder.mutation({
            query: ({ reportId, file }) => {
                const formData = new FormData();
                formData.append('monthly_reports', file);
                return {
                    url: API_ROUTES.MONTHLY_REPORTS.RUD(reportId),
                    method: 'PATCH',
                    body: formData,
                };
            },
            // Invalidate both the specific report and the general report list cache
            invalidatesTags: (result, error, { reportId }) => [
                { type: 'Report', id: reportId },
                { type: 'Report', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetMonthlyReportsQuery,
    useCreateMonthlyReportMutation,
    useDeleteMonthlyReportMutation,
    useUpdateMonthlyReportMutation,
} = monthlyReportsApiSlice;
