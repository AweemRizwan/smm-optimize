import { useState } from 'react';
import { useGetPostAttributesByTypeQuery, useCreatePostAttributeMutation, useUpdatePostAttributeMutation } from '../../services/api/postAttributeApiSlice';
import DynamicTable from '../../components/shared/DynamicTable';
import Modal from '../../components/shared/ReUsableModal';
import {
    ErrorContainer,
    SuccessContainer,
    ToastContainer
} from '../../components/toast/Toast';
import SelectField from '../../components/Form/SelectField';

const CalendarVariables = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); // State to determine which modal is open
    const [inputValue, setInputValue] = useState(''); // State for input field value
    const [status, setStatus] = useState('Active'); // State for status in modal
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const [createPostAttribute] = useCreatePostAttributeMutation(); // Mutation for creating a new post attribute
    const [updatePostAttribute] = useUpdatePostAttributeMutation(); // Mutation for updating post attribute status

    // Fetch post attributes by type
    const {
        data: postTypes = [],
        isLoading: isLoadingTypes,
        refetch: refetchPostTypes,
    } = useGetPostAttributesByTypeQuery('post_type');

    const {
        data: postCategories = [],
        isLoading: isLoadingCategories,
        refetch: refetchPostCategories,
    } = useGetPostAttributesByTypeQuery('post_category');

    const {
        data: postCTAs = [],
        isLoading: isLoadingCTAs,
        refetch: refetchPostCTAs,
    } = useGetPostAttributesByTypeQuery('post_cta');
    // const [errorMessage, setErrorMessage] = useState(''); // New state for error message

    // const refetchAll = () => {
    //     refetchPostTypes();
    //     refetchPostCategories();
    //     refetchPostCTAs();
    // };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await updatePostAttribute({ id, is_active: !currentStatus }).unwrap();
            setSuccessMessage('Post attribute status updated successfully!');
            setErrorMessage(null);

            // **Refetch only the relevant type**
            if (modalType === 'postType') refetchPostTypes();
            if (modalType === 'postCategory') refetchPostCategories();
            if (modalType === 'postCTA') refetchPostCTAs();
        } catch (err) {
            setErrorMessage('Failed to update post attribute status.');
            setSuccessMessage(null);
            console.error('Failed to update post attribute status:', err);
        }
    };

    // Define columns for each table
    const columns = [
        { key: 'name', label: 'Name', className: 'pst-typ' },
        { key: 'status', label: 'Status', className: 'pst-sts' },
    ];

    // Render status buttons in tables
    const renderColumnContent = () => ({
        status: (row) => (
            <button
                className={`button-secondary${row.is_active ? '' : '-light'}`}
                onClick={() => toggleStatus(row.id, row.is_active)}
            >
                {row.is_active ? 'Active' : 'Inactive'}
            </button>
        ),
    });

    // Open modal with specific type
    const handleOpenModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
        setSuccessMessage(null);
        setErrorMessage(null);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType('');
        setInputValue('');
        setStatus('Active'); // Reset the status in modal
    };

    // Handle input change in modal
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Handle create attribute
    const handleCreateAttribute = async () => {
        const attributeType = modalType === 'postType' ? 'post_type' :
            modalType === 'postCategory' ? 'post_category' : 'post_cta';
        try {
            await createPostAttribute({
                name: inputValue,
                attribute_type: attributeType,
                is_active: status === 'Active',
            }).unwrap();

            setSuccessMessage('Post attribute created successfully!');
            setErrorMessage(null);
            // **Refetch only the relevant type**
            if (modalType === 'postType') refetchPostTypes();
            if (modalType === 'postCategory') refetchPostCategories();
            if (modalType === 'postCTA') refetchPostCTAs();
            handleCloseModal();
        } catch (error) {
            setErrorMessage('Failed to create post attribute.');
            setSuccessMessage(null);
            console.error('Failed to create post attribute:', error);
        }
    };

    // Render content for modal based on the type
    const renderModalContent = () => {
        let placeholder = '';
        switch (modalType) {
            case 'postType':
                placeholder = 'Post Type';
                break;
            case 'postCategory':
                placeholder = 'Post Category';
                break;
            case 'postCTA':
                placeholder = 'Post CTA';
                break;
            default:
                return null;
        }

        return (
            <div className="field-and-error text-left">
                <div className="field-container">
                    <label>{placeholder}</label>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleInputChange}
                        className="border-input mb-1"
                    />
                    <SelectField
                        label="Status"
                        name="status"
                        placeholder="Select Status"
                        dropdownPosition="static"
                        options={[
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                        ]}
                        value={status}
                        onChange={(value) => setStatus(value)}
                    />
                </div>
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
            <div className="row col-gap display-block-mob gap-10 wrap">
                <div className="col-md-6 col-sm-12 text-center max-height mb-2">
                    {isLoadingTypes ? (
                        <p>Loading Post Types...</p>
                    ) : (
                        <DynamicTable
                            columns={columns}
                            data={postTypes}
                            renderColumnContent={renderColumnContent(postTypes)}
                        />
                    )}
                    <button
                        className="button-accent-2 mt-5  width-100 col-white d-flex justify-center gap-20 align-center"
                        onClick={() => handleOpenModal('postType')}
                    >
                        Add Post Type
                    </button>
                </div>
                <div className="col-md-6 col-sm-12 text-center mb-2 max-height">
                    {isLoadingCategories ? (
                        <p>Loading Post Categories...</p>
                    ) : (
                        <DynamicTable
                            columns={columns}
                            data={postCategories}
                            renderColumnContent={renderColumnContent(postCategories)}
                        />
                    )}
                    <button
                        className="button-accent-2 mt-5 width-100 col-white d-flex justify-center gap-20 align-center"
                        onClick={() => handleOpenModal('postCategory')}
                    >
                        Add Post Category
                    </button>
                </div>
                <div className="col-md-6 col-sm-12 text-center mb-2 max-height">
                    {isLoadingCTAs ? (
                        <p>Loading Post CTAs...</p>
                    ) : (
                        <DynamicTable
                            columns={columns}
                            data={postCTAs}
                            renderColumnContent={renderColumnContent(postCTAs)}
                        />
                    )}
                    <button
                        className="button-accent-2 mt-5 width-100 col-white d-flex justify-center gap-20 align-center"
                        onClick={() => handleOpenModal('postCTA')}
                    >
                        Add Post CTA
                    </button>
                </div>
            </div>

            {/* Modal for adding post type/category/CTA */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={modalType === 'postType' ? 'Add Post Type' : modalType === 'postCategory' ? 'Add Post Category' : 'Add Post CTA'}
                buttonText="Create"
                onConfirm={handleCreateAttribute}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
};

export default CalendarVariables;
