// Keep form input and API payloads consistent across login, recovery and staff invites.
export const normalizeEmail = (email) =>
  String(email ?? '').trim().toLowerCase();

export const isValidEmail = (email) => {
  const value = normalizeEmail(email);
  return value.length <= 254 && /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value);
};

export const isValidPhone = (phone) => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(String(phone));
};
