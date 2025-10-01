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
