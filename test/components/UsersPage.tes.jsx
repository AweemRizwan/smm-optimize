import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { handlers } from '../../test/mocks/handlers';
import { USERS } from '../../src/services/api/userApiSlice';
import { Provider } from 'react-redux';
import { setupStore } from '../../src/store/store';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import UsersPage from '../../src/pages/Users/UsersPage';
import { API_ROUTES } from '../../src/constants/apiRoutes';


// Setup mock server
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderComponent = () =>
  render(
    <Provider store={setupStore()}>
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>
    </Provider>
  );

test('renders loading state', async () => {
  renderComponent();
  expect(screen.getByTestId("skeleton-loader")).toBeInTheDocument();
});

test('renders user list correctly', async () => {
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();

    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('No Teams')).toBeInTheDocument();
  });
});

test('handles delete failure', async () => {
    server.use(
        http.delete(`http://localhost:5000${API_ROUTES.USERS.DELETE(':id')}`, async ({ params }) => {
          return res(ctx.status(500), ctx.json({ message: 'Delete failed' }));
        })
      );

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  const deleteButtons = screen.getAllByText('Delete');
  userEvent.click(deleteButtons[0]);

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    // expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to delete user'));
  });
});
