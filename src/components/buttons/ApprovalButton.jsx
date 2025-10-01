// components/ApprovalButton.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ApprovalButton = ({
  status,
  isReady = true,
  isAllowed,
  onApprove,
  approvedLabel, 
  pendingLabel,
  className,
}) => {
  const baseClass = status ? 'button-secondary' : 'button-secondary-light';

  return (
    <button
      className={`${baseClass} ${className} fnt-16` }
      onClick={onApprove}
      /* disabled only when NOT allowed or NOT ready—never on status */
      disabled={!isAllowed || !isReady}
    >
      {status ? approvedLabel : pendingLabel}
    </button>
  );
};

ApprovalButton.propTypes = {
  status:        PropTypes.bool.isRequired,
  isReady:       PropTypes.bool,
  isAllowed:     PropTypes.bool.isRequired,
  onApprove:     PropTypes.func.isRequired,
  approvedLabel: PropTypes.string.isRequired,
  pendingLabel:  PropTypes.string.isRequired,
  className:     PropTypes.string,
};

export default ApprovalButton;
