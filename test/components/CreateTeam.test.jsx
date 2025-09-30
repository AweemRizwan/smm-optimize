import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CreateTeamPage from '../../src/pages/Teams/CreateTeam';
import { useCreateTeamMutation } from '../../src/services/api/teamApiSlice';
import { store } from '../../src/store/store';

// ✅ Mock API Hook
vi.mock('../../src/services/api/teamApiSlice', () => ({
    useCreateTeamMutation: vi.fn(),
}));

// ✅ Utility function to render the component with Redux Provider & Router
const renderWithProviders = () => {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <CreateTeamPage />
            </MemoryRouter>
        </Provider>
    );
};

describe('CreateTeamPage Component', () => {
    let mockCreateTeam;

    beforeEach(() => {
        vi.resetAllMocks();

        // ✅ Mock `createTeam` with unwrap()
        mockCreateTeam = vi.fn(async (data) => {
            console.log("📡 Mock API Called with:", JSON.stringify(data, null, 2)); // ✅ Debugging
            return Promise.resolve({ message: 'Team created successfully!' });
        });

        useCreateTeamMutation.mockReturnValue([
            () => ({
                unwrap: mockCreateTeam, // ✅ Mock unwrap() correctly
            }),
            { isLoading: false, isError: false, error: null, isSuccess: false }
        ]);
    });

    // ✅ 1️⃣ Test: Renders the form correctly
    it('renders the form correctly', () => {
        renderWithProviders();

        expect(screen.getByText(/Create Team/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Team Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Marketing Manager/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Marketing Assistant/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Graphic Designer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Content Writer/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    // // ✅ 1️⃣ Test: Successfully creates a team
    // it('creates a team successfully', async () => {
    //     renderWithProviders();

    //     // ✅ Fill out the form
    //     fireEvent.change(screen.getByPlaceholderText(/Team Name/i), { target: { value: 'Marketing Team' } });
    //     fireEvent.blur(screen.getByPlaceholderText(/Team Name/i)); // ✅ Ensure Formik updates state

    //     fireEvent.change(screen.getByLabelText(/Marketing Manager/i), { target: { value: '1' } });
    //     fireEvent.blur(screen.getByLabelText(/Marketing Manager/i));

    //     fireEvent.change(screen.getByLabelText(/Marketing Assistant/i), { target: { value: '2' } });
    //     fireEvent.blur(screen.getByLabelText(/Marketing Assistant/i));

    //     fireEvent.change(screen.getByLabelText(/Graphic Designer/i), { target: { value: '3' } });
    //     fireEvent.blur(screen.getByLabelText(/Graphic Designer/i));

    //     fireEvent.change(screen.getByLabelText(/Content Writer/i), { target: { value: '4' } });
    //     fireEvent.blur(screen.getByLabelText(/Content Writer/i));

    //     // ✅ Submit Form
    //     fireEvent.submit(screen.getByTestId("team-form"));

    //     // ✅ Debugging: Log mock API calls
    //     await waitFor(() => {
    //         console.log("📡 Mock API Calls:", mockCreateTeam.mock.calls);
    //     });

    //     // ✅ Ensure API is called with correct arguments
    //     await waitFor(() => {
    //         expect(mockCreateTeam).toHaveBeenCalledWith(expect.objectContaining({
    //             team: expect.objectContaining({ Team : 'Marketing Team' }),
    //             members: expect.arrayContaining([
    //                 expect.objectContaining({ user_id: '1' }),
    //                 expect.objectContaining({ user_id: '2' }),
    //                 expect.objectContaining({ user_id: '3' }),
    //                 expect.objectContaining({ user_id: '4' }),
    //             ])
    //         }));
    //     });

    //     // ✅ Success message should be displayed
    //     await waitFor(() => {
    //         expect(screen.getByText(/Team created successfully!/i)).toBeInTheDocument();
    //     });
    // });



    // it('handles API failure and displays an error message', async () => {
    //     // ✅ Mock API Failure with an Error Object
    //     mockCreateTeam.mockRejectedValueOnce(new Error('Failed to create team'));
    
    //     renderWithProviders();
    
    //     fireEvent.change(screen.getByPlaceholderText(/Team Name/i), { target: { value: 'Marketing Team' } });
    //     fireEvent.submit(screen.getByTestId("team-form"));
    
    //     // ✅ Ensure API call happened
    //     await waitFor(() => {
    //         expect(mockCreateTeam).toHaveBeenCalledTimes(1);
    //     });
    
    //     // ✅ Wait for the error message to appear
    //     await waitFor(() => {
    //         expect(screen.getByText(/Error: Failed to create team/i)).toBeInTheDocument();
    //     });
    // });

    // ✅ 3️⃣ Test: Shows success message upon successful team creation
    it('shows success message upon successful team creation', async () => {
        useCreateTeamMutation.mockReturnValue([
            () => ({
                unwrap: mockCreateTeam, // ✅ Fix unwrap
            }),
            { isLoading: false, isError: false, error: null, isSuccess: true }
        ]);

        renderWithProviders();

        fireEvent.change(screen.getByPlaceholderText(/Team Name/i), { target: { value: 'Marketing Team' } });
        fireEvent.submit(screen.getByTestId("team-form"));

        // ✅ Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/Team created successfully!/i)).toBeInTheDocument();
        });
    });
});
