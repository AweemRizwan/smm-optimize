import DynamicTable from '../../components/shared/DynamicTable';
import { formatDate } from '../../utils/generalUtils';
import { useGetMyCustomTasksQuery, useUpdateTaskStatusMutation } from '../../services/api/customTasksApi';


const CustomAssignedTasks = () => {
    const { data: tasks = [], isLoading, isError } = useGetMyCustomTasksQuery();
    const [updateTaskStatus] = useUpdateTaskStatusMutation(); // Mutation to update task status

    const handleStatusToggle = async (taskId, currentStatus) => {
        try {
            await updateTaskStatus({ taskId, taskStatus: !currentStatus }); // Send correct payload
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };


    const columns = [
        {
            key: 'task_created_at',
            label: 'Assigned on (Time/Date)',
            className: 'min-width-200',
            render: (row) => formatDate(row.task_created_at, true), // Format the date with time
        },
        {
            key: 'task_updated_at',
            label: 'Updated on (Time/Date)',
            className: 'min-width-200',
            render: (row) => formatDate(row.task_updated_at, true), // Format the date with time
        },
        {
            key: 'client_business_name',
            label: 'Business Name',
            className: 'min-width-200',
        },
        {
            key: 'task_name',
            label: 'Tasks Name',
            className: 'min-width-200',
        },
        {
            key: 'task_description',
            label: 'Task Description',
            className: 'min-width-400',
        },
        {
            key: 'task_file',
            label: 'View File',
            className: 'min-width-200',
            render: (row) =>
                row.task_file ? (
                    <a href={row.task_file} target="_blank" rel="noopener noreferrer" className="button button-secondary">
                        View File
                    </a>
                ) : (
                    'No File'
                ),
        },
    ];

    const renderActions = (row) => (
        <div className='min-width-200'>
            <button
                className={`button-${row.task_status ? 'success' : 'danger'} width-full mt-2`}
                onClick={() => handleStatusToggle(row.id, row.task_status)}
            >
                {row.task_status ? 'Completed' : 'Mark as Completed'}
            </button>
        </div>
    );

    if (isLoading) return <p>Loading tasks...</p>;
    if (isError) return <p>Error fetching tasks. Please try again later.</p>;

    return (
        <div className='section'>
            <div className='max-height'>
            {tasks?.tasks?.length > 0 ? (
                    <DynamicTable
                        columns={columns}
                        data={tasks.tasks}
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

export default CustomAssignedTasks;
