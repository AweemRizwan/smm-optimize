import { Link } from 'react-router-dom';
import { useGetTeamsQuery } from '../../services/api/teamApiSlice';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import useCurrentUser from '../../hooks/useCurrentUser';

const TeamPage = () => {
    const { role } = useCurrentUser();
    // Fetch teams data using the RTK Query hook
    const { data: teams, isLoading, isError, error } = useGetTeamsQuery(null, { skip: role !== 'marketing_director' });

    if (isLoading) {
        return (
            <div className="team-page-container">
                <div className='row no-gutter gap-10'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className='col-md-4'>
                            <div className="team-card container-secondary-bg pxy-3">
                                <SkeletonLoader height={30} width="60%" style={{ marginBottom: '10px' }} />
                                <SkeletonLoader height={20} width="80%" style={{ marginBottom: '10px' }} />
                                <SkeletonLoader height={20} width="80%" style={{ marginBottom: '10px' }} />
                                <SkeletonLoader height={40} width="50%" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (isError) {
        return <div>Error: {error?.data?.message || 'Failed to load teams.'}</div>
    }

    if (!teams || teams.length === 0) {
        return <div className='section'>No teams available.</div>
    }

    return (
        <div className="team-page-container">
            <div className='grid gap-10'> 
                {teams.map((team) => (
                    <div key={team.team_id}>
                        <div className="team-card container-secondary-bg row no-gutter">
                            <div className='col-md-6'>
                                <h2 className='team-name'>{team.name}</h2>
                                <p className='mt-1'>Assigned Members: {team.members_count || 0}</p>
                                <p>Assigned Clients: {team.clients_count || 0}</p>
                            </div>
                            <Link className='col-md-6 text-right align-center d-flex justify-end d-flex-end' to={`/teams/${team.team_id}/view`}>
                                <button className="edit-team-btn button-dark dark">Edit Team</button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TeamPage
