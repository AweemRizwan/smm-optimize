import React from 'react';

const CalendarActionButton = ({
  row,
  approvalType, // 'internal_status' or 'client_approval'
  onApproval,
  role,
  disabledContent,
  disabledCreative,
  hasInternalContentApproval,
  hasInternalCreativeApproval,
}) => {
  // Determine if content is ready for approval
  const isContentReady = Boolean(
    row.tagline &&
    row.caption &&
    row.hashtags &&
    row.e_hooks &&
    row.creatives_text
  );

  // Determine if creative is ready for approval
  const isCreativeReady = row.creatives && row.creatives.length > 0;

  // Determine if buttons should be disabled based on approval type
  const contentDisabled = approvalType === 'client_approval' 
    ? disabledContent || !hasInternalContentApproval 
    : disabledContent;
  
  const creativeDisabled = approvalType === 'client_approval'
    ? disabledCreative || !hasInternalCreativeApproval
    : disabledCreative;

  return (
    <>
      <button
        className={
          row[approvalType]?.content_approval
            ? 'button-secondary mb-1'
            : 'button-secondary-light mb-1'
        }
        onClick={() => onApproval(row.id, approvalType, "content_approval")}
        disabled={!isContentReady || contentDisabled}
      >
        {row[approvalType]?.content_approval
          ? 'Content Approved'
          : 'Content Approval'}
      </button>
      <button
        className={
          row[approvalType]?.creatives_approval
            ? 'button-secondary'
            : 'button-secondary-light'
        }
        onClick={() => onApproval(row.id, approvalType, "creatives_approval")}
        disabled={!isCreativeReady || creativeDisabled}
      >
        {row[approvalType]?.creatives_approval
          ? 'Creative Approved'
          : 'Creative Approval'}
      </button>
    </>
  );
};

export default CalendarActionButton;