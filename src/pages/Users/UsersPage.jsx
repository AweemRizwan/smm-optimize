import { useState } from 'react';
import { Link } from 'react-router-dom';
import DynamicTable from '../../components/shared/DynamicTable';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import { useGetUsersQuery, useDeleteUserMutation } from '../../services/api/userApiSlice';
import {
  ErrorContainer,
  SuccessContainer,
  ToastContainer
} from '../../components/toast/Toast';
import Modal from '../../components/shared/ReUsableModal';

const UsersPage = () => {
  const [deleteUser] = useDeleteUserMutation();
  const { data: users, isLoading, isError, error } = useGetUsersQuery();

  // State for success and error messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const deleteUserHandle = async (id) => {
    try {
      await deleteUser(id).unwrap();
      setSuccessMessage('User deleted successfully!');
      setErrorMessage(''); // Clear any previous error messages
    } catch (error) {
      console.error('Failed to delete user:', error);
      setErrorMessage(error.data?.message || 'Failed to delete user.');
      setSuccessMessage(''); // Clear success message on failure
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteUserHandle(selectedUser.id)
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    }
  }

  // Column configuration for DynamicTable
  const columns = [
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'email', label: 'Email Address', classNametd: 'text-lowercase' },
    { key: 'role_display', label: 'Role' },
    { key: 'teams', label: 'Teams' },
  ];

  const formatUsersData = Array.isArray(users)
    ? users.map(user => ({
      ...user,
      teams: user.teams?.length > 0
        ? user.teams.map(team => team.name).join(', ')
        : 'No Teams',
    }))
    : [];

  // Render actions for each row
  const renderActions = (user) => (
    <div className='d-flex align-items-initial gap-10'>
      <Link to={`/users/${user.id}/view`} className="button-primary primary table-btns-desig ">View</Link>
      <button
        className='button-danger danger table-btns-desig '
        onClick={() => openDeleteModal(user)}
      >
        Delete
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className='section'>
        <SkeletonLoader data-testid="skeleton-loader" count={5} height={30} width="100%" />
      </div>
    );
  }

  return (
    <div className='section'>
      <div className='max-height'>
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

        {/* Handle API fetch errors */}
        {isError && <div className="error-container">Error: {error?.data?.message || 'Failed to load users.'}</div>}

        <DynamicTable
          columns={columns}
          data={formatUsersData}
          renderActions={renderActions}
        />

        {isDeleteModalOpen && selectedUser && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title='Confirm Delete'
            buttonText='Delete'
            onConfirm={handleDeleteConfirm}
          >
            <p>
              Are you sure you want to delete the user "{selectedUser.first_name}{' '}
              {selectedUser.last_name}"?
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
