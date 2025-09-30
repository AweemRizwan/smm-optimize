// CreativeModalWrapper.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../shared/ReUsableModal';
import CreativeField from './CreativeField';
import PropTypes from 'prop-types';

const CreativeModalWrapper = ({ row, role, handleValueChange }) => {
    // Initialize local value based on row.creatives
    const getInitialValue = () => {
        if (!row.creatives) return row.type === 'Carousel' ? [] : '';
        return row.type === 'Carousel'
            ? (Array.isArray(row.creatives) ? row.creatives : [row.creatives])
            : (Array.isArray(row.creatives) ? row.creatives[0] : row.creatives);
    };

    const [creativeValue, setCreativeValue] = useState(getInitialValue());

    // Sync if parent data changes
    useEffect(() => {
        setCreativeValue(getInitialValue());
    }, [row.creatives, row.type]);

    // Local change handler
    const handleCreativeChange = newValue => {
        setCreativeValue(newValue);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const onConfirm = () => {
        // Always produce an array payload
        const payload = Array.isArray(creativeValue)
            ? creativeValue
            : (creativeValue ? [creativeValue] : []);

        // Send full array to parent
        handleValueChange(row.id, 'creatives', payload);
        closeModal();
    };

    const getButtonText = () => {
        if (role === 'graphics_designer') {
            return row.creatives?.length > 0 ? 'Edit Creative' : 'Upload Creative';
        }
        return 'View Creative';
    };

    return (
        <>
            <button onClick={openModal} className="button-accent-2-light min-width-200">
                {getButtonText()}
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={role === 'graphics_designer' ? 'Update Creative' : 'View Creative'}
                onConfirm={onConfirm}
                buttonText="Save"
                btnClass={role !== 'graphics_designer' ? 'd-none' : ''}
            >
                <CreativeField
                    row={{ ...row, creatives: creativeValue }}
                    role={role}
                    onChange={handleCreativeChange}
                />
            </Modal>
        </>
    );
};

CreativeModalWrapper.propTypes = {
    row: PropTypes.shape({
        id: PropTypes.any.isRequired,
        type: PropTypes.string.isRequired,
        creatives: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.string),
            PropTypes.string
        ])
    }).isRequired,
    role: PropTypes.string.isRequired,
    handleValueChange: PropTypes.func.isRequired,
};

export default CreativeModalWrapper;

