import { useParams } from 'react-router-dom';
import useClientData from '../../hooks/useClientData'

const ClientName = () => {
    const { clientId } = useParams();
    const { client, isLoading } = useClientData();

    if (!clientId) {
        return null
    }

    if (isLoading) {
        return <h2>Loading...</h2>
    }

    return <h2>{client?.business_name}</h2>
}

export default ClientName;
