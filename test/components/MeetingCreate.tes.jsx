import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupServer } from 'msw/node';
import { http } from 'msw';
import { setupStore } from '../../src/store/store'; 
import MeetingCreate from '../../src/pages/Meetings/MeetingCreate';
import { handlers } from '../../test/mocks/handlers'; // ✅ Import mock API handlers
import { vi } from 'vitest';

// ✅ Set up the mock server with handlers from `mockHandlers.js`
const server = setupServer(...handlers);

// ✅ Setup MSW server lifecycle
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Utility function to render MeetingCreate with Redux store
const renderMeetingCreate = () => {
    const testStore = setupStore();
    return render(
        <Provider store={testStore}>
            <MemoryRouter>
                <MeetingCreate />
            </MemoryRouter>
        </Provider>
    );
};

// ✅ Test Suite
describe('MeetingCreate Component', () => {

    test('Displays loading message when fetching clients', async () => {
        renderMeetingCreate();
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    test('Renders form fields correctly', async () => {
        renderMeetingCreate();

        // ✅ Wait for clients to load before interacting
        await waitFor(() => expect(screen.getByLabelText(/Meeting Name/i)).toBeInTheDocument());

        expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Client/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Meeting Link/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Assignee Type/i)).toBeInTheDocument();
    });

    test('Shows validation errors when submitting an empty form', async () => {
        renderMeetingCreate();

        const submitButton = screen.getByText(/Submit/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Time is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Meeting name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Client is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Link is required/i)).toBeInTheDocument();
        });
    });

    test('Successfully submits form with valid data', async () => {
        renderMeetingCreate();

        // ✅ Wait for API data to load
        await waitFor(() => expect(screen.getByLabelText(/Meeting Name/i)).toBeInTheDocument());

        // ✅ Fill out the form
        fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-02-15' } });
        fireEvent.change(screen.getByLabelText(/Time/i), { target: { value: '10:30' } });
        fireEvent.change(screen.getByLabelText(/Meeting Name/i), { target: { value: 'Project Sync' } });
        fireEvent.change(screen.getByLabelText(/Client/i), { target: { value: '1' } }); // Selecting a client
        fireEvent.change(screen.getByLabelText(/Meeting Link/i), { target: { value: 'https://meet.google.com/xyz' } });
        fireEvent.change(screen.getByLabelText(/Assignee Type/i), { target: { value: 'team' } });

        // ✅ Submit form
        const submitButton = screen.getByText(/Submit/i);
        fireEvent.click(submitButton);

        // ✅ Verify success message
        await waitFor(() => expect(screen.getByText(/Meeting created successfully!/i)).toBeInTheDocument());
    });
});