import { apiSlice } from './apiSlice'
import { API_ROUTES } from '../../constants/apiRoutes'

export const profileApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => API_ROUTES.AUTH.USER_PROFILE,
            providesTags: ['Profile'], // <-- Add this line

        }),
        updateProfile: builder.mutation({
            query: (profileData) => ({
                url: API_ROUTES.AUTH.UPDATE_PROFILE,
                method: 'PATCH',
                body: profileData
            }),
            invalidatesTags: ['Profile'], // <-- Ensure updates refresh the profile data
        })
    })
})

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApiSlice