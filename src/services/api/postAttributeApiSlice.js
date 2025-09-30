import { apiSlice } from "./apiSlice"
import { API_ROUTES } from "../../constants/apiRoutes"

export const postAttributeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPostAttributes: builder.query({
            query: () => ({
                url: API_ROUTES.POST_ATTRIBUTES.LIST_CREATE,
                method: 'GET'
            }),
            providesTags: ['PostAttributes'],
        }),

        createPostAttribute: builder.mutation({
            query: (newPostAttribute) => ({
                url: API_ROUTES.POST_ATTRIBUTES.LIST_CREATE,
                method: 'POST',
                body: newPostAttribute
            }),
            invalidatesTags: ['PostAttributes'],
        }),

        getPostAttributesByType: builder.query({
            query: (attributeType) => ({
                url: API_ROUTES.POST_ATTRIBUTES.BY_TYPE(attributeType),
                method: 'GET',
            }),
            providesTags: ['PostAttributes'],
        }),

        updatePostAttribute: builder.mutation({
            query: ({ id, ...updatedAttribute }) => ({
                url: API_ROUTES.POST_ATTRIBUTES.UPDATE(id),
                method: 'PATCH',
                body: updatedAttribute,
            }),
            invalidatesTags: ['PostAttributes'],
        }),
    })
})

export const {
    useGetPostAttributesQuery,
    useCreatePostAttributeMutation,
    useGetPostAttributesByTypeQuery,
    useUpdatePostAttributeMutation,
} = postAttributeApiSlice