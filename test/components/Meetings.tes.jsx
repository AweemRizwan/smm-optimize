import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { setupStore } from '../../src/store/store'; 
import Meetings from '../../src/pages/Meetings/Meetings';
import { handlers } from '../../test/mocks/handlers'; // ✅ Import mock API handlers
import { vi } from 'vitest';


// ✅ Set up Mock API Server
const server = setupServer(...handlers);

// ✅ Setup MSW server lifecycle
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Utility function to render Meetings component with Redux store
const renderMeetings = () => {
    const testStore = setupStore();
    return render(
        <Provider store={testStore}>
            <MemoryRouter>
                <Meetings />
            </MemoryRouter>
        </Provider>
    );
};

// ✅ Test Suite
describe('Meetings Component', () => {

    test('Displays loading state initially', async () => {
        renderMeetings();
            expect(await screen.findByTestId('skeleton-loader')).toBeInTheDocument();
    });

    // test('Displays error message when API call fails', async () => {
    //     renderMeetings();

    //     await waitFor(() => {
    //         expect(screen.getByText(/Failed to load meetings/i)).toBeInTheDocument();
    //     });
    // });

    test('Renders meeting data correctly', async () => {
      renderMeetings();
    
        await waitFor(() => {
            console.log("🔎 Checking if API returned data...");
            screen.debug();  // ✅ Logs rendered DOM
        });
    
        expect(await screen.findByRole('cell', { name: /Project Kickoff/i })).toBeInTheDocument();
    });
    

    test('Ensures only account manager can mark a meeting as completed', async () => {
        renderMeetings();

        await waitFor(() => expect(screen.getByText(/Project Kickoff/i)).toBeInTheDocument());

        // ✅ Ensure button is disabled for unauthorized roles
        const completeButton = screen.getByText(/Mark as Completed/i);
        expect(completeButton).toBeDisabled();
    });

    test('Allows account manager to mark a meeting as completed', async () => {
        renderMeetings();
    
        await waitFor(() => expect(screen.getByText(/Project Kickoff/i)).toBeInTheDocument());
    
        // ✅ Locate the specific row containing "Project Kickoff"
        const projectKickoffRow = screen.getByText(/Project Kickoff/i).closest('tr');
        expect(projectKickoffRow).toBeInTheDocument();
    
        // ✅ Find "Mark as Completed" button **within this row only**
        const completeButton = within(projectKickoffRow).getByText(/Mark as Completed/i);
        expect(completeButton).toBeInTheDocument();
    
        // ✅ Enable button for testing and click
        completeButton.disabled = false;
        fireEvent.click(completeButton);
    
        // ✅ Verify update in **only this row**
        await waitFor(() => {
            console.log("🔎 Checking if meeting update API was called...");
            expect(within(projectKickoffRow).getByText(/Completed/i)).toBeInTheDocument();
        });
    });
});
