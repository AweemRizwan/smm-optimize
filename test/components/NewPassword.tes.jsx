import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import NewPassword from '../../src/pages/Auth/NewPassword';
import { store } from '../../src/store/store';

// ✅ Mock react-router-dom's useNavigate function
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: vi.fn(),
    };
  });

describe('NewPassword Component', () => {
  it('renders new password form fields and button', () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password/token123/uid123']}>
          <Routes>
            <Route path="/reset-password/:token/:uid" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('heading', { name: /create new password/i })).toBeInTheDocument();
    const passwordFields = screen.getAllByLabelText(/Enter your new password /i);
    expect(passwordFields[0]).toBeInTheDocument(); // Ensure at least one field exists
    expect(screen.getByLabelText(/Confirm your new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password/token123/uid123']}>
          <Routes>
            <Route path="/reset-password/:token/:uid" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Click submit without filling in fields
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for validation errors to appear
    await waitFor(() => {
        const errorMessages = screen.getAllByText(/required/i);
        // Ensure at least two "Required" errors (for both password fields)
        expect(errorMessages.length).toBeGreaterThanOrEqual(2);   
     });
  });

  it('validates password length', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password/token123/uid123']}>
          <Routes>
            <Route path="/reset-password/:token/:uid" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Type a password that is too short
    await userEvent.type(screen.getByLabelText(/Enter your new password/i), '123');
    await userEvent.type(screen.getByLabelText(/Confirm your new password/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('validates password matching', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password/token123/uid123']}>
          <Routes>
            <Route path="/reset-password/:token/:uid" element={<NewPassword />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Type passwords that do not match
    await userEvent.type(screen.getByLabelText(/Enter your new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirm your new password/i), 'password456');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText(/\*passwords do not match/i)).toBeInTheDocument();
    });
  });
  
//   it('submits form successfully, shows success message, and navigates', async () => {
//     render(
//         <Provider store={store}>
//             <MemoryRouter initialEntries={['/reset-password/token123/uid123']}>
//                 <Routes>
//                     <Route path="/reset-password/:token/:uid" element={<NewPassword />} />
//                     <Route path="/success-password" element={<h1 data-testid="success-page">Success Page</h1>} />
//                 </Routes>
//             </MemoryRouter>
//         </Provider>
//     );

//     // ✅ Fill in valid password
//     await userEvent.type(screen.getByLabelText(/enter your new password/i), 'password123');
//     await userEvent.type(screen.getByLabelText(/confirm your new password/i), 'password123');
//     await userEvent.click(screen.getByRole('button', { name: /submit/i }));

//     // ✅ Debug the DOM
//     screen.debug();

//     // ✅ Wait for the success message before navigation
//     await waitFor(() => {
//         expect(screen.getByRole('alert')).toHaveTextContent(/password reset successful!/i);
//     });

//     // ✅ Ensure navigation happens
//     await waitFor(() => {
//         expect(screen.getByTestId('success-page')).toBeInTheDocument();
//     });
// });





//   it('shows error message when API request fails', async () => {
//     // Mock API failure response
//     server.use(
//       http.post('http://localhost:5000/auth/set-new-password', async () => {
//         return new Response(JSON.stringify({ error: 'Failed to reset password' }), {
//           status: 400,
//           headers: { 'Content-Type': 'application/json' },
//         });
//       })
//     );

//     render(
//       <Provider store={store}>
//         <MemoryRouter initialEntries={['/reset-password/token123/uid123']}>
//           <Routes>
//             <Route path="/reset-password/:token/:uid" element={<NewPassword />} />
//           </Routes>
//         </MemoryRouter>
//       </Provider>
//     );

//     // Fill in valid password
//     await userEvent.type(screen.getByLabelText(/enter your new password/i), 'password123');
//     await userEvent.type(screen.getByLabelText(/re-enter your new password/i), 'password123');
//     await userEvent.click(screen.getByRole('button', { name: /submit/i }));

//     // Wait for error message
//     await waitFor(() => {
//       expect(screen.getByText(/failed to reset password/i)).toBeInTheDocument();
//     });
//   });
});
