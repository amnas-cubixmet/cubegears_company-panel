export const truncateText = (str, length = 30) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'paid':
      return 'success';
    case 'pending':
    case 'in_progress':
      return 'warning';
    case 'inactive':
    case 'cancelled':
    case 'unpaid':
      return 'danger';
    default:
      return 'info';
  }
};
