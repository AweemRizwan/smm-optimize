import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { setupStore } from '../../src/store/store'; 
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers';  // ✅ Import mock handlers
import ThreadPage from '../../src/pages/Clients/Threads';
import { vi } from 'vitest';

// ✅ Set up the mock server with handlers from `mockHandlers.js`
const server = setupServer(...handlers);

// ✅ Setup MSW server lifecycle
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderThreadPage = (clientId = '123') => {
    const testStore = setupStore();
    return render(
        <Provider store={testStore}>
            <MemoryRouter initialEntries={[`/threads/${clientId}`]}>
                <Routes>
                    <Route path="/threads/:clientId" element={<ThreadPage />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

// ✅ Test Suite
describe('ThreadPage Component', () => {
    
    test('Displays loading message initially', () => {
        renderThreadPage();
        expect(screen.getByText(/Loading messages/i)).toBeInTheDocument();
    });

    test('Renders messages when API returns data', async () => {
        renderThreadPage();

        await waitFor(() => {
            expect(screen.getByText(/Hello, this is a test message!/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin/i)).toBeInTheDocument();
    });

    // test('Displays error message when API fails', async () => {
    //     renderThreadPage();

    //     await waitFor(() => 
    //         expect(screen.getByText(/Error loading messages/i)).toBeInTheDocument()
    //     );
    // });

    test('Allows user to send a message and clears input', async () => {
        renderThreadPage();
        
        await waitFor(() => 
            expect(screen.getByText(/Hello, this is a test message!/i)).toBeInTheDocument()
        );

        const messageInput = screen.getByPlaceholderText(/Type your message here/i);
        fireEvent.change(messageInput, { target: { value: 'New test message' } });

        const sendButton = screen.getByText(/Send/i);
        fireEvent.click(sendButton);

        await waitFor(() => 
            expect(screen.getByPlaceholderText(/Type your message here/i)).toHaveValue('')
        );
    });
    
    test('Disables send button while submitting', async () => {
        renderThreadPage();
    
        await waitFor(() => {
            screen.debug(); // ✅ Prints the rendered DOM
        });
    
        const messageInput = screen.getByPlaceholderText(/Type your message here/i);
        const sendButton = screen.getByText(/Send/i);
    
        fireEvent.change(messageInput, { target: { value: 'New test message' } });
        fireEvent.click(sendButton);
    
        expect(sendButton).toBeDisabled();
        
        await waitFor(() => expect(sendButton).not.toBeDisabled());
    });
    

});
