import { useState, useEffect, useRef } from "react";
import Modal from "../../components/shared/ReUsableModal";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
    useGetStrategiesQuery,
    useCreateOrUpdateStrategyMutation,
    useDeleteStrategyMutation,
} from "../../services/api/strategyApiSlice";
import { useParams } from "react-router-dom";
import useCurrentUser from "../../hooks/useCurrentUser";
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import { FiMoreVertical } from "react-icons/fi";

const Strategy = () => {
    const { role } = useCurrentUser();
    const { clientId } = useParams();
    const { data: strategies = [], isLoading, refetch } = useGetStrategiesQuery(clientId);
    const [createOrUpdateStrategy] = useCreateOrUpdateStrategyMutation();
    const [deleteStrategy] = useDeleteStrategyMutation();

    // State for modals and editor
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editorContent, setEditorContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [openMenu, setOpenMenu] = useState({}); // Track open kebab menu state
    const menuRef = useRef(null);

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


    // State for success and error messages
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Open Modal
    const openModal = (strategy = null) => {
        if (strategy) {
            setSelectedStrategy(strategy.id);
            setEditorContent(strategy.content);
            setModalTitle(strategy.title);
        } else {
            setSelectedStrategy(null);
            setEditorContent("");
            setModalTitle("");
        }
        setSuccessMessage(null);
        setErrorMessage(null);
        setIsModalOpen(true);
    };

    // Close Modal and Save Strategy
    const closeModal = async () => {
        if (modalTitle.trim() && editorContent.trim()) {
            const payload = { [modalTitle]: editorContent };

            try {
                await createOrUpdateStrategy({ clientId, data: payload }).unwrap();
                setSuccessMessage("Strategy saved successfully!");
                setErrorMessage(null);
                refetch();
            } catch (error) {
                setErrorMessage("Error saving strategy. Please try again.");
                setSuccessMessage(null);
                console.error("Error saving strategy:", error);
            }
        }
        setIsModalOpen(false);
    };

    // Open Delete Modal
    const openDeleteModal = (strategyTitle) => {
        setSelectedStrategy(strategyTitle);
        setSuccessMessage(null);
        setErrorMessage(null);
        setIsDeleteModalOpen(true);
    };

    // Confirm Delete
    const handleDelete = async () => {
        if (!selectedStrategy) return;

        try {
            await deleteStrategy({
                clientId,
                data: { title: selectedStrategy },
            }).unwrap();
            setSuccessMessage(`Strategy "${selectedStrategy}" deleted successfully!`);
            setErrorMessage(null);
            refetch();
        } catch (error) {
            setErrorMessage(`Error deleting strategy "${selectedStrategy}". Please try again.`);
            setSuccessMessage(null);
            console.error(`Error deleting strategy "${selectedStrategy}":`, error);
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedStrategy(null);
        }
    };

    if (isLoading) return <p>Loading strategies...</p>;

    return (
        <div className="section">
            <h2 className="mb-2">SMM Strategy</h2>
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

            <div className="strategy">
                {Object.keys(strategies?.strategies || {}).length === 0 ? (
                    <div className="no-strategies">
                        {role !== "marketing_manager" && (
                            <p className="text-center">No strategies available</p>
                        )}
                        {role === "marketing_manager" && (
                            <div className="cards-col col-md-4" onClick={() => openModal()}>
                                <div className="card mb-4 add-more d-flex justify-center align-center">
                                    <div className="card-body text-center">
                                        <div className="plus-icon-container">
                                            <h3 className="plus">
                                                <span className="icon-plus">&#43;</span>
                                            </h3>
                                        </div>
                                        <h3>Add More Strategies</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="row wrap gap-20 mt-5">
                        {Object.entries(strategies?.strategies || {}).map(([title, content]) => (
                            <div className="cards-col col-md-4" key={title}>
                                <div
                                    className="card mb-4"
                                    onClick={() => openModal({ id: title, content, title })}
                                    style={{ cursor: "pointer", position: "relative" }}
                                >
                                    <div className="card-body">
                                        <h3 className="card-title">{title}</h3>
                                        <div
                                            className="card-content break-word"
                                            dangerouslySetInnerHTML={{ __html: content }}
                                        />
                                        {role === "marketing_manager" && (
                                            <div className="kebab-menu-container" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="kebab-menu-button border-radius-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenu((prev) => ({
                                                            ...prev,
                                                            [title]: !prev[title],
                                                        }));
                                                    }}
                                                >
                                                    <FiMoreVertical size={20} />
                                                </button>

                                                {openMenu[title] && (
                                                    <div className="kebab-menu-dropdown" ref={menuRef}
                                                        onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteModal(title);
                                                                setOpenMenu({});
                                                            }}
                                                            className="border-none button-hover-light"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {role === "marketing_manager" && (
                            <div className="cards-col col-md-4" onClick={() => openModal()}>
                                <div className="card mb-4 add-more d-flex justify-center align-center">
                                    <div className="card-body text-center">
                                        <div className="plus-icon-container">
                                            <h3 className="plus">
                                                <span className="icon-plus">&#43;</span>
                                            </h3>
                                        </div>
                                        <h3>Add More Strategies</h3>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {role === 'marketing_manager' && isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title="Edit Strategy"
                    buttonText="Save"
                    onConfirm={closeModal}
                >
                    <input
                        type="text"
                        value={modalTitle}
                        onChange={(e) => setModalTitle(e.target.value)}
                        placeholder="Strategy Title"
                        className="form-control mb-2"
                    />
                    <ReactQuill value={editorContent} onChange={setEditorContent} theme="snow" />
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
                    <p>Are you sure you want to delete the strategy &quot;{selectedStrategy}&quot;?</p>
                </Modal>
            )}
        </div>
    );
};

export default Strategy;
