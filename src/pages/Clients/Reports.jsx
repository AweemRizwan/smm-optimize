import { useState } from 'react';
import Pdf from "../../assets/Images/pdf.png";
import {
    useCreateMonthlyReportMutation,
    useDeleteMonthlyReportMutation,
    useGetMonthlyReportsQuery,
    useUpdateMonthlyReportMutation, // Import the new mutation
} from '../../services/api/monthlyReportsApiSlice';
import { useGetClientCalendarsQuery } from '../../services/api/clientApiSlice';
import { useParams } from 'react-router-dom';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const Reports = () => {
    const { role } = useCurrentUser(); // Get the user role
    const { clientId } = useParams();
    const { data: calendars = [], isLoading: loadingCalendars } = useGetClientCalendarsQuery(clientId);
    const [createMonthlyReport] = useCreateMonthlyReportMutation();
    const [deleteMonthlyReport] = useDeleteMonthlyReportMutation();
    const [updateMonthlyReport] = useUpdateMonthlyReportMutation(); // Hook for editing reports

    const [selectedMonth, setSelectedMonth] = useState('');
    const [files, setFiles] = useState([]);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const {
        data: report,
        isLoading: loadingReport,
        refetch
    } = useGetMonthlyReportsQuery(
        { clientId, month: selectedMonth },
        { skip: !selectedMonth }
    );

    const handleFileChange = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    };

    const handleUpload = async () => {
        if (!selectedMonth) {
            setErrorMessage('Please select a month before uploading.');
            setSuccessMessage(null);
            return;
        }

        for (const file of files) {
            const formData = new FormData();
            formData.append('monthly_reports', file);

            try {
                await createMonthlyReport({
                    clientId,
                    month: selectedMonth,
                    data: formData,
                }).unwrap();
                setSuccessMessage(`${file.name} uploaded successfully!`);
                setErrorMessage(null);
                refetch();
            } catch (error) {
                setErrorMessage(`Error uploading ${file.name}. Please try again.`);
                setSuccessMessage(null);
                console.error(`Error uploading ${file.name}:`, error);
            }
        }
        setFiles([]);
    };

    const handleDelete = async () => {
        try {
            await deleteMonthlyReport(report.id).unwrap();
            setSuccessMessage('Report deleted successfully!');
            setErrorMessage(null);
            refetch();
        } catch (error) {
            setErrorMessage('Error deleting report. Please try again.');
            setSuccessMessage(null);
            console.error('Error deleting report:', error);
        }
    };

    const handleEdit = async () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/pdf';
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    await updateMonthlyReport({ reportId: report.id, file }).unwrap();
                    setSuccessMessage('Report file updated successfully!');
                    setErrorMessage(null);
                    refetch();
                } catch (error) {
                    setErrorMessage('Error updating report file. Please try again.');
                    setSuccessMessage(null);
                    console.error('Error updating report file:', error);
                }
            }
        };
        fileInput.click(); // Trigger the file input
    };

    if (loadingCalendars) return <p>Loading calendars...</p>;


    return (
        <div className='section'>
            <h2 className='mb-1'>Service Reports</h2>

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

            {/* Month Selector */}
            <div className='row pxy-15 mt-1 border border-radius d-flex-space-between align-center mb-1'>
                <select
                    className='form-control border-radius-10 p-3'
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    <option value="" disabled>Select a month</option>
                    {calendars.map((calendar) => (
                        <option key={calendar.calendar_id} value={calendar.month_name}>
                            {calendar.month_name}
                        </option>
                    ))}
                </select>
            </div>

            {role === 'marketing_manager' && (
                <div className='row pxy-15 mt-1 border border-radius d-flex-space-between align-center mb-1'>
                    <div className='col-md-6 align-center d-flex'>
                        <img src={Pdf} alt="PDF Icon" />
                        <span>Upload Report</span>
                    </div>
                    <div className='col-md-6 text-right gap-10'>
                        <label className={` ${!selectedMonth ? 'disabled' : ''}`}>
                            <input
                                type="file"
                                accept="application/pdf"
                                multiple
                                data-testid="file-upload-input"  // Add this to help tests find it
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                disabled={!selectedMonth} // Disable file input if no month is selected
                            />
                            <span
                                className={`button button-primary text-center inline-block cursor-pointer ${!selectedMonth ? 'disabled' : ''
                                    }`}
                            >
                                Upload
                            </span>
                        </label>
                        <button
                            className='button-secondary primary ml-2'
                            onClick={handleUpload}
                            disabled={!selectedMonth} // Disable upload button if no month is selected
                        >
                            Submit
                        </button>
                    </div>
                </div>
            )}


            {/* Message when no month is selected */}
            {!selectedMonth && <p className="error-container">Please select a month to view & enable file upload.</p>}

            {/* Display Report or Message */}
            {selectedMonth ? (
                loadingReport ? (
                    <p>Loading report...</p>
                ) : report && report.monthly_reports ? (
                    <div className='file-section'>
                        <div className='row pxy-15 border border-radius d-flex-space-between align-center'>
                            <div className='col-md-6 align-center d-flex'>
                                <img src={Pdf} alt="PDF Icon" />
                                <a
                                    href={report.monthly_reports}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="report-link"
                                >
                                    {report.month_name} Report
                                </a>
                            </div>
                            {role === 'marketing_manager' && (
                                <div className='col-md-6 text-right gap-10 d-flex justify-end'>
                                    <button
                                        className='button-secondary py-2'
                                        onClick={handleEdit}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className='button-danger py-2'
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>No report available for the selected month.</p>
                )
            ) : null}
        </div>
    );
};

export default Reports;
