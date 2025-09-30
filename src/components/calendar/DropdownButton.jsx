import { useState } from 'react';

// map variants to Tailwind (or your own) classes:
const VARIANT_CLASSES = {
    type: 'button-secondary border-none',
    category: 'button-accent-2 border-none',
    cta: 'button-warning border-none',
};


const DropdownButton = ({ variant, selectedValue, options, onSelect, className, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value) => {
        if (!disabled) {
            onSelect(value);
            setIsOpen(false);
        }
    };

    const variantClass = VARIANT_CLASSES[variant] || 'bg-gray-200';


    return (
        <div className="dropdown-button-container">
            <button
                className={`
                    dropdown-button px-3 py-1 rounded text-transform-cap fnt-16
                    ${variantClass} 
                    ${className} 
                   ${selectedValue?.toLowerCase()} ${disabled ? 'disabled' : ''}}
                  `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                {selectedValue || 'Select'}
            </button>
            {isOpen && !disabled && (
                <div className="dropdown-dropdown position-absolute top-100 left-0 mt-1 px-2 py-2 d-flex flex-direction-column gap-10">
                    {options.map((option) => (
                        <button
                            key={option.id || option} // Use `id` if options are objects, fallback to value
                            className={`text-transform-cap dropdown-dropdown-item border-radius-10 border-none text-center fnt-16 pxy-10 ${option.name === selectedValue || option === selectedValue ? `selected ${variantClass}` : ''
                                }`}
                            onClick={() => handleSelect(option.name || option)} // Use `name` if options are objects
                            disabled={disabled}
                        >
                            {option.name || option} {/* Display `name` if options are objects */}
                        </button>
                    ))} 
                </div>
            )}
        </div>
    );
};

export default DropdownButton;
