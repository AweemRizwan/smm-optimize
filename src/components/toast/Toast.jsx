import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Toast.scss';

// Import SVGs as URLs
import successIcon from '../../assets/images/success-svgrepo-com.svg';
import errorIcon from '../../assets/images/error-10376.svg';
import closeIcon from '../../assets/images/icons8-close.svg';

// Generic Toast component
const Toast = ({ type, title, message, duration = 10000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Reset visibility when message changes
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose, message]); // Added message to dependencies

  if (!visible) return null;

  // Select icon src based on type
  const iconSrc = type === 'success' ? successIcon : errorIcon;

  return (
    <div className={`toast ${type}`}>
      <div className="toast-status-icon">
        <img width={18} src={iconSrc} alt={`${type} icon`} />
      </div>
      <div className="toast-content">
        <span>{title}</span>
        <p>{message}</p>
      </div>
      <button
        className="toast-close border-none filter-grey-black"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      >
        <img width={18} src={closeIcon} alt="Close icon" />
      </button>
      <div className="toast-duration"></div>
    </div>
  );
};

Toast.propTypes = {
  type: PropTypes.oneOf(['success', 'error']).isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  onClose: PropTypes.func,
};

// SuccessContainer wrapper
export const SuccessContainer = ({ message, onClose }) => (
  <Toast
    type="success"
    title="Success"
    message={message}
    onClose={onClose}
  />
);

SuccessContainer.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

// ErrorContainer wrapper
export const ErrorContainer = ({ message, onClose }) => (
  <Toast
    type="error"
    title="Error"
    message={message}
    onClose={onClose}
  />
);

ErrorContainer.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

// Optional ToastContainer to wrap multiple toasts
export const ToastContainer = ({ children }) => (
  <div id="toast-container" className="toast-container">
    {children}
  </div>
);

ToastContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Toast;