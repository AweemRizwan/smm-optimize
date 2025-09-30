import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import ClientForm from '../../src/components/Form/ClientForm';
import useCurrentUser from '../../src/hooks/useCurrentUser';
import { vi } from 'vitest';

// 🔥 Mock `useCurrentUser` hook properly for Vitest
vi.mock('../../src/hooks/useCurrentUser', () => ({
  default: vi.fn(),
}));

describe('ClientForm Component', () => {
  beforeEach(() => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' });
  });

  const initialValues = {
    businessName: '',
    businessDetails: '',
    businessAddress: '',
    businessWhatsappNumber: '',
    businessEmailAddress: '',
    targetRegion: '',
    businessWebsite: '',
    contactPerson: '',
    brandGuidelinesLink: '',
    ugcDriveLink: '',
    goalsObjectives: '',
    brand_guidelines_notes: '',
    websiteType: '',
    numOfProducts: '',
    membership: '',
    websiteStructure: '',
    designPreference: '',
    webdevelopmentnotes: '',
    domain: '',
    hosting: '',
    websiteManagement: '',
    selfUpdate: '',
    contentPrepared: '',
    additionalNotes: '',
    services: [],
  };

  const mockOnSubmit = vi.fn();

  const renderComponent = (values = initialValues) => {
    render(
      <Formik initialValues={values} onSubmit={mockOnSubmit}>
        <ClientForm initialValues={values} onSubmit={mockOnSubmit} />
      </Formik>
    );
  };

  // ✅ Test if the form renders correctly
  it('renders the form correctly', () => {
    renderComponent();
    expect(screen.getByLabelText(/Business Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Details\/Industry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business WhatsApp Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Business Website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Person/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Brand Guidelines Link/i)).toBeInTheDocument();
  });

  // ✅ Test required field validation
  it('validates required fields', async () => {
    renderComponent();
    fireEvent.submit(screen.getByRole('button', { name: /update information/i }));
    await waitFor(() => {
      expect(screen.getByText(/Business name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business details are required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business WhatsApp number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business Email address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Business website is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Contact person is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Brand guidelines link is required/i)).toBeInTheDocument();
    });
  });

  // ✅ Test email format validation
  it('validates email format', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Business Email Address/i), { target: { value: 'invalid-email' } });
    fireEvent.submit(screen.getByRole('button', { name: /update information/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invalid business email format/i)).toBeInTheDocument();
    });
  });

  // ✅ Test conditional field visibility when selecting Social Media services
  it('shows/hides conditional fields based on selected services', async () => {
    renderComponent();
    const socialMediaCheckbox = screen.getByLabelText(/Social Media Services/i);
    fireEvent.click(socialMediaCheckbox);

    await waitFor(() => {
      expect(screen.getByLabelText(/Target Region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/UGC Drive Link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Goals and Objectives/i)).toBeInTheDocument();
    });

    fireEvent.click(socialMediaCheckbox);
    await waitFor(() => {
      expect(screen.queryByLabelText(/Target Region/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/UGC Drive Link/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Goals and Objectives/i)).not.toBeInTheDocument();
    });
  });

  // ✅ Test URL validation
  it('validates URLs', async () => {
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Business Website/i), { target: { value: 'not-a-url' } });
    fireEvent.submit(screen.getByRole('button', { name: /update information/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invalid URL/i)).toBeInTheDocument();
    });
  });
  it('checks behavior when only Web Development is selected', async () => {
    renderComponent();
  
    // Click "Web Development Services"
    const webDevCheckbox = screen.getByLabelText(/Web Development Services/i);
    fireEvent.click(webDevCheckbox);
  
    // Verify fields for Web Development appear, and Social Media ones do NOT
    await waitFor(() => {
      expect(screen.getByText(/Website Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Ecommerce \(Products\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Offer Services/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Website Structure/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/Target Region/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/UGC Drive Link/i)).not.toBeInTheDocument();
    });
  
    // Ensure "No. of Products" is hidden initially
    expect(screen.queryByLabelText(/No. of Products/i)).not.toBeInTheDocument();
  
    // Select "Ecommerce" and check that "No. of Products" appears
    fireEvent.click(screen.getByLabelText(/Ecommerce \(Products\)/i));
    await waitFor(() => {
      expect(screen.getByLabelText(/No. of Products/i)).toBeInTheDocument();
    });
  
    // Select "Offer Services" and ensure "No. of Products" disappears
    fireEvent.click(screen.getByLabelText(/Offer Services/i));
    await waitFor(() => {
      expect(screen.queryByLabelText(/No. of Products/i)).not.toBeInTheDocument();
    });
  });
  

  it('checks behavior when both Social Media & Web Development are selected and toggles "No. of Products" correctly', async () => {
    renderComponent();
  
    // Select both services
    const socialMediaCheckbox = screen.getByLabelText(/Social Media Services/i);
    const webDevCheckbox = screen.getByLabelText(/Web Development Services/i);
    fireEvent.click(socialMediaCheckbox);
    fireEvent.click(webDevCheckbox);
  
    // Verify all relevant fields appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Target Region/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/UGC Drive Link/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Goals and Objectives/i)).toBeInTheDocument();
      expect(screen.getByText(/Website Type/i)).toBeInTheDocument();
expect(screen.getByRole('heading', { name: /Website Structure/i })).toBeInTheDocument();
    });
  
    // Initially, "No. of Products" should NOT be visible
    expect(screen.queryByLabelText(/No. of Products/i)).not.toBeInTheDocument();
  
    // Select "Ecommerce" as Website Type
    fireEvent.click(screen.getByLabelText(/Ecommerce \(Products\)/i));
  
    // "No. of Products" should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/No. of Products/i)).toBeInTheDocument();
    });
  
    // Select "Offer Services" instead
    fireEvent.click(screen.getByLabelText(/Offer Services/i));
  
    // "No. of Products" should disappear
    await waitFor(() => {
      expect(screen.queryByLabelText(/No. of Products/i)).not.toBeInTheDocument();
    });
  });
  

  // ✅ Test adding and removing social handles
  it('adds and removes social handles', async () => {
    renderComponent();
    const addSocialButton = screen.getByRole('button', { name: /\+ Add Social/i });
    fireEvent.click(addSocialButton);

    await waitFor(() => {
      expect(screen.getByText(/Select Platform/i)).toBeInTheDocument();
    });

    const removeButton = screen.getByText(/Delete/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Select Platform/i)).not.toBeInTheDocument();
    });
  });

  // ✅ Test successful form submission
  it('submits the form when all required fields are filled', async () => {
    renderComponent({
      businessName: 'Test Business',
      businessDetails: 'Marketing Agency',
      businessAddress: '123 Test Street',
      businessWhatsappNumber: '1234567890',
      businessEmailAddress: 'test@example.com',
      businessWebsite: 'https://test.com',
      contactPerson: 'John Doe',
      brandGuidelinesLink: 'https://drive.google.com/test',
      services: ['socialMedia'],
      targetRegion: 'Canada',
      ugcDriveLink: 'https://drive.google.com/test',
      goalsObjectives: 'Goals and Objectives',
      brand_guidelines_notes: 'Brand Guidelines Notes',
    });

    fireEvent.submit(screen.getByRole('button', { name: /update information/i }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
