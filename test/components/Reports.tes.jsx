import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reports from '../../src/pages/Clients/Reports';
import { vi } from 'vitest';

// Mock API hooks
import {
  useCreateMonthlyReportMutation,
  useDeleteMonthlyReportMutation,
  useGetMonthlyReportsQuery,
  useUpdateMonthlyReportMutation,
} from '../../src/services/api/monthlyReportsApiSlice';

import { useGetClientCalendarsQuery } from '../../src/services/api/clientApiSlice';
import useCurrentUser from '../../src/hooks/useCurrentUser';

// 🔥 Mock API hooks
vi.mock('../../src/hooks/useCurrentUser', () => ({
  default: vi.fn(),
}));

vi.mock('../../src/services/api/monthlyReportsApiSlice', () => ({
  useCreateMonthlyReportMutation: vi.fn(),
  useDeleteMonthlyReportMutation: vi.fn(),
  useGetMonthlyReportsQuery: vi.fn(),
  useUpdateMonthlyReportMutation: vi.fn(),
}));

vi.mock('../../src/services/api/clientApiSlice', () => ({
  useGetClientCalendarsQuery: vi.fn(),
}));

describe('Reports Page', () => {
  let mockCreateReport, mockDeleteReport, mockUpdateReport;

  beforeEach(() => {
    useCurrentUser.mockReturnValue({ role: 'marketing_manager' });

    mockCreateReport = vi.fn();
    mockDeleteReport = vi.fn();
    mockUpdateReport = vi.fn();

    useCreateMonthlyReportMutation.mockReturnValue([mockCreateReport]);
    useDeleteMonthlyReportMutation.mockReturnValue([mockDeleteReport]);
    useUpdateMonthlyReportMutation.mockReturnValue([mockUpdateReport]);

    useGetClientCalendarsQuery.mockReturnValue({
      data: [{ calendar_id: 1, month_name: 'January' }],
      isLoading: false,
    });

    useGetMonthlyReportsQuery.mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  it('renders the component correctly', () => {
    render(<Reports />);
    
    // Ensure the "Service Reports" heading is present
    expect(screen.getByText(/Service Reports/i)).toBeInTheDocument();
    
    // Select dropdown for month selection
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
  
  it('allows selecting a month', async () => {
    render(<Reports />);
  
    // Get the select dropdown
    const select = screen.getByRole('combobox');
  
    // Select "January"
    fireEvent.change(select, { target: { value: 'January' } });
  
    await waitFor(() => {
      expect(select.value).toBe('January');
    });
  });
  

  it('shows loading state when calendars are being fetched', () => {
    useGetClientCalendarsQuery.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<Reports />);
    expect(screen.getByText(/Loading calendars.../i)).toBeInTheDocument();
  });

  it('displays a message when no month is selected', () => {
    render(<Reports />);
    expect(
      screen.getByText(/Please select a month to view & enable file upload/i)
    ).toBeInTheDocument();
  });

  it('allows selecting a month', async () => {
    render(<Reports />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'January' } });

    await waitFor(() => {
      expect(select.value).toBe('January');
    });
  });

  it('disables upload button if no month is selected', () => {
    render(<Reports />);
    expect(screen.getByRole('button', { name: /Upload/i })).toBeDisabled();
  });

  it('enables file upload when a month is selected', async () => {
    render(<Reports />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'January' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Upload/i })).toBeEnabled();
    });
  });

  it('calls the upload function when submitting a report', async () => {
    render(<Reports />);

    // Select a month
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'January' } });

    // Create a mock file
    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' });

    // Upload file
    const fileInput = screen.getByLabelText(/Upload/i, { selector: 'input' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /Upload/i }));

    await waitFor(() => {
      expect(mockCreateReport).toHaveBeenCalled();
    });
  });

  it('displays "No report available" if no report exists for the selected month', async () => {
    render(<Reports />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'January' } });

    await waitFor(() => {
      expect(screen.getByText(/No report available for the selected month/i)).toBeInTheDocument();
    });
  });

  it('shows a report if available', async () => {
    useGetMonthlyReportsQuery.mockReturnValue({
      data: { month_name: 'January', monthly_reports: 'https://example.com/report.pdf' },
      isLoading: false,
    });

    render(<Reports />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'January' } });

    await waitFor(() => {
      expect(screen.getByText(/January Report/i)).toBeInTheDocument();
    });
  });

  it('calls the edit function when clicking "Edit"', async () => {
    const mockUpdateReport = vi.fn();
    useUpdateMonthlyReportMutation.mockReturnValue([mockUpdateReport]);
  
    useGetMonthlyReportsQuery.mockReturnValue({
      data: { id: 1, month_name: 'January', monthly_reports: 'https://example.com/report.pdf' },
      isLoading: false,
    });
  
    render(<Reports />);
  
    // Select "January" from dropdown
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'January' } });
  
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });
  
    // Spy on `document.createElement` to simulate the file input
    const mockFileInput = document.createElement('input');
    mockFileInput.type = 'file';
    mockFileInput.accept = 'application/pdf';
  
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockFileInput);
  
    // Click the "Edit" button
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));
  
    // Simulate selecting a file
    const testFile = new File(['content'], 'updated.pdf', { type: 'application/pdf' });
    fireEvent.change(mockFileInput, { target: { files: [testFile] } });
  
    await waitFor(() => {
      expect(mockUpdateReport).toHaveBeenCalled();
    });
  
    // Cleanup
    createElementSpy.mockRestore();
  });
  
  
  
  it('calls the delete function when clicking "Delete"', async () => {
    useGetMonthlyReportsQuery.mockReturnValue({
      data: { id: 1, month_name: 'January', monthly_reports: 'https://example.com/report.pdf' },
      isLoading: false,
    });

    render(<Reports />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'January' } });

    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Delete/i }));
    });

    await waitFor(() => {
      expect(mockDeleteReport).toHaveBeenCalled();
    });
  });
});
