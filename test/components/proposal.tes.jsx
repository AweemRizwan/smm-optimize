import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Proposal from '../../src/pages/Clients/Proposal';
import { useParams } from 'react-router-dom';
import useCurrentUser from '../../src/hooks/useCurrentUser';
import { useGetProposalQuery, useUploadProposalMutation, useDeleteProposalMutation } from '../../src/services/api/clientApiSlice';

// Mock Hooks and API Calls
vi.mock('../../src/hooks/useCurrentUser', () => ({ default: vi.fn() }));
vi.mock('../../src/services/api/clientApiSlice', () => ({
  useGetProposalQuery: vi.fn(),
  useUploadProposalMutation: vi.fn(),
  useDeleteProposalMutation: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: vi.fn(),
}));

describe('Proposal Component', () => {
  beforeEach(() => {
    useParams.mockReturnValue({ clientId: '123' });
  });

  const mockUploadProposal = vi.fn();
  const mockDeleteProposal = vi.fn();

  beforeEach(() => {
    useUploadProposalMutation.mockReturnValue([mockUploadProposal]);
    useDeleteProposalMutation.mockReturnValue([mockDeleteProposal]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders "No proposal uploaded" message when no proposal exists', async () => {
    // Mock user role as NON-marketing manager
    useCurrentUser.mockReturnValue({ role: 'account_manager' });
  
    // Mock API response with no proposal data
    useGetProposalQuery.mockReturnValue({ data: {}, isLoading: false });
  
    render(<Proposal />);
  
    // ✅ Ensure "No proposal uploaded" message appears
    await waitFor(() => {
      expect(screen.getByText(/No proposal has been uploaded yet/i)).toBeInTheDocument();
    });
  });
  
  

  it('renders upload section for marketing manager when no proposal exists', () => {
    useCurrentUser.mockReturnValue({ role: 'marketing_manager' });
    useGetProposalQuery.mockReturnValue({ data: null, isLoading: false });

    render(<Proposal />);

    expect(screen.getByText(/Upload Proposal/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('renders proposal file when it exists', () => {
    useCurrentUser.mockReturnValue({ role: 'marketing_manager' });
    useGetProposalQuery.mockReturnValue({
      data: { proposal_pdf: 'https://example.com/proposal.pdf' },
      isLoading: false,
    });

    render(<Proposal />);

    expect(screen.getByText(/proposal.pdf/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /proposal.pdf/i })).toHaveAttribute(
      'href',
      'https://example.com/proposal.pdf'
    );
  });

  it('renders approval buttons for account manager', () => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' });
    useGetProposalQuery.mockReturnValue({
      data: { proposal_pdf: 'https://example.com/proposal.pdf', status: '' },
      isLoading: false,
    });

    render(<Proposal />);

    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decline/i })).toBeInTheDocument();
  });

  it('calls the upload function when submitting a proposal', async () => {
    // ✅ Mock user role as "marketing_manager"
    useCurrentUser.mockReturnValue({ role: 'marketing_manager' });
  
    // ✅ Mock API response with no proposal data
    useGetProposalQuery.mockReturnValue({ data: {}, isLoading: false });
  
    // ✅ Mock the upload function
    const mockUploadProposal = vi.fn();
    useUploadProposalMutation.mockReturnValue([mockUploadProposal]);
  
    render(<Proposal />);
  
    // ✅ Find the file input correctly
    const fileInput = screen.getByLabelText(/Upload/i, { selector: 'input' });
  
    // ✅ Create a mock file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
  
    // ✅ Simulate file selection
    fireEvent.change(fileInput, { target: { files: [file] } });
  
    // ✅ Click Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
  
    // ✅ Ensure upload function was called
    await waitFor(() => {
      expect(mockUploadProposal).toHaveBeenCalled();
    });
  });
  
  

  it('calls the delete function when deleting a proposal', async () => {
    useCurrentUser.mockReturnValue({ role: 'marketing_manager' });
    useGetProposalQuery.mockReturnValue({
      data: { proposal_pdf: 'https://example.com/proposal.pdf' },
      isLoading: false,
    });

    render(<Proposal />);

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(mockDeleteProposal).toHaveBeenCalled();
    });
  });

  it('allows account manager to approve a proposal', async () => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' });
    useGetProposalQuery.mockReturnValue({
      data: { proposal_pdf: 'https://example.com/proposal.pdf', status: '' },
      isLoading: false,
    });

    render(<Proposal />);

    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));

    await waitFor(() => {
      expect(mockUploadProposal).toHaveBeenCalledWith({
        clientId: '123',
        formData: expect.any(FormData),
      });
    });
  });

  it('allows account manager to request changes to a proposal', async () => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' });
    useGetProposalQuery.mockReturnValue({
      data: { proposal_pdf: 'https://example.com/proposal.pdf', status: '' },
      isLoading: false,
    });

    render(<Proposal />);

    fireEvent.click(screen.getByRole('button', { name: /Request Changes/i }));

    await waitFor(() => {
      expect(mockUploadProposal).toHaveBeenCalledWith({
        clientId: '123',
        formData: expect.any(FormData),
      });
    });
  });

  it('allows account manager to decline a proposal', async () => {
    useCurrentUser.mockReturnValue({ role: 'account_manager' });
    useGetProposalQuery.mockReturnValue({
      data: { proposal_pdf: 'https://example.com/proposal.pdf', status: '' },
      isLoading: false,
    });

    render(<Proposal />);

    fireEvent.click(screen.getByRole('button', { name: /Decline/i }));

    await waitFor(() => {
      expect(mockUploadProposal).toHaveBeenCalledWith({
        clientId: '123',
        formData: expect.any(FormData),
      });
    });
  });
});
