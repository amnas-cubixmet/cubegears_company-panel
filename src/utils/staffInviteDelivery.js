/** Status describes the Django/provider handoff, never inbox receipt. */
export const staffInviteDeliveryMessage = (status) => {
  switch (status) {
    case 'submitted':
      return 'Staff setup email was accepted by the email provider. Ask the staff member to check their inbox and spam.';
    case 'console_only':
      return 'Staff saved, but email is going to the Django terminal (Console Email Backend). Configure SMTP in the backend .env, then use Send Login Invite.';
    case 'local_only':
      return 'Staff saved. Email was captured by the local test backend, not delivered to an inbox. Configure SMTP and resend.';
    case 'pending':
      return 'Staff saved. Invitation is waiting for the database transaction to commit, then Celery will queue it.';
    case 'disabled':
      return 'Staff saved. Email sending is disabled. Enable email delivery, Redis and Celery Worker with SMTP, then resend the invitation.';
    case 'failed':
      return 'Staff saved, but sending the invitation failed. Check Redis, Celery Worker and SMTP logs, then resend. Do not create the staff again.';
    case 'queued':
      return 'Staff saved. Setup email is queued for delivery. If it does not arrive, check Celery Worker logs and SMTP settings.';
    case 'not_requested':
      return 'Staff saved without an email invite. Add a valid email and role to enable login.';
    default:
      return '';
  }
};

/** Read DRF validation errors from normalized or raw Axios responses. */
export const staffInviteErrorMessage = (error) => {
  const payload = error?.data || error?.response?.data;
  const messages = (value) => {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(messages).filter(Boolean).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map(messages).filter(Boolean).join(' ');
    return '';
  };
  return messages(payload) || error?.message || 'Unable to send invite. Please try again.';
};
