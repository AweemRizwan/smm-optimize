import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import ClientForm from '../../src/components/Form/ClientForm';
import { store } from '../../src/store/store';
import { vi } from 'vitest'; // ✅ Use vi instead of jest

describe('ClientForm Component', () => {
  const initialValues = {
    businessName: '',
    businessDetails: '',
    businessAddress: '',
    businessWhatsappNumber: '',
    businessEmailAddress: '',
    targetRegion: '',
    businessOfferings: '',
    businessWebsite: '',
    contactPerson: '',
    brandKeyPoints: '',
    brandGuidelinesLink: '',
    goalsObjectives: '',

    brandGuidelinesNotes: '',
    ugcDriveLink: '',
    additionalNotes: '',
    socialHandles: [],
    services: [],
  };

  const handleSubmit = vi.fn();

  it('renders the ClientForm component correctly', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ClientForm initialValues={initialValues} onSubmit={handleSubmit} />
        </MemoryRouter>
      </Provider>
    );

    // ✅ Check for required form elements
    expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Details/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business WhatsApp Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Person/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Client/i })).toBeInTheDocument();
  });

  it('validates required fields and prevents submission with missing data', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ClientForm initialValues={initialValues} onSubmit={handleSubmit} />
        </MemoryRouter>
      </Provider>
    );

    // ✅ Click submit without filling out any fields
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    // ✅ Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText(/Business name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business details are required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business WhatsApp number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business Email address is required/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully with valid data', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ClientForm initialValues={initialValues} onSubmit={handleSubmit} />
        </MemoryRouter>
      </Provider>
    );

    // ✅ Fill in valid form data
    fireEvent.change(screen.getByLabelText(/Business Name/i), { target: { value: 'Test Business' } });
    fireEvent.change(screen.getByLabelText(/Business Details/i), { target: { value: 'Marketing Services' } });
    fireEvent.change(screen.getByLabelText(/Business Address/i), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText(/Business WhatsApp Number/i), { target: { value: '1234567890' } });
    fireEvent.change(screen.getByLabelText(/Business Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Business Website/i), { target: { value: 'https://test.com' } });
    fireEvent.change(screen.getByLabelText(/Contact Person/i), { target: { value: 'John Doe' } });

    // ✅ Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    // ✅ Ensure submission function was called
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  it('handles API error gracefully', async () => {
    // 🔥 Override the API to return an error response
    server.use(
      http.post('http://localhost:5000/clients', async () => {
        return HttpResponse.json({ error: 'Business name is required' }, { status: 400 });
      })
    );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ClientForm initialValues={initialValues} onSubmit={handleSubmit} />
        </MemoryRouter>
      </Provider>
    );

    // ✅ Leave "Business Name" empty and submit
    fireEvent.click(screen.getByRole('button', { name: /Create Client/i }));

    // ✅ Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Business name is required/i)).toBeInTheDocument();
    });
  });
});
