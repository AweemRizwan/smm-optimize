import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { setupStore } from '../../src/store/store';
import { setupServer } from 'msw/node';
import { http } from 'msw';
import CreateUser from '../../src/pages/Users/CreateUser';
import { API_ROUTES } from '../../src/constants/apiRoutes';

// ✅ Mock API Server
const server = setupServer(
    http.post(`http://localhost:5000${API_ROUTES.USERS.CREATE}`, async ({ request }) => {
        const userData = await request.json();
        console.log("📡 Mock API received new user:", userData);
        return new Response(JSON.stringify({ message: 'User created successfully!' }), { status: 201 });
    })
);

// ✅ Setup MSW server lifecycle
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Utility function to render `CreateUser`
const renderCreateUser = () => {
    const testStore = setupStore();
    return render(
        <Provider store={testStore}>
            <MemoryRouter>
                <CreateUser />
            </MemoryRouter>
        </Provider>
    );
};

describe('CreateUser Component', () => {
    test('Renders Create User page correctly', async () => {
        renderCreateUser();
    
        // ✅ Ensure the heading exists
        expect(screen.getByRole('heading', { name: /Create User/i })).toBeInTheDocument();
    
        // ✅ Ensure the paragraph "New User" is correctly targeted
        expect(screen.getByText(/New User/i, { selector: 'p' })).toBeInTheDocument();
    
        // ✅ Ensure the submit button exists
        expect(screen.getByRole('button', { name: /Create New User/i })).toBeInTheDocument();
    });
    

    test('Handles successful user creation and displays success message', async () => {
        renderCreateUser();

        // ✅ Fill in the form
        fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: 'john@example.com' } });

        // ✅ Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Create New User/i }));

        // ✅ Check for success message
        await waitFor(() => {
            expect(screen.getByText(/User created successfully!/i)).toBeInTheDocument();
        });

        // ✅ Ensure error message is NOT displayed
        expect(screen.queryByText(/Failed to create user/i)).not.toBeInTheDocument();
    });

    // test('Handles API failure and displays error message', async () => {
    //     // ✅ Mock API failure response
    //     server.use(
    //         http.post('http://localhost:5000/users', async (req, res, ctx) => {
    //             return res(ctx.status(400), ctx.json({ message: "Failed to create user" }));
    //         })
    //     );
    
    //     renderCreateUser();
    
       
    //     // ✅ Fill out required fields
    //     fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    //     fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    //     fireEvent.change(screen.getByPlaceholderText(/Email Address/i), { target: { value: 'john@example.com' } });

    //     // ✅ Select Role
    //     fireEvent.change(screen.getByRole('combobox', { name: /Role/i }), { target: { value: 'marketing_manager' } });

    //     // ✅ Click "Create New User"
    //     fireEvent.click(screen.getByRole('button', { name: /Create New User/i }));

    //     // ✅ **Wait for the error message to appear**
    //     await waitFor(() => {
    //         expect(screen.getByText(/Failed to create user/i)).toBeInTheDocument();
    //     });

    //     // ✅ Ensure the form is still visible for retry
    //     expect(screen.getByRole('button', { name: /Create New User/i })).toBeInTheDocument();
    // });
    
    
});
