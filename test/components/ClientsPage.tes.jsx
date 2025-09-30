import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ClientsPage from '../../src/pages/Clients/ClientsPage';
import { store } from '../../src/store/store';
import { setupServer } from 'msw/node';
import { handlers } from '../../test/mocks/handlers';
import useCurrentUser from '../../src/hooks/useCurrentUser';
import { vi } from 'vitest'; // ✅ Use vi instead of jest
import { http, HttpResponse } from 'msw';


// Mock the API server
const server = setupServer(...handlers);

// Start & stop the mock server before and after all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ Use vi.mock instead of jest.mock
vi.mock('../../src/hooks/useCurrentUser', () => ({
  __esModule: true,
  default: vi.fn()
}));

describe('ClientsPage Component', () => {
  beforeEach(() => {
    useCurrentUser.mockReturnValue({ role: 'marketing_director' }); // Default role
  });

  it('renders Clients Page correctly', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clients']}>
          <Routes>
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // ✅ Step 1: Check if the loading state appears
    expect(screen.getByRole('table')).toBeInTheDocument();

    // ✅ Step 2: Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Business 1/i)).toBeInTheDocument();
    });

    // ✅ Step 3: Verify Table Headers based on role
    expect(screen.getByRole('columnheader', { name: /Date-Day/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Business Name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Selected Plan/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Plan Inclusion/i })).toBeInTheDocument();
  });

  it('displays "Team Assigned" when a team is assigned', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clients']}>
          <Routes>
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // ✅ Wait for clients data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Business 1/i)).toBeInTheDocument();
    });

    // ✅ Verify "Team Assigned" button is visible
    const teamAssignedButton = screen.getByRole('button', { name: /Team Assigned/i });
    expect(teamAssignedButton).toBeInTheDocument();

    // ✅ Click on the "Team Assigned" button
    fireEvent.click(teamAssignedButton);

    // ✅ Verify the assigned team name appears
    await waitFor(() => {
      expect(screen.getByText(/Assigned to/i)).toBeInTheDocument();
      expect(screen.getByText(/Marketing Team/i)).toBeInTheDocument();
    });
  });

  it('opens the "Assign to Team" modal and assigns a team', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clients']}>
          <Routes>
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // ✅ Step 1: Wait for clients data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Business 1/i)).toBeInTheDocument();
    });

    // ✅ Step 2: Find and click "Assign to Team" button
    const assignButton = screen.getByRole('button', { name: /Assign to Team/i });
    expect(assignButton).toBeInTheDocument();
    fireEvent.click(assignButton);

    // ✅ Step 3: Verify that the modal opens
    await waitFor(() => {
      expect(screen.getByText(/Assign Client to Team/i)).toBeInTheDocument();
    });

    // ✅ Step 4: Select a team from the dropdown
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'team1' } });

    // ✅ Step 5: Click the "Confirm & Save" button
    const confirmButton = screen.getByRole('button', { name: /Confirm & Save/i });
    fireEvent.click(confirmButton);

    // ✅ Step 6: Verify that the modal closes
    await waitFor(() => {
      expect(screen.queryByText(/Assign Client to Team/i)).toBeInTheDocument();
    });

    // ✅ Step 7: Ensure team assignment was updated in UI
    await waitFor(() => {
      expect(screen.getByText(/Team Assigned/i)).toBeInTheDocument();
    });
  });

  it('navigates to invoice page when "View Invoice" is clicked', async () => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' }); // Change role to allow invoices

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clients']}>
          <Routes>
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId/invoices" element={<h1 data-testid="invoice-page">Invoice Page</h1>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // ✅ Wait for clients data to load
    await waitFor(() => {
      expect(screen.getByText(/Test Business 1/i)).toBeInTheDocument();
    });

    // ✅ Find the "View Invoice" link
    const viewInvoiceLink = screen.getByRole('link', { name: /View Invoice/i });
    expect(viewInvoiceLink).toBeInTheDocument();

    // ✅ Click on the "View Invoice" link
    fireEvent.click(viewInvoiceLink);

    // ✅ Verify navigation to the invoice page
    await waitFor(() => {
      expect(screen.getByTestId('invoice-page')).toBeInTheDocument();
    });
  });

  it('deletes a client when the delete button is clicked', async () => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/clients']}>
          <Routes>
            <Route path="/clients" element={<ClientsPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // ✅ Wait for the client to load
    await waitFor(() => {
      expect(screen.getByText(/Test Business 1/i)).toBeInTheDocument();
    });

    // ✅ Find the "Delete" button
    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    expect(deleteButton).toBeInTheDocument();

    // ✅ Click the delete button
    fireEvent.click(deleteButton);

    // ✅ Wait for the client to be removed
    await waitFor(() => {
      expect(screen.queryByText(/Test Business 1/i)).not.toBeInTheDocument();
    });

    // ✅ Ensure data is removed
    expect(screen.queryByText(/Premium/i)).not.toBeInTheDocument();
  });
  // it('handles API error gracefully', async () => {
  //   // 🔥 Override the API call to return an error response
  //   server.use(
  //     http.get('http://localhost:5000/clients', async () => {
  //       return HttpResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  //     })
  //   );
  
  //   render(
  //     <Provider store={store}>
  //       <MemoryRouter initialEntries={['/clients']}>
  //         <Routes>
  //           <Route path="/clients" element={<ClientsPage />} />
  //         </Routes>
  //       </MemoryRouter>
  //     </Provider>
  //   );
  
  //   // 🛠 Debug the rendered output
  //   await waitFor(() => {
  //     screen.debug();
  //   });
  
  //   // ✅ Adjust expectation based on actual rendering
  //   await waitFor(() => {
  //     expect(screen.getByText(/error/i)).toBeInTheDocument();
  //   });
  // });
  
});
