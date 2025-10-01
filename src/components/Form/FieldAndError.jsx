import { useState } from 'react';
import { ErrorMessage, Field } from 'formik';
import PropTypes from 'prop-types';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const FieldAndError = ({
    name,
    label,
    type = 'text',
    disabled = false,
    placeholder = '',
    rows,
    showPasswordToggle = false,
    customClass = '',
    labelClass = '',
    parentClass = '',
    renderField,
    customError = '',
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword((prevState) => !prevState);
    };

    return (
        <div className={`field-and-error ${parentClass}`}>
            {label && <label htmlFor={name} className={`form-label ${labelClass}`}>{label}</label>}
            <div className="field-container">
                {renderField ? (
                    renderField()
                ) : (
                    <Field name={name}>
                        {({ field }) => (
                            <>
                                {type === 'textarea' ? (
                                    <textarea
                                        {...field}
                                        id={name}
                                        className={`form-control ${customClass}`}
                                        disabled={disabled}
                                        placeholder={placeholder}
                                        rows={rows || undefined}
                                        value={field.value ?? ""}   /* ✅ fallback */
                                        {...props}
                                    />
                                ) : (
                                    <input
                                        {...field}
                                        id={name}
                                        type={type === 'password' && showPasswordToggle
                                            ? (showPassword ? 'text' : 'password')
                                            : type}
                                        className={`form-control ${customClass}`}
                                        disabled={disabled}
                                        placeholder={placeholder}
                                        value={field.value ?? ""}   /* ✅ fallback */
                                        {...props}
                                    />
                                )}
                                {showPasswordToggle && (
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={toggleShowPassword}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                )}
                            </>
                        )}
                    </Field>
                )}
            </div>
            <ErrorMessage name={name} component="div" className={`text-danger ${customError}`} />
        </div>
    );
};

FieldAndError.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    showPasswordToggle: PropTypes.bool,
    customClass: PropTypes.string,
    labelClass: PropTypes.string,
    parentClass: PropTypes.string,
    renderField: PropTypes.func,
    customError: PropTypes.string,
};

export default FieldAndError;
