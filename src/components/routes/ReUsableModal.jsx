import PropTypes from 'prop-types';

const Modal = ({ isOpen, onClose, title, children = null, buttonText = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal d-flex justify-center col-white align-center fixed">
      <div className="modal-content text-center">
        {/* Close button */}
        <button
          className="modal-close-button cursor-pointer border-none px-2"
          onClick={onClose}
        >
          &times;
        </button>

        <h3 className="mb-2 modal-head">{title}</h3>
        {children}

        <button
          className="confirm-button border-none cursor-pointer button-secondary mt-5 mb-1"
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

// Define prop types for the Modal component
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  buttonText: PropTypes.string,
};

export default Modal;
