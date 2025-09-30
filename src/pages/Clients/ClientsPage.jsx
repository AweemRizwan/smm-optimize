import { Link } from 'react-router-dom';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import { useGetClientsQuery, useDeleteClientMutation, useAssignClientToTeamMutation } from '../../services/api/clientApiSlice';
import DynamicTable from '../../components/shared/DynamicTable';
import { useState } from 'react';
import Modal from '../../components/shared/ReUsableModal';
import { useGetTeamsQuery } from '../../services/api/teamApiSlice';
import { formatDateWithDay, formatKeyToName } from '../../utils/generalUtils';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  ErrorContainer,
  SuccessContainer,
  ToastContainer
} from '../../components/toast/Toast';
import SelectField from '../../components/Form/SelectField';

const ClientsPage = () => {
  const { role } = useCurrentUser();
  const { data: clients, isLoading, isError, error } = useGetClientsQuery()
  const { data: teams, isLoading: isTeamsLoading } = useGetTeamsQuery(null, { skip: role !== 'marketing_director' })
  const [deleteClient] = useDeleteClientMutation()
  const [assignClientToTeam] = useAssignClientToTeamMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState('')

  // State for error and success messages
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState(null)

  const handleDelete = async (id) => {
    try {
      await deleteClient(id).unwrap();
      setSuccessMessage('Client deleted successfully!');
      setErrorMessage(null);
    } catch (err) {
      console.error('Failed to delete the client:', err);
      setErrorMessage('Failed to delete the client. Please try again.');
      setSuccessMessage(null);
    }
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (clientToDelete) {
      await handleDelete(clientToDelete.id)
      setIsDeleteModalOpen(false)
      setClientToDelete(null)
    }
  }

  const columns = [
    { key: 'date', label: 'Date-Day' },
    { key: 'businessName', label: 'Business Name' },
    { key: 'selectedPlan', label: 'Selected Plan' },
    { key: 'planInclusion', label: 'Plan Inclusion', className: 'min-width-300' },
    ...(role === 'accountant' || role === 'account_manager' || role === 'marketing_director'
      ? [{ key: 'invoice', label: 'Invoice' }]
      : [])
  ];

  const handleAssignToTeam = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  }
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
    setSelectedTeam('')
  }

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
  };

  const handleConfirmAssign = async () => {
    if (!selectedTeam || !selectedClient) return;
    try {
      await assignClientToTeam({ clientId: selectedClient.id, team_id: selectedTeam }).unwrap();
      setSuccessMessage('Client assigned to team successfully!');
      setErrorMessage(null);
      handleCloseModal();
    } catch (err) {
      console.error('Failed to assign client to team:', err);
      setErrorMessage('Failed to assign client to team. Please try again.');
      setSuccessMessage(null);
    }
  };

  const renderActions = (client) => (
    <div className='actions-wrapper d-flex gap-10 justify-center'>
      {role === 'marketing_director' && (
        client.team ? (
          <div className='assigned-wrapper position-relative'>
            <button className="team-assigned table-btns-desig button-secondary border-none">Team Assigned</button>
            <span className="assigned-label table-btns-desig button-secondary-light mt-1">
              Assigned to <br /> <b className='ct-lab-name'>{client.team}</b>
            </span>
          </div>
        ) : (
          <button className="button-primary-light table-btns-desig mx-xl-bd" onClick={() => handleAssignToTeam(client)}>Assign to Team</button>
        ))}
      <Link to={`/clients/${client.id}/view`} className="button-primary primary table-btns-desig ">View</Link>
      {role === 'account_manager' && (
        <button
          className="button-danger danger table-btns-desig"
          onClick={() => openDeleteModal(client)}    // ← open modal instead
        >
          Delete
        </button>
      )}
    </div>
  );

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <table cellPadding="10" cellSpacing="0">
        <tbody>
          {Array(5).fill().map((_, index) => (
            <tr key={index}>
              <td colSpan="6">
                <SkeletonLoader height={30} width="100%" style={{ marginBottom: '10px' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Map clients data to match the columns required by DynamicTable
  const clientData = clients?.map((client) => {
    // Combine add_on_attributes and plan_attributes
    const addOnAttributes = client.client_plan?.add_on_attributes || {}
    const planAttributes = client.client_plan?.plan_attributes || {}
    const platforms = client.client_plan?.platforms || {}

    const combinedAttributes = { ...addOnAttributes };

    // Merge the planAttributes into combinedAttributes
    Object.entries(planAttributes).forEach(([key, value]) => {
      const addOnValue = parseFloat(combinedAttributes[key]) || 0; // Convert add_on value to number or default to 0
      const planValue = parseFloat(value) || 0; // Convert plan value to number or default to 0
      const sumValue = addOnValue + planValue;
      if (sumValue > 0) { // Only include if the sum is greater than 0
        combinedAttributes[key] = sumValue;
      } else {
        delete combinedAttributes[key]; // Remove keys with 0 value
      }
    });

    // Merge the two objects and format them into a readable string
    const planAttributesString = Object.entries(combinedAttributes)
      .map(([key, value]) => `${value} ${formatKeyToName(key)}`)
      .join(', ');

    // Extract enabled platforms
    const enabledPlatforms = Object.entries(platforms)
      // eslint-disable-next-line no-unused-vars
      .filter(([key, value]) => value === true) // Only include platforms set to true
      .map(([key]) => formatKeyToName(key)) // Format the platform key to a user-friendly name
      .join(', ');

    let planInclusion = planAttributesString || ''

    if (enabledPlatforms) {
      planInclusion += planInclusion ? `, Platforms: ${enabledPlatforms}` : `Platforms: ${enabledPlatforms}`;
    }


    return {
      id: client.id,
      date: formatDateWithDay(client?.created_at), // Provide a fallback if 'date' is undefined
      businessName: client?.business_name,
      selectedPlan: (
        <div className="selected-plan">
          {client.client_plan?.plan_type ?? 'No plan selected'}
        </div>
      ),
      planInclusion: <div className='planinclusion'>
        {planInclusion}
      </div>,
      invoice: client.invoice === 'No Invoice' ? (
        <span className="table-btns-desig no-in button-danger-light ">No Invoice</span>
      ) : (
        <Link className="primary-outline table-btns-desig table-button-half" to={`/clients/${client.id}/invoices`}>
          View Invoice
        </Link>
      ),
      team: client?.team?.name
    }
  });

  return (
    <div className='section'>

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

      <div className='max-height'>
        <DynamicTable
          columns={columns}
          data={clientData}
          renderActions={renderActions}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Assign Client to Team"
          buttonText="Confirm & Save"
          onConfirm={handleConfirmAssign}
        >
          <div className="select-team">
            <div className="field-and-error">
              <div className="field-container form-group text-left">

                <SelectField
                  label="Select Team"
                  name="selectedTeam"
                  placeholder="Select a team"
                  options={teams?.map(team => ({
                    value: team.team_id,
                    label: <>
                      <div className="option-title"><strong>{team.name}</strong></div>
                      <div className="option-details">
                        {team.members_count} Users — {team.clients_count} Clients
                      </div>
                    </>
                  })) || []}
                  isLoading={isTeamsLoading}
                  value={selectedTeam}
                  onChange={handleTeamChange}

                />
              </div>
            </div>
          </div>
        </Modal>
        {/* —— DELETE CONFIRMATION MODAL —— */}
        {isDeleteModalOpen && clientToDelete && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete"
            buttonText="Delete"
            onConfirm={handleDeleteConfirm}
          >
            <p>
              Are you sure you want to delete “
              <strong>{clientToDelete.businessName}</strong>
              ”?
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;
