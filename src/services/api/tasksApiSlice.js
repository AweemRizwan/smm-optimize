import { apiSlice } from './apiSlice';
import { API_ROUTES } from '../../constants/apiRoutes';

export const tasksApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTasks: builder.query({
            query: (clientId) => API_ROUTES.TASKS.CLIENT_TASK(clientId),
            providesTags: (result, error, clientId) =>
                result ? [{ type: 'ClientTasks', id: clientId }] : [],
        }),
        // Fetch assigned tasks for the current user
        getAssignedTasks: builder.query({
            query: () => API_ROUTES.TASKS.ASSIGNED,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Task', id })), { type: 'Task', id: 'LIST' }]
                    : [{ type: 'Task', id: 'LIST' }],
        }),
        completeTask: builder.mutation({
            query: (payload) => {
                const { taskId, ...bodyPayload } = payload;
                return {
                    url: API_ROUTES.TASKS.COMPLETE_TASK(taskId),
                    method: 'POST',
                    body: bodyPayload, // taskId is excluded from the body
                };
            },
            // Invalidate the tasks cache after completing a task
            invalidatesTags: (result, error, { taskId, clientId }) => [
                { type: 'Task', id: taskId },
                { type: 'Task', id: 'LIST' },
                { type: 'ClientTasks', id: clientId }, // Add a general tag for getTasks queries

            ],
        }),

    }),
});

export const { useGetTasksQuery, useGetAssignedTasksQuery, useCompleteTaskMutation } = tasksApiSlice;
