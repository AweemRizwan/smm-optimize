import { useState, useEffect, useRef } from "react";
import Modal from "../../components/shared/ReUsableModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    useGetNotesQuery,
    useCreateOrUpdateNoteMutation,
    useDeleteNoteMutation,
    useToggleNoteFlagMutation
} from "../../services/api/notesApiSlice";
import { FaThumbtack } from "react-icons/fa";
import { AiOutlinePushpin } from "react-icons/ai";
// import { useParams } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi"; // Kebab Menu Icon
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';


const NotesPage = () => {
    // const { clientId } = useParams();
    const { data: notes = [], isLoading } = useGetNotesQuery()
    const [createOrUpdateNote] = useCreateOrUpdateNoteMutation()
    const [deleteNote] = useDeleteNoteMutation()
    const [toggleNoteFlag] = useToggleNoteFlagMutation()


    const [selectedNote, setSelectedNote] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editorContent, setEditorContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [openMenu, setOpenMenu] = useState({}); // Track open kebab menu state
    const menuRef = useRef(null);


    // ✅ State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);


    // Add effect to handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu({});
            }
        };

        // Only add listener if any menu is open
        if (Object.keys(openMenu).length > 0) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenu]);

    // ✅ Function to show and auto-hide messages
    const showMessage = (message, type = "success") => {
        if (type === "success") {
            setSuccessMessage(message);
            setErrorMessage(null);
        } else {
            setErrorMessage(message);
            setSuccessMessage(null);
        }

        // Auto-hide messages after 3 seconds
        setTimeout(() => {
            setSuccessMessage(null);
            setErrorMessage(null);
        }, 3000);
    };


    // Open Modal
    const openModal = (note = null) => {
        if (note) {
            setSelectedNote(note.id);
            setEditorContent(note.message);
            setModalTitle(note.note_title);
        } else {
            setSelectedNote(null);
            setEditorContent("");
            setModalTitle("");
        }
        setIsModalOpen(true);
    };
    // Close Modal
    const closeModal = async () => {
        // Check if there are any changes
        const isUnchanged =
            selectedNote &&
            notes.some(
                (note) =>
                    note.id === selectedNote &&
                    note.note_title === modalTitle.trim() &&
                    note.message === editorContent.trim()
            );

        // If no changes, just close the modal
        if (isUnchanged || (!selectedNote && !modalTitle.trim() && !editorContent.trim())) {
            setIsModalOpen(false);
            return;
        }

        // Proceed with saving changes if there are any
        if (modalTitle.trim() && editorContent.trim()) {
            const payload = {
                id: selectedNote,
                note_title: modalTitle,
                message: editorContent,
            };

            try {
                await createOrUpdateNote(payload).unwrap();
                setSuccessMessage("Note saved successfully!");
            } catch (error) {
                console.error("Error saving note:", error);
                setErrorMessage("Failed to save note. Please try again.");
            }
        }
        setIsModalOpen(false);
    };


    // Open Delete Modal
    const openDeleteModal = (noteId, noteTitle) => {
        setSelectedNote(noteId);
        setModalTitle(noteTitle); // Set the title for the delete confirmation
        setIsDeleteModalOpen(true);
    };

    // Confirm Delete
    const handleDelete = async () => {
        if (!selectedNote) return;

        try {
            await deleteNote(selectedNote).unwrap();
            setSuccessMessage("Note deleted successfully!");
        } catch (error) {
            console.error("Error deleting note:", error);
            setErrorMessage("Failed to delete note. Please try again.");
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedNote(null);
        }
    };

    // Handle Pinning Notes
    const handlePin = async (note) => {
        const pinnedCount = notes.filter((n) => n.note_flag).length;

        if (note.note_flag || pinnedCount < 3) {
            try {
                await toggleNoteFlag({
                    id: note.id,
                    note_flag: !note.note_flag,
                }).unwrap();
                setSuccessMessage(`Note ${note.note_flag ? "unpinned" : "pinned"} successfully!`);
            } catch (error) {
                console.error("Error toggling note flag:", error);
                setErrorMessage("Failed to update pin status.");
            }
        } else {
            setErrorMessage("You can only pin up to 3 notes.");
        }
    };



    if (isLoading) return <p>Loading strategies...</p>;


    const sortedNotes = [...notes].sort((a, b) => b.note_flag - a.note_flag);

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

            <div className="notes">
                <h2>Notes</h2>
                <div className="row wrap gap-18 mt-5">
                    {sortedNotes.map((note) => (
                        <div className="cards-col col-md-4" key={note.id}>
                            <div
                                className="card mb-4"
                                onClick={() =>
                                    openModal({
                                        id: note.id,
                                        message: note.message,
                                        note_title: note.note_title,
                                    })
                                }
                                style={{ cursor: "pointer", position: "relative" }}
                            >
                                {/* 📌 Pin Icon for Pinned Notes */}
                                {note.note_flag && (
                                    <div className="pin-icon">
                                        <FaThumbtack size={18} />
                                    </div>
                                )}
                                <div className="card-body">
                                    <h3 className="card-title">{note.note_title}</h3>
                                    <div
                                        className="card-content break-word pt-2 text-center"
                                        dangerouslySetInnerHTML={{
                                            __html: note.message,
                                        }}
                                    />

                                    {/* Kebab Menu */}
                                    <div className="kebab-menu-container" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="kebab-menu-button border-radius-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenu((prev) => ({
                                                    ...prev,
                                                    [note.id]: !prev[note.id],
                                                }));
                                            }}
                                        >
                                            <FiMoreVertical size={20} />
                                        </button>

                                        {openMenu[note.id] && (
                                            <div className="kebab-menu-dropdown" ref={menuRef}
                                            onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(note.id, note.note_title);
                                                        setOpenMenu({});
                                                    }}
                                                    className="border-none button-hover-light"
                                                >
                                                    Delete
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePin(note);
                                                        setOpenMenu({});
                                                    }}
                                                    className="border-none button-hover-light"
                                                >
                                                    {note.note_flag ? "Unpin" : "Pin"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="cards-col col-md-4" onClick={() => openModal()}>
                        <div className="card mb-4 add-more d-flex justify-center align-center">
                            <div className="card-body text-center">
                                <div className="plus-icon-container">
                                    <h3 className="plus border-radius-50">
                                        <span className="icon-plus">&#43;</span>
                                    </h3>
                                </div>
                                <h3>Add More Notes</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title="Edit Note"
                    buttonText="Save"
                    onConfirm={closeModal}
                >
                    <input
                        type="text"
                        value={modalTitle}
                        onChange={(e) => setModalTitle(e.target.value)}
                        placeholder="Note Title"
                        className="form-control mb-2"
                    />
                    <ReactQuill data-testid="editor" value={editorContent} onChange={setEditorContent} theme="snow" />
                </Modal>
            )}
            {isDeleteModalOpen && (
                <Modal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    title="Confirm Delete"
                    buttonText="Delete"
                    onConfirm={handleDelete}
                >
                    <p>Are you sure you want to delete the note &quot;{modalTitle}&quot;?</p>
                </Modal>
            )}
        </div>
    );
};

export default NotesPage;
