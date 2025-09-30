import { render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CreatePlanSets from '../../src/pages/Admin/CreatePlanSets';
import { useCreatePlanMutation } from '../../src/services/api/planApiSlice';
import { useGetPostAttributesByTypeQuery } from '../../src/services/api/postAttributeApiSlice';
import { store } from '../../src/store/store';
import userEvent from '@testing-library/user-event';

// ✅ Mock API Hooks
vi.mock('../../src/services/api/planApiSlice', () => ({
    useCreatePlanMutation: vi.fn(),
}));

vi.mock('../../src/services/api/postAttributeApiSlice', () => ({
    useGetPostAttributesByTypeQuery: vi.fn(),
}));

// ✅ Utility function to render the component with Redux Provider & Router
const renderWithProviders = () => {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <CreatePlanSets />
            </MemoryRouter>
        </Provider>
    );
};

describe('CreatePlanSets Component', () => {
    let mockCreatePlan;

    beforeEach(() => {
        vi.resetAllMocks();

        // ✅ Mock `createPlan` with `unwrap()`
        mockCreatePlan = vi.fn(async (data) => {
            console.log("📡 Mock API Called with:", JSON.stringify(data, null, 2));
            return Promise.resolve({ message: 'Plan Set created successfully!' });
        });

        useCreatePlanMutation.mockReturnValue([
            () => ({
                unwrap: mockCreatePlan, // ✅ Mock unwrap() correctly
            }),
            { isLoading: false, isError: false, error: null, isSuccess: false }
        ]);

        // ✅ Mock post attributes response
        useGetPostAttributesByTypeQuery.mockReturnValue({
            data: [
                { id: 1, name: 'Blog Post', label: 'Blog Post', is_active: true },
                { id: 2, name: 'Social Media Ad', label: 'Social Media Ad', is_active: true }
            ],
            isLoading: false,
            isError: false,
        });
    });

    // ✅ 1️⃣ Test: Renders the form correctly
    it('renders the form correctly', async () => {
        renderWithProviders();

        expect(screen.getByText(/Create Plan Sets/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Lorem Ipsum/i)).toBeInTheDocument();
        expect(screen.getByText(/Standard Plan/i)).toBeInTheDocument();
        expect(screen.getByText(/Advanced Plan/i)).toBeInTheDocument();
        expect(screen.getByText(/Creative Add Ons/i)).toBeInTheDocument();
        expect(screen.getByText(/Platform Add Ons/i)).toBeInTheDocument();
    });

    it('shows a loading message while fetching post types', async () => {
        useGetPostAttributesByTypeQuery.mockReturnValue({
            data: [],
            isLoading: true,  
            isError: false,
        });

        renderWithProviders();

        // ✅ Expect at least one "Loading..." message
        expect(screen.getAllByText(/Loading.../i)).toHaveLength(3);
    });

    it('shows an error message when fetching post types fails', async () => {
        useGetPostAttributesByTypeQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,  
        });

        renderWithProviders();

        // ✅ Ensure error message appears
        expect(screen.getByText(/Error fetching post types. Please try again./i)).toBeInTheDocument();
    });

    // ✅ 4️⃣ Test: Successfully submits the form
    it('fills out the form and submits successfully', async () => {
        renderWithProviders();

        // ✅ Fill out the main form fields
        await userEvent.clear(screen.getByPlaceholderText(/Lorem Ipsum/i));
        await userEvent.type(screen.getByPlaceholderText(/Lorem Ipsum/i), 'Premium Plan');

        // ✅ Ensure Formik state updates before moving forward
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Lorem Ipsum/i)).toHaveValue('Premium Plan');
        });

        // ✅ Select the Standard Plan section
        const standardPlanSection = screen.getByText(/Standard Plan/i).closest('.section');

        // ✅ Fill out the Standard Plan inputs
        await userEvent.clear(within(standardPlanSection).getByLabelText(/Blog Post/i));
        await userEvent.type(within(standardPlanSection).getByLabelText(/Blog Post/i), '5');

        await userEvent.clear(within(standardPlanSection).getByLabelText(/Social Media Ad/i));
        await userEvent.type(within(standardPlanSection).getByLabelText(/Social Media Ad/i), '10');

        await userEvent.clear(within(standardPlanSection).getByLabelText(/Plan Inclusions/i));
        await userEvent.type(within(standardPlanSection).getByLabelText(/Plan Inclusions/i), 'Includes ads and blog posts');

        await userEvent.clear(within(standardPlanSection).getByLabelText(/Price\/Month/i));
        await userEvent.type(within(standardPlanSection).getByLabelText(/Price\/Month/i), '499');

        // ✅ Submit the form
        await userEvent.click(screen.getByRole('button', { name: /Save Plan Set/i }));

        // ✅ Ensure API is called with correct arguments
        await waitFor(() => {
            expect(mockCreatePlan).toHaveBeenCalledTimes(1);
            expect(mockCreatePlan).toHaveBeenCalledWith(expect.objectContaining({
                plan_name: 'Premium Plan',
                standard_attributes: expect.objectContaining({
                    blog_post: 5, // ✅ Correct number format
                    social_media_ad: 10,
                }),
                standard_plan_inclusion: 'Includes ads and blog posts',
                standard_netprice: 499, // ✅ Fix type issue (was string)
            }));
        });

        // ✅ Success message should be displayed
        await waitFor(() => {
            expect(screen.getByText(/Plan Set created successfully!/i)).toBeInTheDocument();
        });
    });

    it('handles API failure and displays an error message', async () => {
        // ✅ Mock API failure response
        mockCreatePlan.mockRejectedValueOnce({
            data: { message: 'Failed to create Plan Set' },
        });
    
        renderWithProviders();
    
        // ✅ Fill out the form and submit
        await userEvent.type(screen.getByPlaceholderText(/Lorem Ipsum/i), 'Basic Plan');
        await userEvent.click(screen.getByRole('button', { name: /Save Plan Set/i }));
    
        // ✅ Debugging: Log the current DOM output
        await waitFor(() => {
            screen.debug();
        });
    
        // ✅ Try a flexible matcher
        expect(await screen.findByText((content) => content.includes('Failed to create Plan Set'))).toBeInTheDocument();
    });
    
    
    
});
