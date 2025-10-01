import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import FieldAndError from "../../components/Form/FieldAndError";
import { useGetClientTeamQuery, useCreateCustomTaskMutation, useGetAllCustomTasksByClientQuery } from "../../services/api/customTasksApi";
import { useParams } from "react-router-dom";
import upload from "../../assets/Images/pngegg.png";
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import SelectField from "../../components/Form/SelectField";


const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    assignedTo: Yup.string().required("Please assign a team member"),
});

const CustomTasks = () => {
    const { clientId } = useParams();
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Fetch tasks assigned to the logged-in user
    const { data: tasksData, isLoading: tasksLoading, isError: tasksError } = useGetAllCustomTasksByClientQuery(clientId);

    // Fetch client team members
    const { data: teamData, isLoading: teamLoading, isError: teamError } = useGetClientTeamQuery(clientId);

    // Mutation to create a new task
    const [createTask, { isLoading: creatingTask }] = useCreateCustomTaskMutation();

    // Drag & Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };


    return (
        <div className="section">
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

            {/* Task List */}
            <div className="mt-6">
                <h2 className="text-xl font-bold mb-2">Task List</h2>
                {tasksLoading ? (
                    <p>Loading tasks...</p>
                ) : tasksError ? (
                    <p className="text-red-500">Error loading tasks.</p>
                ) : (
                    tasksData?.tasks?.map((task) => (
                        <div key={task.id} className="p-4 border rounded mb-2 cstm-tsx">
                            <h3 className="font-semibold">{task.task_name}</h3>
                            <p>{task.task_description}</p>
                            <p className="text-sm text-gray-500">Assigned to: {task.assign_to_full_name}</p>
                            {task.task_file && <p className="text-sm text-blue-500">File: {task.task_file}</p>}
                        </div>
                    ))
                )}
            </div>

            {/* Create Task Form */}
            <div className="bg-white p-4 rounded">
                <h2 className="text-xl font-bold mt-3 mb-2">Create Task</h2>
                <Formik
                    initialValues={{ title: "", description: "", assignedTo: "" }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { resetForm }) => {
                        const formData = new FormData();
                        formData.append("task_name", values.title);
                        formData.append("task_description", values.description);
                        formData.append("assign_to_id", values.assignedTo);
                        if (file) formData.append("task_file", file);

                        try {
                            await createTask({ clientId, taskData: formData }).unwrap();
                            setSuccessMessage("Task created successfully!");
                            setFile(null);
                            resetForm();
                        } catch (error) {
                            setErrorMessage("Failed to create task. Please try again.");
                        }
                    }}
                >
                    {() => (
                        <Form className="space-y-4">
                            <FieldAndError name="title" placeholder="Task Title" customClass="border-input" />
                            <FieldAndError name="description" placeholder="Task Description" type="textarea" rows={4} customClass="border-input" />

                            {/* Assign to */}
                            <div>
                                <label className="form-label" htmlFor="assignedTo">Assign to</label>
                                {teamLoading ? (
                                    <p>Loading team members...</p>
                                ) : teamError ? (
                                    <p className="text-red-500">Error loading team members.</p>
                                ) : (
                                    <SelectField
                                        // label="Select Team"
                                        name="assignedTo"
                                        placeholder="Assign to..."
                                        options={teamData?.team_members?.map((member) => ({
                                            value: member.id,
                                            key: member.id,
                                            label: member.username,
                                        })) || []}
                                    />

                                )}
                            </div>

                            {/* Modern File Upload with Drag & Drop */}
                            <div
                                className={`file-upload-container  mt-3 ${dragging ? "dragging" : ""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="upload-box mt-5 mb-2">
                                    <label htmlFor="file-upload" className="button-primary primary pxy-2 border-radius-10 ">
                                        Browse files
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        name="file"
                                        className="file-upload-input"
                                        accept=".jpg, .png, .pdf"
                                        onChange={handleFileChange}
                                    />
                                    {file && <p className="file-name">📄 {file.name}</p>}
                                </div>
                            </div>

                            <button type="submit" className="btn button-secondary px-5 mt-3" disabled={creatingTask}>
                                {creatingTask ? "Creating..." : "Create Task"}
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CustomTasks;
