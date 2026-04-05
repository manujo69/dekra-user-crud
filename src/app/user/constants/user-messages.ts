export const USER_MESSAGES = {
  errors: {
    notFound: 'User not found',
    loadError: 'Error loading users',
    deleteError: 'Error deleting user',
    createError: 'Error creating user',
    updateError: 'Error updating user',
  },
  success: {
    deleted: 'User deleted',
    created: 'User created',
    updated: 'User updated',
  },
  deleteDialog: {
    title: 'Delete user',
    confirmLabel: 'Delete',
  },
} as const;

export const MOCK_DEFAULTS = {
  pendingPassword: 'PENDING_ACTIVATION',
} as const;
