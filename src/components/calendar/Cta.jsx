import React, { useState } from 'react';

const CTAButton = ({ selectedCTA = 'WhatsApp', onSelectCTA }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ctas = ['WhatsApp', 'Website', 'Email'];

    const handleSelect = (cta) => {
        onSelectCTA(cta);
        setIsOpen(false);
    };

    return (
        <div className="dropdown-button-container">
            <button
                className={`dropdown-button cta-bg border-none ${selectedCTA.toLowerCase}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedCTA}
            </button>
            {isOpen && (
                <div className="dropdown-dropdown cta-border position-absolute top-100 left-0 mt-1 px-2 py-2 d-flex flex-direction-column gap-10">
                    {ctas.map((cta) => (
                        <button
                            key={cta}
                            className={`dropdown-dropdown-item border-none text-center cta  ${cta === selectedCTA ? 'selected' : ''}`}
                            onClick={() => handleSelect(cta)}
                        >
                            {cta}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CTAButton;