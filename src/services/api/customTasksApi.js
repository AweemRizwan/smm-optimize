import { apiSlice } from './apiSlice';
import { API_ROUTES } from '../../constants/apiRoutes';

export const customTasksApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getClientTeam: builder.query({
            query: (clientId) => API_ROUTES.CLIENTS.TEAM(clientId),
            providesTags: ['ClientTeam'],
        }),
        getMyCustomTasks: builder.query({
            query: () => API_ROUTES.TASKS.CUSTOM_TASKS,
            providesTags: ['CustomTasks'],
        }),
        getAllCustomTasksByClient: builder.query({
            query: (clientId) => API_ROUTES.CLIENTS.CUSTOM_TASKS(clientId),
            providesTags: ['CustomTasks'],
        }),
        createCustomTask: builder.mutation({
            query: ({ clientId, taskData }) => ({
                url: API_ROUTES.CLIENTS.CUSTOM_TASKS(clientId),
                method: "POST",
                body: taskData,
            }),
            invalidatesTags: ['CustomTasks'], // Refresh task list after creating
        }),
        updateTaskStatus: builder.mutation({
            query: ({ taskId, taskStatus }) => ({
                url: API_ROUTES.TASKS.CUSTOM_TASK_STATUS(taskId),
                method: "PATCH",
                body: { task_status: taskStatus },
            }),
            invalidatesTags: ['CustomTasks'], // Refresh after updating status
        }),
    }),
});

export const {
    useGetClientTeamQuery,
    useGetMyCustomTasksQuery,
    useCreateCustomTaskMutation,
    useUpdateTaskStatusMutation,
    useGetAllCustomTasksByClientQuery,
} = customTasksApi;
