import { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { parse, startOfMonth, endOfMonth } from 'date-fns'
import { useGetClientCalendarsQuery } from '../../services/api/clientApiSlice'
import { useGetPostAttributesByTypeQuery } from '../../services/api/postAttributeApiSlice'
import {
    useListCalendarDatesQuery,
    useCreateCalendarDateMutation,
    useUpdateCalendarDateMutation,
    useDeleteCalendarDateMutation,
} from '../../services/api/calendarApiSlice'

import DropdownButton from '../../components/calendar/DropdownButton'
import DynamicTable from '../../components/shared/DynamicTable'
import useCurrentUser from '../../hooks/useCurrentUser'
import { useParams } from 'react-router-dom'
import debounce from 'lodash.debounce';
import CreativeModalWrapper from '../../components/calendar/CreativeModalWrapper';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import ApprovalGroup from '../../components/buttons/ApprovalGroup';
import Modal from '../../components/shared/ReUsableModal';
import { formatDateWithDay, parseMonthYear } from '../../utils/generalUtils';

const CalendarPage = () => {
    const { role } = useCurrentUser(); // Get the user role
    const { clientId, calendarId } = useParams();
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, row: null });
    const [editingValues, setEditingValues] = useState({});
    // const newRowRef = useRef(null);
    const rowRefs = useRef({});

    // Success & Error Messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Delete confirmation modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState(null);

    const { data: clientCalendars = [] } = useGetClientCalendarsQuery(clientId);
    const { data: postTypes = [] } = useGetPostAttributesByTypeQuery('post_type');
    const { data: postCategories = [] } = useGetPostAttributesByTypeQuery('post_category');
    const { data: postCTAs = [] } = useGetPostAttributesByTypeQuery('post_cta');

    const { data: calendars = [], isLoading } = useListCalendarDatesQuery(calendarId);
    const [createCalendarDate] = useCreateCalendarDateMutation();
    const [updateCalendarDate] = useUpdateCalendarDateMutation();
    const [localCalendars, setLocalCalendars] = useState([]);
    const [deleteCalendarDate] = useDeleteCalendarDateMutation();
    const [editingDateId, setEditingDateId] = useState(null);

    const roleMessages = {
        marketing_manager: {
            title: "Your canvas awaits!",
            message: "There are no rows here yet. Start building your marketing strategy by adding new rows to create your calendar.",
            actionLabel: "Add Your First Row",
        },
        default: {
            title: "Oops, nothing to see here!",
            message: "It seems like the calendar is empty. Contact the marketing manager to populate this space.",
            actionLabel: null, // No action for non-marketing-manager roles
        },
    };

    const renderEmptyMessage = () => {
        const message = role === "marketing_manager" ? roleMessages.marketing_manager : roleMessages.default;

        return (
            <div className="empty-message">
                <h2 className="empty-title">{message.title}</h2>
                <p className="empty-text">{message.message}</p>
                {message.actionLabel && (
                    <button onClick={handleAddRow} className="button-primary">
                        {message.actionLabel}
                    </button>
                )}
            </div>
        );
    };

    const handleContextMenu = (event, row) => {
        if (role !== 'marketing_manager') return;
        event.preventDefault();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            row,
        });
    };

    const handleContextMenuClose = () => {
        setContextMenu({ visible: false, x: 0, y: 0, row: null });
    };


    // Find the current calendar based on calendarId
    const currentCalendar = clientCalendars.find(
        (calendar) => calendar.calendar_id === parseInt(calendarId, 10)
    );

    // Extract and parse the month_name to a date range
    const monthName = currentCalendar?.month_name || '';
    const monthStart = monthName
        ? startOfMonth(parse(monthName, 'MMMM yyyy', new Date()))
        : null;
    const monthEnd = monthName ? endOfMonth(monthStart) : null;

    useEffect(() => {
        if (!isLoading && JSON.stringify(localCalendars) !== JSON.stringify(calendars)) {
            setLocalCalendars(calendars);
        }
    }, [calendars, isLoading]);

    const saveRowDebounced = debounce(async (id, field, value) => {
        const rowToUpdate = localCalendars.find((calendar) => calendar.id === id);
        if (rowToUpdate) {
            const updatedRow = {
                ...rowToUpdate,
                [field]: value,
            };

            try {
                await handleSaveRow(updatedRow);
                setLocalCalendars((prev) =>
                    prev.map((row) => (row.id === id ? { ...updatedRow, saving: false } : row))
                );
            } catch (error) {
                console.error('Failed to save row:', error);
            }
        }
    }, 500);

    const handleValueChange = async (id, field, value) => {

        // force creatives into an array
        const newValue = field === 'creatives'
            ? (Array.isArray(value) ? value : (value ? [value] : []))
            : value;

        setEditingValues((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));

        saveRowDebounced(id, field, value);
    };

    const handleSaveRow = async (row) => {
        try {
            // Determine fields to save based on user role
            const allowedFieldsByRole = {
                marketing_manager: ['date', 'post_count', 'type', 'category', 'cta', 'resource', 'collaboration'],
                content_writer: ['tagline', 'caption', 'hashtags', 'creatives_text', 'e_hooks'],
                graphics_designer: ['creatives'],
                account_manager: ['comments'],
            };

            const allowedFields = allowedFieldsByRole[role] || [];
            const filteredRow = Object.keys(row)
                .filter((key) => allowedFields.includes(key) || key === 'id')
                .reduce((obj, key) => {
                    obj[key] = row[key];
                    return obj;
                }, {});

            // If creatives is the only thing, or part of it, send JSON
            if (role === 'graphics_designer' && Array.isArray(filteredRow.creatives)) {
                // PATCH as JSON
                const updatedRow = typeof row.id === 'string' && row.id.startsWith('temp-')
                    ? await createCalendarDate({
                        calendarId,
                        data: filteredRow   // plain object with creatives: [...]
                    }).unwrap()
                    : await updateCalendarDate({
                        calendarId,
                        dateId: row.id,
                        data: filteredRow   // plain object with creatives: [...]
                    }).unwrap();

                // merge into state
                setLocalCalendars(prev =>
                    prev.map(item => item.id === row.id ? { ...updatedRow, saving: false } : item)
                );
            } else {
                // everything else still via FormData
                const formData = new FormData();
                Object.entries(filteredRow).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach(v => formData.append(key, v));
                    } else {
                        formData.append(key, value);
                    }
                });

                const saved = typeof row.id === 'string' && row.id.startsWith('temp-')
                    ? await createCalendarDate({ calendarId, data: formData }).unwrap()
                    : await updateCalendarDate({ calendarId, dateId: row.id, data: formData }).unwrap();

                setLocalCalendars(prev =>
                    prev.map(item => item.id === row.id ? { ...saved, saving: false } : item)
                );
            }

            setSuccessMessage('Row saved successfully.');
            setErrorMessage(null);
        } catch (err) {
            console.error('Failed to save row:', err);
            setErrorMessage('Failed to save row. Please try again.');
            setSuccessMessage(null);
        }
    };


    const handleAddRow = () => {
        // Generate a unique random post_count
        const generateUniquePostCount = () => {
            let randomNumber;
            const usedPostCounts = localCalendars.map((calendar) => parseInt(calendar.post_count, 10) || 0);

            do {
                randomNumber = Math.floor(Math.random() * 10000) + 1; // Random number between 1 and 10000
            } while (usedPostCounts.includes(randomNumber)); // Ensure it's not already used

            return randomNumber;
        };

        const newPostCount = generateUniquePostCount();
        const newRow = {
            id: `temp-${Date.now()}`, // Use a unique temporary ID for new rows 
            date: null,
            post_count: newPostCount.toString(),
            type: '',
            category: '',
            cta: '',
            resource: '',
            tagline: '',
            caption: '',
            hashtags: '',
            creatives_text: '',
            e_hooks: '',
            creatives: '',
            internal_status: '',
            client_approval: '',
            comments: '',
            collaboration: '',
            isContentApproved: false,
            isCreativeApproved: false,
            isClientApprovedContent: false,
            isClientApprovedCreative: false,
        }

        setLocalCalendars((prev) => [...prev, { ...newRow, isNew: true }]);
        setTimeout(() => {
            const el = rowRefs.current[newRow.id];
            if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setLocalCalendars(prev => prev.map(row => row.id === newRow.id ? { ...row, isNew: false } : row));
        }, 100);

        handleContextMenuClose();

    };

    const handleDeleteRow = async (row) => {
        try {
            // Check if it's a new row (temporary ID)
            if (typeof row.id === 'string' && row.id.startsWith('temp-')) {
                setLocalCalendars((prev) => prev.filter((calendar) => calendar.id !== row.id));
            } else {
                // For existing rows, call the API to delete
                await deleteCalendarDate({ calendarId, dateId: row.id }).unwrap();
                setSuccessMessage('Row deleted successfully.');
                setLocalCalendars((prev) => prev.filter((calendar) => calendar.id !== row.id));
            }
            setErrorMessage(null);
        } catch (error) {
            console.error('Failed to delete row:', error);
            setErrorMessage('Failed to delete row. Please try again.');
            setSuccessMessage(null);
        }

        handleContextMenuClose();
    };
    // Open delete modal
    const openDeleteModal = row => {
        setRowToDelete(row);
        setIsDeleteModalOpen(true);
        handleContextMenuClose();
    };

    // Confirm delete
    const handleDeleteConfirm = async () => {
        if (rowToDelete) {
            await handleDeleteRow(rowToDelete);
            setIsDeleteModalOpen(false);
            setRowToDelete(null);
        }
    };


    const handleApproval = async (id, type, field) => {
        const row = localCalendars.find((calendar) => calendar.id === id);
        if (!row) return;

        const isInternalAction = type === "internal_status";
        const allowedRoles = isInternalAction
            ? ["marketing_manager"]
            : ["account_manager"];

        if (!allowedRoles.includes(role)) {
            console.error(`${role} is not allowed to perform this action.`);
            return;
        }

        // Toggle the approval status instead of always setting it to true
        const updatedRow = {
            ...row,
            [type]: {
                ...row[type],
                [field]: !row[type]?.[field], // Toggle the current value
            },
        };

        try {
            const response = await updateCalendarDate({
                calendarId,
                dateId: id,
                data: { [type]: updatedRow[type] },
            }).unwrap();
            console.log("✅ API Response", response);


            setSuccessMessage('Approval updated successfully.');
            setLocalCalendars((prevCalendars) =>
                prevCalendars.map((calendar) =>
                    calendar.id === id ? updatedRow : calendar
                )
            );
            setErrorMessage(null);
        } catch (error) {
            console.error(`Failed to update ${type}:`, error);
            setErrorMessage(`Failed to update approval. Please try again.`);
            setSuccessMessage(null);
        }
    };


    /**
     * Helper function to render an editable input field.
     * If the current user’s role does not match the required role, it shows a read-only span.
     *
     * @param {Object} row - The data row.
     * @param {String} field - The field name.
     * @param {String} requiredRole - Role required to edit the field.
     * @param {Boolean} isDisabled - Whether the input is disabled.
     * @param {String} [inputType='input'] - 'input' for an <input> element or 'textarea' for a <textarea> element.
     */

    const renderEditableInput = (row, field, requiredRole, isDisabled, inputType = 'input') => {
        // If the role does not match the required role, render a read-only span
        if (role !== requiredRole) {
            return <span>{row[field] || '—'}</span>;
        }

        // Render an input field for editable cases
        const value = editingValues[row.id]?.[field] ?? row[field] ?? '';
        if (inputType === 'textarea') {
            return (
                <textarea
                    type="text"
                    value={value}
                    onChange={(e) => handleValueChange(row.id, field, e.target.value)}
                    className="table-textarea table-input border-radius-10 pxy-10"
                    disabled={isDisabled}
                    rows="1"
                />
            );
        }
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(row.id, field, e.target.value)}
                className="table-input border-radius-10 border-input"
                disabled={isDisabled}
            />
        );
    };

    const columns = [
        {
            key: 'serial',
            label: 'S.no',
            className: 'min-width-50',
            render: row => <span>{row.serial}</span>,
        },
        {
            key: 'date',
            label: 'Date-Day',
            className: 'min-width-200',
            render: (row) => (
                <div className="input-wrapper">
                    {editingDateId === row.id ? (
                        <DatePicker
                            selected={row.date ? new Date(row.date) : null}
                            onChange={(date) => {
                                handleValueChange(row.id, 'date', date?.toISOString());
                                setEditingDateId(null); // Exit edit mode after selection
                            }}
                            minDate={monthStart}
                            maxDate={monthEnd}
                            disabled={role !== 'marketing_manager'}
                            placeholderText="Select a date"
                            className={`table-input border-input border-radius-10 ${!row.date ? 'input-error' : ''}`}
                            portalId="root-portal"
                            dateFormat="MM/dd/yyyy"
                            autoFocus // Focus the input when it appears
                            onBlur={() => setEditingDateId(null)} // Exit edit mode when clicking outside
                        />
                    ) : (
                        <div
                            className="formatted-date clickable"
                            onClick={() => role === 'marketing_manager' && setEditingDateId(row.id)}
                        >
                            {row.date ? formatDateWithDay(row.date) : "Select a date"}
                        </div>
                    )}

                    {!row.date && editingDateId === row.id && (
                        <div className="error-message">Date is required to save.</div>
                    )}
                </div>
            ),
        },
        {
            key: 'post_count',
            label: 'Post Count',
            className: 'min-width-200',
            render: (row) => <span>{row.post_count}</span>, // Display auto-generated postCount
        },
        {
            key: 'type',
            label: 'Type',
            className: 'min-width-200',
            render: (row) => (
                <DropdownButton
                    variant="type"
                    selectedValue={row.type}
                    options={postTypes.map((type) => ({ id: type.id, name: type.name }))}
                    onSelect={(value) => handleValueChange(row.id, 'type', value)}
                    disabled={role !== 'marketing_manager'}
                />
            ),
        },
        {
            key: 'category',
            label: 'Category',
            className: 'min-width-200',
            render: (row) => (
                <DropdownButton
                    variant="category"
                    selectedValue={row.category}
                    options={postCategories.map((cat) => ({ id: cat.id, name: cat.name }))}
                    onSelect={(value) => handleValueChange(row.id, 'category', value)}
                    disabled={role !== 'marketing_manager'}
                />
            ),
        },
        {
            key: 'cta',
            label: 'CTA',
            className: 'min-width-200',
            render: (row) => (
                <DropdownButton
                    variant="cta"
                    selectedValue={row.cta}
                    options={postCTAs.map((cta) => ({ id: cta.id, name: cta.name }))}
                    onSelect={(value) => handleValueChange(row.id, 'cta', value)}
                    disabled={role !== 'marketing_manager'}
                />
            ),
        },
        {
            key: 'resource',
            label: 'Resource/Idea',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'resource', 'marketing_manager', role !== 'marketing_manager'),
        },
        {
            key: 'tagline',
            label: 'Tagline',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'tagline', 'content_writer', role !== 'content_writer'),
        },
        {
            key: 'caption',
            label: 'Caption',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'caption', 'content_writer', role !== 'content_writer', 'textarea'),
        },
        {
            key: 'hashtags',
            label: 'Hashtags',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'hashtags', 'content_writer', role !== 'content_writer'),
        },
        {
            key: 'creatives_text',
            label: 'Creative’s Text (If any)',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'creatives_text', 'content_writer', role !== 'content_writer', 'textarea'),
        },
        {
            key: 'e_hooks',
            label: 'Eng-Hooks',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'e_hooks', 'content_writer', role !== 'content_writer', 'textarea'),
        },
        {
            key: 'creatives',
            label: 'Creative',
            className: 'min-width-200',
            render: (row) => (
                <CreativeModalWrapper
                    row={row}
                    role={role || ''}
                    handleValueChange={handleValueChange}

                />
            ),
        },
        {
            key: 'internal_status',
            label: 'Internal Status',
            className: 'min-width-300',
            render: (row) => (
                <ApprovalGroup
                    row={row}
                    handleApproval={handleApproval}
                    scopeKey="internal_status"
                    role={role || ''}
                />
            ),
        },
        {
            key: 'client_approval',
            label: 'Client Approval',
            className: 'min-width-300',
            render: (row) => (
                <ApprovalGroup
                    row={row}
                    handleApproval={handleApproval}
                    scopeKey="client_approval"
                    role={role || ''}
                    // role={role}
                />
            ),
        },
        {
            key: 'comments',
            label: 'Comments',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'comments', 'account_manager', role !== 'account_manager', 'textarea'),

        },
        {
            key: 'collaboration',
            label: 'Collaboration',
            className: 'min-width-200',
            render: (row) => renderEditableInput(row, 'collaboration', 'marketing_manager', role !== 'marketing_manager', 'textarea'),

        },
    ];

    const renderContextMenu = () => {
        if (!contextMenu.visible) return null;

        // Calculate adjusted positions to prevent overflow
        const menuWidth = 150; // Approximate width of the context menu
        const menuHeight = 100; // Approximate height of the context menu
        const adjustedX =
            contextMenu.x + menuWidth > window.innerWidth
                ? window.innerWidth - menuWidth
                : contextMenu.x;
        const adjustedY =
            contextMenu.y + menuHeight > window.innerHeight
                ? window.innerHeight - menuHeight
                : contextMenu.y;

        return (
            <div
                className="context-menu"
                style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
                onMouseLeave={handleContextMenuClose} // Auto-close when mouse leaves
            >
                <button onClick={handleAddRow}>Add Row</button>
                <button onClick={() => openDeleteModal(contextMenu.row)}>Delete Row</button>
            </div>
        );
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

            <div className="max-height">
                {isLoading ? (
                    <p>Loading calendar data...</p>
                ) : localCalendars.length === 0 ? (
                    renderEmptyMessage()
                ) : (
                    <>
                        <DynamicTable
                            columns={columns}
                            data={localCalendars.map((row, idx) => ({
                                // 2. Inject a `serial` field based on the index
                                ...row, serial: idx + 1,
                                rowClass: row.isNew
                                    ? 'row-animate'
                                    : row.dateMissing
                                        ? 'row-date-missing'
                                        : row.saving
                                            ? 'row-saving'
                                            : '',
                                // ref: row.isNew ? newRowRef : null,
                                ref: (el) => {
                                    if (el) rowRefs.current[row.id] = el;
                                },
                            }))}
                            onRowContextMenu={handleContextMenu}
                        />
                        {renderContextMenu()}
                    </>
                )}
                {/* Delete confirmation modal */}
                {isDeleteModalOpen && rowToDelete && (
                    <Modal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        title="Confirm Delete"
                        buttonText="Delete"
                        onConfirm={handleDeleteConfirm}
                    >
                        <p>Are you sure you want to delete this row?</p>
                    </Modal>
                )}
            </div>
        </div>
    );

};

export default CalendarPage;

