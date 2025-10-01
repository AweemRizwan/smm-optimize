import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';  // Import BrowserRouter normally
import { Provider } from 'react-redux';
import { store } from '../../src/store/store';  // Import the real store
import LoginForm from '../../src/pages/Auth/LoginForm';  // Adjust path if needed


describe('LoginForm', () => {
  it('renders login form perfectly', () => {
    render(
      <Provider store={store}> {/* Wrap in Provider with the actual store */}
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Check that username and password fields are present
    expect(screen.getByRole('heading', { text: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { text: /Forgot password/i })).toBeInTheDocument();
  });

  it('shows success message on successful login', async () => {
    render(
      <Provider store={store}> {/* Wrap in Provider with the actual store */}
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

    // Simulate user input
    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));


     // Wait for the success message
     expect(await screen.findByText(/login successful/i)).toBeInTheDocument();
    // Debug output to inspect the DOM if the test fails
    screen.debug();
  });

  it('shows error message on invalid login', async () => {
    render(
      <Provider store={store}> {/* Wrap in Provider with the actual store */}
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );

  // Simulate user input with invalid credentials
  await userEvent.type(screen.getByLabelText(/username/i), 'wronguser');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
  await userEvent.click(screen.getByRole('button', { name: /login/i }));

  // Wait for the error message
  expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  });

  it('navigates to the Forgot Password page when the link is clicked', async () => {
    render(
      <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<div>Forgot Password Page</div>} /> {/* Mock Forgot Password Page */}
        </Routes>
      </MemoryRouter>
    </Provider>
    );
 // Find and click the "Forgot password?" link
 await userEvent.click(screen.getByRole('link', { name: /forgot password/i }));

 // Wait and check if "Forgot Password Page" is now in the DOM
 expect(await screen.findByText(/forgot password page/i)).toBeInTheDocument();
  });
});
