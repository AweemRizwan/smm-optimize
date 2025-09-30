// components/ApprovalGroup.jsx
import React from 'react';
import PropTypes from 'prop-types';
import ApprovalButton from './ApprovalButton';

/**
 * Workflow stages:
 * 1. writer fills content → marketing_manager approves it (internal content)
 * 2. account_manager approves it (client content)
 * 3. designer uploads creatives → marketing_manager approves it (internal creative)
 * 4. account_manager approves it (client creative)
 */
const ApprovalGroup = ({ row, handleApproval, scopeKey, role }) => {

    // console.log('row', row)
    
    // base “filled in” checks
    const hasContent = Boolean(row.tagline && row.caption && row.hashtags && row.e_hooks && row.creatives_text);
    const hasCreative = Array.isArray(row.creatives) && row.creatives.length > 0;

    // role gating per scope
    const isInternal = scopeKey === 'internal_status';
    const allowedRoles = isInternal ? ['marketing_manager'] : ['account_manager'];
    const canApprove = allowedRoles.includes(role);

    // current statuses
    const contentStatus = row[scopeKey]?.content_approval ?? false;
    const creativeStatus = row[scopeKey]?.creatives_approval ?? false;

    // “ready” logic for each button:
    // — internal content needs only writer’s content
    // — client content needs marketing’s content approval
    const contentReady = isInternal
        ? hasContent
        : row.internal_status?.content_approval === true;

    // — internal creative needs only designer’s uploads
    // — client creative needs marketing’s creative approval
    const creativeReady = isInternal
        ? hasCreative
        : row.internal_status?.creatives_approval === true;

    return (
        <>
            <ApprovalButton
                status={contentStatus}
                isReady={contentReady}
                isAllowed={canApprove}
                onApprove={() => handleApproval(row.id, scopeKey, 'content_approval')}
                approvedLabel="Content Approved"
                pendingLabel="Content Approval"
                className="mb-1 max-content"
            />
            <ApprovalButton
                status={creativeStatus}
                isReady={creativeReady}
                isAllowed={canApprove}
                onApprove={() => handleApproval(row.id, scopeKey, 'creatives_approval')}
                approvedLabel="Creative Approved"
                pendingLabel="Creative Approval"
                className="max-content"
            />
        </>
    );
};

ApprovalGroup.propTypes = {
    row: PropTypes.object.isRequired,
    handleApproval: PropTypes.func.isRequired,
    scopeKey: PropTypes.oneOf(['internal_status', 'client_approval']).isRequired,
    role: PropTypes.string.isRequired,
};

export default ApprovalGroup;
