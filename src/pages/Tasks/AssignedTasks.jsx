import DynamicTable from '../../components/shared/DynamicTable';
import { Link } from 'react-router-dom';
import { useGetAssignedTasksQuery } from '../../services/api/tasksApiSlice';
import { formatDate, formatString } from '../../utils/generalUtils';
import { defaultTaskRoute, taskRoutes } from '../../constants/taskRoutes'

const getTaskRoute = (taskType, clientId) => {
    const routeGenerator = taskRoutes[taskType];
    return routeGenerator ? routeGenerator(clientId) : defaultTaskRoute(clientId);
};

const AssignedTasks = () => {
    const { data: tasks = [], isLoading, isError } = useGetAssignedTasksQuery();

    const columns = [
        {
            key: 'created_at',
            label: 'Assigned on (Time/Date)',
            className: 'min-width-200',
            render: (row) => formatDate(row.created_at), // Format the date with time
        },
        {
            key: 'client_business_name',
            label: 'Business Name',
            className: 'min-width-200',
        },
        {
            key: 'task_type',
            label: 'Assigned Tasks',
            className: 'min-width-600',
            render: (row) => formatString(row.task_type)
        },
    ];

    const renderActions = (row) => (
        <div className='min-width-200'>
            <Link to={getTaskRoute(row.task_type, row.client)}>
                <button className="button-primary width-full">Go-to Task</button>
            </Link>
        </div>
    );

    if (isLoading) return <p>Loading tasks...</p>;
    if (isError) return <p>Error fetching tasks. Please try again later.</p>;

    return (
        <div className='section'>
            <div className='max-height'>
            {tasks?.length > 0 ? (
                    <DynamicTable
                        columns={columns}
                        data={tasks}
                        renderActions={renderActions}
                    />
                ) : (
                    <table className="table">
                        <tbody>
                            <tr>
                                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '20px' }}>
                                    No Assigned Tasks available at the moment.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AssignedTasks;
