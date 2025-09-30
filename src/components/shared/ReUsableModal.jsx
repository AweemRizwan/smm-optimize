import PropTypes from 'prop-types'


const Modal = ({ isOpen, onClose, title, children, buttonText = 'confirm', onConfirm, btnClass = '' }) => {
  if (!isOpen) return null

  // Close modal when clicking on overlay (outside content)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }


  return (
    <div className="modal-overlay d-flex justify-center col-white align-center col-white fixed" onClick={handleOverlayClick}>
      <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-button cursor-pointer border-none px-2" onClick={onClose}>
          &times;
        </button>

        <h3 className='mb-2 modal-head'>{title}</h3>
        {children}

        <button className={`confirm-button border-none cursor-pointer button-secondary mt-5 mb-1  ${btnClass}`} onClick={onConfirm}>
          {buttonText}
        </button>
      </div>
    </div>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  buttonText: PropTypes.string,
  btnClass:PropTypes.string,
}

export default Modal
