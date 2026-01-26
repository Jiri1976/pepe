export const CONFIRM_ACTIONS = {
    NO_ACTION: '',
    DELETE_USER: 'delete-user',
    DELETE_PROPOSAL_CARD: 'delete-proposal-card',
    RESET_PROPOSALS: 'reset-proposals',
    SELECT_MONTH: 'select-month',
    GET_PDF: 'get-pdf'
} as const;

export type ConfirmAction =
    (typeof CONFIRM_ACTIONS)[keyof typeof CONFIRM_ACTIONS];