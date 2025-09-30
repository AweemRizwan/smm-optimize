import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../src/pages/Auth/ForgotPassword';
import { store } from '../../src/store/store';

describe('ForgotPassword Screen', () => {
  it('renders Forgot Password screen perfectly', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      </Provider>
    );

    // Check if heading and input fields are rendered
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows success message when valid email is submitted', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      </Provider>
    );

    // Simulate user input and submit the form
    await userEvent.type(screen.getByLabelText(/email address/i), 'valid@example.com');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // ✅ Check for the correct success message
    await waitFor(() => {
      expect(screen.getByText(/password reset link sent/i)).toBeInTheDocument();
    });

    screen.debug(); // ✅ Print the DOM to debug if the test still fails
  });

  it('shows error message when invalid email is submitted', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      </Provider>
    );

    // Simulate user input and submit the form
    await userEvent.type(screen.getByLabelText(/email address/i), 'invalid-email');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // Expect validation error message
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when email field is empty', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      </Provider>
    );

    // Simulate form submission without filling in the email field
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));

    // Expect validation error message
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
