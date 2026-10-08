const toMessage = (value) => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean).join(' ');
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const nested = Object.values(value).flatMap((item) =>
      Array.isArray(item) ? item : [item],
    );
    return nested.map(String).filter(Boolean).join(' ');
  }
  return '';
};

export const getAuthFieldErrors = (error) => {
  const payload = error?.data || error?.response?.data || {};
  const fields = {};

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    Object.entries(payload).forEach(([key, value]) => {
      if (['message', 'error', 'detail'].includes(key)) return;
      const message = toMessage(value);
      if (message) fields[key] = message;
    });
  }

  return fields;
};

export const getAuthErrorMessage = (
  error,
  fallback = 'Something went wrong. Please try again.',
) => {
  const fields = getAuthFieldErrors(error);
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.data?.detail ||
    fields.non_field_errors ||
    fields.nonFieldErrors ||
    error?.message ||
    fallback
  );
};

export const getCredentialError = (error) => {
  const fields = getAuthFieldErrors(error);
  return (
    fields.non_field_errors ||
    fields.nonFieldErrors ||
    getAuthErrorMessage(error, 'Invalid email or password.')
  );
};
