import { useGetClientByIdQuery, useGetClientsQuery } from '../services/api/clientApiSlice';
import { useParams } from 'react-router-dom';
import useCurrentUser from './useCurrentUser';

const useClientData = () => {
    const { clientId } = useParams();
    const { role } = useCurrentUser();

    const clientsQuery = useGetClientsQuery(undefined, { skip: role !== 'user' });
    const clientByIdQuery = useGetClientByIdQuery(clientId, { skip: !clientId});

    let client, isLoading;

    if (role === 'user') {
        isLoading = clientsQuery.isLoading;
        client = clientsQuery.data;
    } else {
        isLoading = clientByIdQuery.isLoading;
        client = clientByIdQuery.data;
    }


    return { client, isLoading };
};

export default useClientData;
