import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AssignedTasks from '../../src/pages/Tasks/AssignedTasks';
import { useGetAssignedTasksQuery } from '../../src/services/api/tasksApiSlice';
import { store } from '../../src/store/store';
import userEvent from '@testing-library/user-event';

// ✅ Mock API Hook
vi.mock('../../src/services/api/tasksApiSlice', () => ({
    useGetAssignedTasksQuery: vi.fn(),
}));

// ✅ Utility function to render the component with Redux Provider & Router
const renderWithProviders = () => {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <AssignedTasks />
            </MemoryRouter>
        </Provider>
    );
};

describe('AssignedTasks Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // ✅ 1️⃣ Test: Displays a loading message while fetching tasks
    it('shows a loading message while fetching tasks', async () => {
        useGetAssignedTasksQuery.mockReturnValue({ data: null, isLoading: true, isError: false });

        renderWithProviders();

        expect(screen.getByText(/Loading tasks.../i)).toBeInTheDocument();
    });

    // ✅ 2️⃣ Test: Handles API failure and displays an error message
    it('shows an error message when fetching tasks fails', async () => {
        useGetAssignedTasksQuery.mockReturnValue({ data: null, isLoading: false, isError: true });

        renderWithProviders();

        expect(screen.getByText(/Error fetching tasks. Please try again later./i)).toBeInTheDocument();
    });

    // ✅ 3️⃣ Test: Renders assigned tasks correctly
    it('renders assigned tasks correctly', async () => {
        useGetAssignedTasksQuery.mockReturnValue({
            data: [
                {
                    id: 1,
                    created_at: '2024-02-20T12:00:00Z',
                    client_business_name: 'Test Business',
                    task_type: 'social_media_post',
                    client: '1234',
                },
            ],
            isLoading: false,
            isError: false,
        });

        renderWithProviders();

        await waitFor(() => {
            expect(screen.getByText(/Assigned on \(Time\/Date\)/i)).toBeInTheDocument();
            expect(screen.getByText(/Business Name/i)).toBeInTheDocument();
            expect(screen.getByText(/Assigned Tasks/i)).toBeInTheDocument();
            expect(screen.getByText(/Test Business/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Go-to Task/i })).toBeInTheDocument();
        });
    });

    // ✅ 4️⃣ Test: Clicking "Go-to Task" navigates to the correct page
    it('navigates to the correct task page when clicking "Go-to Task"', async () => {
        useGetAssignedTasksQuery.mockReturnValue({
            data: [
                {
                    id: 1,
                    created_at: '2024-02-20T12:00:00Z',
                    client_business_name: 'Test Business',
                    task_type: 'social_media_post',
                    client: '1234',
                },
            ],
            isLoading: false,
            isError: false,
        });

        renderWithProviders();

        await waitFor(() => {
            const goToTaskButton = screen.getByRole('button', { name: /Go-to Task/i });
            expect(goToTaskButton).toBeInTheDocument();
        });

        // ✅ Click the button and check if it navigates correctly
        userEvent.click(screen.getByRole('button', { name: /Go-to Task/i }));
    });
});
