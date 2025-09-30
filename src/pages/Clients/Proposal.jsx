import { useEffect, useState } from 'react';
import Pdf from "../../assets/Images/pdf.png";
import { useGetProposalQuery, useUploadProposalMutation, useDeleteProposalMutation } from '../../services/api/clientApiSlice';
import { useParams } from 'react-router-dom';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  ErrorContainer,
  SuccessContainer,
  ToastContainer
} from '../../components/toast/Toast';
import Modal from '../../components/shared/ReUsableModal';


const Proposal = () => {
  const { clientId } = useParams();
  const { role } = useCurrentUser();
  const { data: proposal, isLoading, refetch } = useGetProposalQuery(clientId);
  const [uploadProposal] = useUploadProposalMutation();
  const [deleteProposal] = useDeleteProposalMutation();
  const [file, setFile] = useState(null);
  // const [status, setStatus] = useState(proposal?.status || '');
  const [status, setStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('proposal_pdf', file);

    try {
      await uploadProposal({ clientId, formData }).unwrap();
      setSuccessMessage('Proposal uploaded successfully.');
      setErrorMessage(null);
      refetch(); // ✅ Ensure the latest proposal is fetched
    } catch (error) {
      setErrorMessage('Failed to upload proposal. Please try again.');
      setSuccessMessage(null);
      console.error('Failed to upload proposal:', error);
    }
  };

  const handleEdit = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('proposal_pdf', selectedFile);

    try {
      await uploadProposal({ clientId, formData }).unwrap();
      setSuccessMessage('Proposal updated successfully.');
      setErrorMessage(null);
      refetch(); // ✅ Ensure updated proposal is fetched
    } catch (error) {
      setErrorMessage('Failed to update proposal. Please try again.');
      setSuccessMessage(null);
      console.error('Failed to update proposal:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProposal(clientId).unwrap();
      setSuccessMessage('Proposal deleted successfully.');
      setErrorMessage(null);
      refetch(); // ✅ Ensure proposal is removed from view
    } catch (error) {
      setErrorMessage('Failed to delete proposal. Please try again.');
      setSuccessMessage(null);
      console.error('Failed to delete proposal:', error);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await handleDelete();
    setIsDeleteModalOpen(false);
  };

  const handleStatusChange = async (newStatus) => {
    const formData = new FormData();
    formData.append('proposal_approval_status', newStatus);

    try {
      await uploadProposal({ clientId, formData }).unwrap();
      setStatus(newStatus);
      setSuccessMessage(`Proposal status updated to: ${newStatus}`);
      setErrorMessage(null);
      refetch(); // ✅ Ensure status update is reflected
    } catch (error) {
      setErrorMessage('Failed to update proposal status. Please try again.');
      setSuccessMessage(null);
      console.error('Failed to update proposal status:', error);
    }
  };

  const getFileName = (url) => {
    if (!url) return 'View PDF';
    // Remove query parameters if any
    const cleanUrl = url.split('?')[0];
    // Remove hash if any
    const cleanerUrl = cleanUrl.split('#')[0];
    // Get last part of path
    return cleanerUrl.split('/').pop() || 'View PDF';
  };

  useEffect(() => {
    if (proposal?.proposal_approval_status) {
      setStatus(proposal.proposal_approval_status);
    }
  }, [proposal]);

  if (isLoading) return <p>Loading proposal...</p>;

  return (
    <div className='section'>
      <h2 className='mb-1'>Service Proposal</h2>

      <ToastContainer>
        {successMessage && (
          <SuccessContainer
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}
        {errorMessage && (
          <ErrorContainer
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}
      </ToastContainer>

      {!proposal?.proposal_pdf && role !== 'marketing_manager' && (
        <div className="no-proposal-message text-center pxy-15 border border-radius section mt-3">
          <p>No proposal has been uploaded yet.</p>
        </div>
      )}

      {role === 'marketing_manager' && !proposal?.proposal_pdf && (
        <div className='row pxy-15 mt-1 border border-radius d-flex-space-between align-center mb-1 section mt-3'>
          <div className='col-xl-6 align-center d-flex gap-10'>
            <img src={Pdf} alt="PDF Icon" />
            <span>Upload Proposal</span>
          </div>
          <div className='col-xl-6 text-right'>
            <label className=''>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <span className='upload-pdf-button text-center inline-block cursor-pointer'>Upload</span>
            </label>
            <button className='button-primary primary ml-2' onClick={handleUpload}>Submit</button>
          </div>
        </div>
      )}

      {/* Show the proposal file and actions */}
      {proposal?.proposal_pdf && (
        <div className='section pxy-15 border-radius mt-3'>
          <div className='row no-gutter border border-radius d-flex-space-between align-center'>
            <div className='col-xl-6 align-center d-flex gap-10'>
              <img src={Pdf} alt="PDF Icon" />
              <a
                href={proposal.proposal_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                {getFileName(proposal.proposal_pdf)}
              </a>
            </div>

            {/* Marketing Manager Actions */}
            {role === 'marketing_manager' && (
              <div className='col-xl-6 text-right gap-10 d-flex justify-end'>
                <a
                  href={proposal.proposal_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className='view-btn button-primary button primary'
                >
                  View
                </a>
                <label className='upload-proposal d-flex'>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleEdit}
                    style={{ display: 'none' }}
                  />
                  <span className='button button-dark dark button'>Edit</span>
                </label>
                <button className='button-danger danger button' onClick={openDeleteModal}>Delete</button>
              </div>
            )}


            {role === 'account_manager' && (
              <div className='col-xl-6 text-right gap-10 d-flex justify-end'>
                {status === 'approved' ? (
                  <button className='button-secondary'>Proposal Approved</button>
                ) : status === 'changes' ? (
                  <button className='button-primary'>Changes Required</button>
                ) : status === 'declined' ? (
                  <button className='button-danger'>Proposal Declined</button>
                ) : (
                  <>
                    <button className='button button-primary primary' onClick={() => handleStatusChange('approved')}>
                      Approve
                    </button>
                    <button className='button button-dark dark' onClick={() => handleStatusChange('changes')}>
                      Request Changes
                    </button>
                    <button className='button button-danger danger' onClick={() => handleStatusChange('declined')}>
                      Decline
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
          buttonText="Delete"
          onConfirm={handleDeleteConfirm}
        >
          <p>Are you sure you want to delete this proposal?</p>
        </Modal>
      )}
    </div>
  );
};

export default Proposal;
