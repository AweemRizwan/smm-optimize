import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordLink from '../../src/pages/Auth/ResetPasswordLink';

describe('ResetPasswordLink Component', () => {
  it('renders the Forgot Password confirmation message', () => {
    render(
      <MemoryRouter>
        <ResetPasswordLink />
      </MemoryRouter>
    );

    // Check if heading is rendered
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    
    // Check if confirmation message is present
    expect(screen.getByText(/a one-time password reset link has been sent/i)).toBeInTheDocument();
    
    // Check if the "Back to login" button is present
    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });

  it('navigates to login page when "Back to login" button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password-link']}>
        <ResetPasswordLink />
      </MemoryRouter>
    );

    // Find the "Back to login" button
    const backToLoginButton = screen.getByRole('link', { name: /back to login/i });

    // Click the button
    await userEvent.click(backToLoginButton);

    // Verify navigation by checking the href attribute
    expect(backToLoginButton).toHaveAttribute('href', '/login');
  });
});
