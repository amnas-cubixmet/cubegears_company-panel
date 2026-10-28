import { INDIA_STATES } from '../../utils/indiaGst.js';
import { isValidEmail, normalizeEmail } from '../../utils/validation.js';

export const OWNER_COMPANY_FIELDS = [
  ['name', 'Shop name', 180],
  ['legal_name', 'Legal name', 220],
  ['email', 'Email', 254],
  ['phone', 'Phone', 30],
  ['gstin', 'GSTIN', 20],
  ['address', 'Address', 2000],
  ['city', 'City', 100],
  ['state', 'State', 100],
  ['country', 'Country', 100],
  ['pincode', 'PIN code', 12],
];
const stateNames = new Map(INDIA_STATES.map(([code, name]) => [name.toLowerCase(), code]));
const validCodes = new Set(INDIA_STATES.map(([code]) => code));
const stateCode = (value) => {
  const text = String(value || '').trim().toLowerCase();
  if (validCodes.has(text)) return text;
  const prefix = /^(\d{2})(?:\b|\s*[-–]\s*)/.exec(text);
  return (prefix && validCodes.has(prefix[1]) ? prefix[1] : '') || stateNames.get(text) || '';
};

export const normalizeOwnerCompanyDraft = (input = {}) =>
  Object.fromEntries(OWNER_COMPANY_FIELDS.map(([key]) => {
    const value = String(input[key] ?? '').trim();
    return [key, key === 'email' ? normalizeEmail(value)
      : key === 'gstin' ? value.toUpperCase() : value];
  }));

export const validateOwnerCompanyDraft = (input = {}) => {
  const draft = normalizeOwnerCompanyDraft(input);
  const errors = {};
  if (!draft.name) errors.name = 'Shop name is required.';
  for (const [key, label, limit] of OWNER_COMPANY_FIELDS) {
    if (draft[key].length > limit) errors[key] = label + ' must be ' + limit + ' characters or fewer.';
  }
  if (draft.email && !isValidEmail(draft.email)) {
    errors.email = 'Enter a valid email address (example: office@example.com).';
  }
  if (draft.phone) {
    const digits = draft.phone.replace(/\D/g, '');
    if (!/^\+?[\d\s().-]+$/.test(draft.phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = 'Enter a valid phone number (7–15 digits, optional country code).';
    }
  }
  if (draft.gstin) {
    if (!/^\d{2}[A-Z0-9]{13}$/.test(draft.gstin) || !validCodes.has(draft.gstin.slice(0, 2))) {
      errors.gstin = 'GSTIN must have 15 letters/digits and start with a valid state code.';
    } else if (draft.state && stateCode(draft.state) && stateCode(draft.state) !== draft.gstin.slice(0, 2)) {
      errors.state = 'State does not match the GSTIN state code (' + draft.gstin.slice(0, 2) + ').';
    }
  }
  if (draft.pincode) {
    if ((draft.country || 'India').toLowerCase() === 'india') {
      if (!/^\d{6}$/.test(draft.pincode)) errors.pincode = 'Enter a valid 6-digit Indian PIN code.';
    } else if (!/^[A-Za-z0-9 -]{3,12}$/.test(draft.pincode)) {
      errors.pincode = 'Enter a valid postal code (3–12 letters/digits).';
    }
  }
  return { draft, errors };
};

export const extractOwnerCompanyApiErrors = (error) => {
  const data = error?.data || error?.response?.data;
  const fieldErrors = {};
  const messages = [];
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const names = new Set(OWNER_COMPANY_FIELDS.map(([key]) => key));
    for (const [key, value] of Object.entries(data)) {
      const message = Array.isArray(value) ? value.map(String).join(' ') :
        typeof value === 'string' ? value : '';
      if (!message) continue;
      if (names.has(key)) fieldErrors[key] = message;
      else messages.push(message);
    }
  }
  return {
    fieldErrors,
    message: messages.join(' ') || (!Object.keys(fieldErrors).length
      ? error?.message || 'Unable to save shop details.' : ''),
  };
};
