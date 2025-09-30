import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useField } from 'formik';
import frame from '../../assets/images/Frame.png';

const SelectField = ({
  label,
  labelclassName='',
  name,
  placeholder,
  options = [],
  isLoading = false,
  className = '',
  value,
  onChange,
  margincls="",
  smallicon="",
  getOptionLabel = (o) => o.label,
  getOptionValue = (o) => o.value,
  dropdownPosition = 'absolute', // Default to absolute
  ...rest
}) => {
  // Use Formik's useField only if we don't have direct value/onChange props
  const [field, meta, helpers] = name && !onChange ? useField(name) : [{}, {}, { setValue: () => { } }];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentValue = onChange ? value : field.value;
  const handleChange = onChange || helpers.setValue;


  const selectedOption = options.find(
    (option) => getOptionValue(option) === currentValue
  );

  const handleOptionClick = (value) => {
    handleChange(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`position-relative flex-direction-column d-flex ${className}`}>
      {label && (
        <label htmlFor={name} className={`mb-1 ${labelclassName}`}>
          {label}
        </label>
      )}
      <div ref={dropdownRef} className="relative ">
        {/* Main container that acts as the select trigger */}
        <div
          className='px-3 min-width-200 border-radius-10 border-solid pxy-10 d-flex d-flex-space-between align-center cursor-pointer'
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className='titlt-light d-flex d-flex-space-between width-100 mr-2'>
            {selectedOption
              ? getOptionLabel(selectedOption)
              : placeholder || `Select ${label}`}
          </div>
          <img
            src={frame}
            alt=""
            className={`w-4 h-auto transition-transform duration-200 ${smallicon} ${isOpen ? 'transform-180' : ''
              }`}
          />
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <div className={`${dropdownPosition === 'static' ? 'position-static' : 'position-absolute'} border-radius-10 border-solid-full mt-1 width-100 bg-white z-index-1`}>
            {isLoading ? (
              <div className="px-3 py-2 ">Loading...</div>
            ) : options.length === 0 ? (
              <div className="px-3 py-2">No options available</div>
            ) : (
              options.map(option => {
                const optValue = getOptionValue(option);
                const isSelected = optValue === currentValue;
                return (
                  <label
                    key={optValue}
                    className={`
                      ${margincls} py-2 cursor-pointer border-bottom select-options margin-auto-3 titlt-light d-flex d-flex-space-between align-center
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'}
                    `}
                    onClick={() => handleOptionClick(optValue)}
                  >
                    <div className='slect-options d-flex d-flex-space-between align-center mr-2 width-100'>
                      {getOptionLabel(option)}
                    </div>
                    <input
                      type="radio"
                      name={name}
                      value={optValue}
                      checked={isSelected}
                      onChange={() => {
                        handleOptionClick(optValue);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent double triggering
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
  labelclassName: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  dropdownPosition: PropTypes.oneOf(['absolute', 'static']),
};

export default SelectField;