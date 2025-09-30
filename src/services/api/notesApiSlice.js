import { apiSlice } from './apiSlice';
import { API_ROUTES } from '../../constants/apiRoutes';

// notesApiSlice.js
export const notesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Fetch all notes
        getNotes: builder.query({
            query: () => API_ROUTES.NOTES.GET,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Note', id })), { type: 'Note', id: 'LIST' }]
                    : [{ type: 'Note', id: 'LIST' }],
        }),
        // Create or update a note
        createOrUpdateNote: builder.mutation({
            query: (data) => {
                if (data.id) {
                    // Update existing note
                    return {
                        url: API_ROUTES.NOTES.UPDATE_OR_DELETE(data.id),
                        method: 'PATCH',
                        body: data,
                    };
                }
                // Create new note
                return {
                    url: API_ROUTES.NOTES.GET,
                    method: 'POST',
                    body: data,
                };
            },
            invalidatesTags: [{ type: 'Note', id: 'LIST' }], // Invalidates the notes list
            async onQueryStarted(data, { dispatch, queryFulfilled }) {
                try {
                    const { data: createdNote } = await queryFulfilled;

                    // Optimistically update the cache for the `getNotes` query
                    dispatch(
                        notesApiSlice.util.updateQueryData('getNotes', undefined, (draftNotes) => {
                            draftNotes.push(createdNote);
                        })
                    );
                } catch (error) {
                    console.error("Error in optimistic update:", error);
                }
            },
        }),
        // Delete a note
        deleteNote: builder.mutation({
            query: (id) => ({
                url: API_ROUTES.NOTES.UPDATE_OR_DELETE(id),
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Note', id }],
        }),

        // Add toggleNoteFlag mutation
        toggleNoteFlag: builder.mutation({
            query: ({ id, note_flag }) => ({
                url: API_ROUTES.NOTES.UPDATE_OR_DELETE(id),
                method: 'PATCH',
                body: { note_flag },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Note', id }],
        }),
    }),
});

export const {
    useGetNotesQuery,
    useCreateOrUpdateNoteMutation,
    useDeleteNoteMutation,
    useToggleNoteFlagMutation
} = notesApiSlice;