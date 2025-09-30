import React, { useState } from 'react';

const TypeButton = ({ selectedType, onSelectType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const types = ['Post', 'Reel', 'Carousel'];

    const handleSelect = (type) => {
        onSelectType(type);
        setIsOpen(false);
    };

    return (
        <div className="dropdown-button-container">
            <button
                className={`dropdown-button button-secondary ${selectedType.toLowerCase()}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedType}
            </button>
            {isOpen && (
                <div className="dropdown-dropdown position-absolute top-100 left-0 mt-1 px-2 py-2 d-flex flex-direction-column gap-10">
                    {types.map((type) => (
                        <button
                            key={type}
                            className={`dropdown-dropdown-item border-none text-center ${type === selectedType ? 'selected' : ''}`}
                            onClick={() => handleSelect(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TypeButton;