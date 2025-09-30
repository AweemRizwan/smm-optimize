import React, { useState } from 'react';

const CategoryButton = ({ selectedCategory, onSelectCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const categories = ['Awareness', 'Services', 'Benefits', 'Testimonials'];

    const handleSelect = (category) => {
        onSelectCategory(category);
        setIsOpen(false);
    };

    return (
        <div className="dropdown-button-container">
            <button
                className={`dropdown-button button-accent-2 ${selectedCategory.toLowerCase()}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedCategory}
            </button>
            {isOpen && (
                <div className="dropdown-dropdown cat-border position-absolute top-100 left-0 mt-1 px-2 py-2 d-flex flex-direction-column gap-10">
                    {categories.map((category) => ( 
                        <button
                            key={category}
                            className={`dropdown-dropdown-item border-none cat text-center ${category === selectedCategory ? 'selected' : ''}`}
                            onClick={() => handleSelect(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryButton;