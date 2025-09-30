import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DropdownButton from '../../components/calendar/DropdownButton';

import {
    useGetClientInvoicesQuery,
    useCreateClientInvoiceMutation,
    useUpdateClientInvoiceMutation,
} from '../../services/api/clientApiSlice';
import { useParams } from 'react-router-dom';
import { formatMonthYear, parseMonthYear } from '../../utils/generalUtils';
import { invoiceStatusOptions } from '../../constants/status';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';

const Invoices = () => {
    const { clientId } = useParams();
    const { role } = useCurrentUser(); // Get the user role
    const { data: invoices = [], isLoading } = useGetClientInvoicesQuery(clientId);
    const [createClientInvoice] = useCreateClientInvoiceMutation();
    const [updateClientInvoice] = useUpdateClientInvoiceMutation();
    const [newBill, setNewBill] = useState({
        billingFrom: '',
        billingTo: '',
        invoice: null,
    });

    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Handle file upload change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewBill({ ...newBill, invoice: file });
        }
    };

    // Handle adding a new invoice
    const handleAddInvoice = async (invoiceId = null, isUpdate = false) => {
        if (isUpdate) {
            // Handle status update for existing invoice
            try {
                const formData = new FormData();
                formData.append('submission_status', 'wait_for_approval');

                await updateClientInvoice({ clientId, invoiceId, formData }).unwrap();
                setSuccessMessage('Invoice submitted for approval successfully.');
                setErrorMessage(null);
            } catch (error) {
                console.error('Error submitting invoice:', error);
                setErrorMessage('Failed to submit invoice for approval. Please try again.');
                setSuccessMessage(null);
            }
        } else {
            // Handle new invoice creation (existing code)
            if (!newBill.billingFrom || !newBill.billingTo || !newBill.invoice) {
                setErrorMessage('Please fill in all fields and upload an invoice.');
                setSuccessMessage(null);
                return;
            }

            const formData = new FormData();
            formData.append('billing_from', formatMonthYear(newBill.billingFrom));
            formData.append('billing_to', formatMonthYear(newBill.billingTo));
            formData.append('invoice', newBill.invoice);
            formData.append('submission_status', 'wait_for_approval');

            try {
                await createClientInvoice({ clientId, formData }).unwrap();
                setSuccessMessage('Invoice added successfully.');
                setErrorMessage(null);
                setNewBill({ billingFrom: '', billingTo: '', invoice: null });
            } catch (error) {
                console.error('Error adding invoice:', error);
                setErrorMessage('Failed to add invoice. Please try again.');
                setSuccessMessage(null);
            }
        }
    };

    // Handle status update
    const handleStatusChange = async (invoiceId, currentStatus, selectedName) => {
        try {
            // Find the status option corresponding to the selected name
            const selectedStatus = invoiceStatusOptions.find(
                (status) => status.name === selectedName
            );

            if (!selectedStatus) {
                setErrorMessage('Invalid status selected.');
                setSuccessMessage(null);
                return;
            }

            // Role-based status change restrictions
            if (role === 'accountant' && (currentStatus !== 'unpaid' || selectedStatus.id !== 'paid')) {
                setErrorMessage("Accountants can only change status from 'Unpaid' to 'Paid'.");
                return;
            }

            // Safeguard for account managers:
            // - From 'wait_for_approval': allowed transitions -> 'changes_required' or 'unpaid'
            // - From 'changes_required': allowed transition -> 'unpaid'
            if (role === 'account_manager') {
                if (currentStatus === 'wait_for_approval') {
                    if (
                        selectedStatus.id !== 'changes_required' &&
                        selectedStatus.id !== 'unpaid'
                    ) {
                        setErrorMessage(
                            "Account managers can only change status from 'Waiting for Approval' to 'Changes Required' or 'Unpaid'."
                        );
                        return;
                    }
                } else if (currentStatus === 'changes_required') {
                    if (selectedStatus.id !== 'unpaid') {
                        setErrorMessage("Account managers can only change status from 'Changes Required' to 'Unpaid'.");
                        return;
                    }
                } else {
                    setErrorMessage("Invalid status change for account manager.");
                    return;
                }
            }

            const formData = new FormData();
            formData.append('submission_status', selectedStatus.id);

            await updateClientInvoice({ clientId, invoiceId, formData }).unwrap();
            setSuccessMessage('Status updated successfully.');
            setErrorMessage(null);
        } catch (error) {
            console.error('Error updating status:', error);
            setErrorMessage('Failed to update status. Please try again.');
            setSuccessMessage(null);
        }
    };

    // Handle payment link update
    const handlePaymentLinkChange = async (invoiceId, newLink) => {
        try {
            const formData = new FormData();
            formData.append('payment_url', newLink);

            await updateClientInvoice({ clientId, invoiceId, formData }).unwrap();
            setSuccessMessage('Payment link updated successfully.');
            setErrorMessage(null);
        } catch (error) {
            console.error('Error updating payment link:', error);
            setErrorMessage('Failed to update Payment link. Please try again.');
            setSuccessMessage(null);
        }
    };

    // Handle updating invoice fields for changes_required status
    const handleInvoiceFieldChange = async (invoiceId, changedFields) => {
        const formData = new FormData();
        for (const key in changedFields) {
            formData.append(key, changedFields[key]);
        }
        try {
            await updateClientInvoice({ clientId, invoiceId, formData }).unwrap();
            setSuccessMessage('Invoice updated successfully.');
            setErrorMessage(null);
        } catch (error) {
            console.error('Error updating invoice:', error);
            alert('Error updating invoice.');
            setSuccessMessage(null);
        }
    };

    if (isLoading) return <p>Loading invoices...</p>;

    return (
        <div className="section">
            {/* Styled Success and Error Messages */}
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
            <div className="max-height">
                <table cellPadding="10" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Billing From</th>
                            <th>Billing To</th>
                            <th>Invoice</th>
                            <th>Payment Link</th>
                            <th>Status</th>
                        </tr>
                        {/* Show add-invoice row only if role is not account_manager */}
                        {role && role === 'accountant' && (
                            <tr>
                                <td>
                                    <DatePicker
                                        selected={newBill.billingFrom}
                                        onChange={(date) =>
                                            setNewBill({ ...newBill, billingFrom: date })
                                        }
                                        dateFormat="MMMM, yyyy"
                                        showMonthYearPicker
                                        className="border-input border-radius-10"
                                        placeholderText="September, 2024"
                                        portalId="root-portal"
                                    />
                                </td>
                                <td>
                                    <DatePicker
                                        selected={newBill.billingTo}
                                        onChange={(date) =>
                                            setNewBill({ ...newBill, billingTo: date })
                                        }
                                        dateFormat="MMMM, yyyy"
                                        showMonthYearPicker
                                        className="border-input border-radius-10"
                                        placeholderText="September, 2024"
                                        portalId="root-portal"
                                    />
                                </td>
                                <td className='p-0'>
                                    <label htmlFor="invoice-upload" className="button button-primary-light ">
                                        Upload Invoice
                                    </label>
                                    <input
                                        id="invoice-upload"
                                        type="file"
                                        data-testid="invoice-upload"
                                        onChange={handleFileChange}
                                        className='d-none'
                                    />
                                </td>
                                <td>
                                    <span>--</span>
                                </td>
                                <td>
                                    <button className="button-dark px-3" onClick={handleAddInvoice}>
                                        Submit
                                    </button>
                                </td>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                    No invoices available at the moment.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => {

                                // pick your status-based class
                                const statusClass = invoice.submission_status === 'changes_required'
                                    ? 'button button-danger danger '
                                    : ['paid', 'unpaid'].includes(invoice.submission_status)
                                        ? 'button-secondary secondary'
                                        : 'dark-oultine';

                                return (

                                    <tr key={invoice.id}>
                                        {/* Billing From column */}
                                        <td>
                                            {role === 'accountant' && invoice.submission_status === 'changes_required' ? (
                                                <DatePicker
                                                    selected={
                                                        invoice.billing_from
                                                            ? parseMonthYear(invoice.billing_from)
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        handleInvoiceFieldChange(invoice.id, {
                                                            billing_from: formatMonthYear(date),
                                                        })
                                                    }
                                                    dateFormat="MMMM, yyyy"
                                                    showMonthYearPicker
                                                    className="border-input border-radius-10"
                                                    placeholderText="September, 2024"
                                                />
                                            ) : (
                                                invoice.billing_from
                                            )}
                                        </td>
                                        {/* Billing To column */}
                                        <td>
                                            {role === 'accountant' && invoice.submission_status === 'changes_required' ? (
                                                <DatePicker
                                                    selected={
                                                        invoice.billing_to
                                                            ? parseMonthYear(invoice.billing_to)
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        handleInvoiceFieldChange(invoice.id, {
                                                            billing_to: formatMonthYear(date),
                                                        })
                                                    }
                                                    dateFormat="MMMM, yyyy"
                                                    showMonthYearPicker
                                                    className="border-input border-radius-10"
                                                    placeholderText="September, 2024"
                                                />
                                            ) : (
                                                invoice.billing_to
                                            )}
                                        </td>
                                        {/* Invoice (PDF) column */}
                                        <td className='p-0'>
                                            {role === 'accountant' && invoice.submission_status === 'changes_required' ? (
                                                <>
                                                    <label htmlFor="invoice-upload" className="button button-primary-light ">
                                                        Upload Invoice
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                handleInvoiceFieldChange(invoice.id, { invoice: file });
                                                            }
                                                        }}
                                                        className='d-none'
                                                    />
                                                </>
                                            ) : invoice.invoice ? (
                                                <a
                                                    href={invoice.invoice}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="button button-primary-light"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                'No Invoice'
                                            )}
                                        </td>
                                        {/* Payment Link column */}
                                        <td>
                                            <input
                                                type="text"
                                                value={invoice.payment_url || ''}
                                                placeholder="Enter Payment Link"
                                                disabled={
                                                    invoice.submission_status !== 'unpaid' ||
                                                    role !== 'accountant'
                                                }
                                                onChange={(e) =>
                                                    handlePaymentLinkChange(
                                                        invoice.id,
                                                        e.target.value
                                                    )
                                                }
                                                className="border-input border-radius-10"
                                            />
                                        </td>
                                        {/* Status column */}
                                        <td className='d-flex justify-center gap-10'>
                                            <DropdownButton
                                                selectedValue={
                                                    invoiceStatusOptions.find(
                                                        (status) => status.id === invoice.submission_status
                                                    )?.name || ''
                                                }
                                                options={(() => {
                                                    let allowedOptionsForRow = [];
                                                    if (role === 'account_manager') {
                                                        if (invoice.submission_status === 'wait_for_approval') {
                                                            allowedOptionsForRow = invoiceStatusOptions.filter(
                                                                (option) =>
                                                                    option.id === 'changes_required' || option.id === 'unpaid'
                                                            );
                                                        } else if (invoice.submission_status === 'changes_required') {
                                                            allowedOptionsForRow = invoiceStatusOptions.filter(
                                                                (option) => option.id === 'unpaid'
                                                            );
                                                        }
                                                    } else if (role === 'accountant') {
                                                        if (invoice.submission_status === 'unpaid') {
                                                            allowedOptionsForRow = invoiceStatusOptions.filter(
                                                                (option) => option.id === 'paid'
                                                            );
                                                        }
                                                    }
                                                    return allowedOptionsForRow;
                                                })()}
                                                onSelect={(value) =>
                                                    handleStatusChange(
                                                        invoice.id,
                                                        invoice.submission_status,
                                                        value
                                                    )
                                                }
                                                disabled={(() => {
                                                    let allowedOptionsForRow = [];
                                                    if (role === 'account_manager') {
                                                        if (invoice.submission_status === 'wait_for_approval') {
                                                            allowedOptionsForRow = invoiceStatusOptions.filter(
                                                                (option) =>
                                                                    option.id === 'changes_required' || option.id === 'unpaid'
                                                            );
                                                        }
                                                        else if (invoice.submission_status === 'changes_required') {
                                                            allowedOptionsForRow = invoiceStatusOptions.filter(
                                                                (option) => option.id === 'unpaid'
                                                            );
                                                        }
                                                    } else if (role === 'accountant') {
                                                        if (invoice.submission_status === 'unpaid') {
                                                            allowedOptionsForRow = invoiceStatusOptions.filter(
                                                                (option) => option.id === 'paid'
                                                            );
                                                        }
                                                    }
                                                    return allowedOptionsForRow.length === 0;
                                                })()}
                                                className={`w8t-app  ${statusClass}`}
                                            />
                                            {role === 'accountant' && invoice.submission_status === 'changes_required' && (
                                                <button
                                                    className="button-dark px-3"
                                                    onClick={() => handleAddInvoice(invoice.id, true)}
                                                >
                                                    Submit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Invoices;
