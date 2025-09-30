const workflowMapping = {
  assign_team: {
    status: 'Waiting for Assign Team',
    next: 'create_proposal',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['marketing_director'], // Assign team can be done by these roles
  },
  create_proposal: {
    status: 'Waiting for Create Proposal',
    next: 'approve_proposal',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['marketing_manager'], // Proposal creation by these roles
  },
  approve_proposal: {
    status: 'Waiting for Approve Proposal',
    next: 'schedule_brief_meeting',
    buttons: [
      { label: 'Done', status: 'approve' },
      { label: 'Changes Required', status: 'changes_required' },
      { label: 'Decline', status: 'declined' },
    ],
    allowedRoles: ['account_manager'], // Proposal approval by senior roles
  },
  schedule_brief_meeting: {
    status: 'Waiting for Schedule Brief Meeting',
    next: 'is_meeting_completed',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Scheduling meeting by account/marketing managers
  },
  is_meeting_completed: {
    status: 'Waiting for Meeting Completion',
    next: 'assigned_plan_to_client',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Only account managers can mark meetings as completed
  },
  assigned_plan_to_client: {
    status: 'Waiting for Plan Assignment to Client',
    next: 'create_strategy',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Account manager handles plan assignment
  },
  create_strategy: {
    status: 'Waiting for Strategy Creation',
    next: 'content_writing',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['marketing_manager'], // Strategy created by managers/directors
  },
  content_writing: {
    status: 'Waiting for Content Writing',
    next: 'approve_content_by_marketing_manager',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['content_writer'], // Content writing by content writers
  },
  approve_content_by_marketing_manager: {
    status: 'Waiting for Content Approval by Marketing Manager',
    next: 'approve_content_by_account_manager',
    buttons: [
      { label: 'Done', status: 'approve' },
      { label: 'Changes Required', status: 'changes_required' },
    ],
    allowedRoles: ['marketing_manager'], // Content approved by marketing manager
  },
  approve_content_by_account_manager: {
    status: 'Waiting for Content Approval by Account Manager',
    next: 'creatives_design',
    buttons: [
      { label: 'Done', status: 'approve' },
      { label: 'Changes Required', status: 'changes_required' },
    ],
    allowedRoles: ['account_manager'], // Content approved by account manager
  },
  creatives_design: {
    status: 'Waiting for Creatives Design',
    next: 'approve_creatives_by_marketing_manager',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['graphics_designer'], // Creatives designed by graphics designers
  },
  approve_creatives_by_marketing_manager: {
    status: 'Waiting for Creatives Approval by Marketing Manager',
    next: 'approve_creatives_by_account_manager',
    buttons: [
      { label: 'Done', status: 'approve' },
      { label: 'Changes Required', status: 'changes_required' },
    ],
    allowedRoles: ['marketing_manager'], // Creatives approved by marketing manager
  },
  approve_creatives_by_account_manager: {
    status: 'Waiting for Creatives Approval by Account Manager',
    next: 'schedule_onboarding_meeting',
    buttons: [
      { label: 'Done', status: 'approve' },
      { label: 'Changes Required', status: 'changes_required' },
    ],
    allowedRoles: ['account_manager'], // Approved by account manager
  },
  schedule_onboarding_meeting: {
    status: 'Waiting for Onboarding Meeting Scheduling',
    next: 'onboarding_meeting',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Onboarding meetings scheduled by account managers
  },
  onboarding_meeting: {
    status: 'Waiting for Onboarding Meeting',
    next: 'smo_scheduling',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Onboarding meeting handled by account managers
  },
  smo_scheduling: {
    status: 'Waiting for SMO Scheduling',
    next: 'invoice_submission',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['marketing_assistant'], // Scheduling by marketing roles
  },
  invoice_submission: {
    status: 'Waiting for Invoice Submission',
    next: 'invoice_verification',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['accountant'], // Invoice submission by accountants
  },
  invoice_verification: {
    status: 'Waiting for Invoice Verification',
    next: 'payment_confirmation',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Verified by accountants
  },
  payment_confirmation: {
    status: 'Waiting for Payment Confirmation',
    next: 'schedule_meeting',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['accountant'], // Payment confirmed by accountants
  },
  schedule_meeting: {
    status: 'Waiting for Meeting Scheduling',
    next: 'brief_meeting',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Meeting scheduling by account managers
  },
  brief_meeting: {
    status: 'Waiting for Brief Meeting',
    next: 'create_strategy',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['account_manager'], // Handled by account managers
  },
  monthly_reporting: {
    status: 'Waiting for Monthly Reporting',
    next: 'invoice_submission',
    buttons: [
      { label: 'Done', status: 'approve' },
    ],
    allowedRoles: ['marketing_assistant', 'marketing_manager'], // Reporting by marketing roles
  },
};

export default workflowMapping;
