import { isValidEmail, normalizeEmail } from '../../utils/validation.js';

export const companyFields = ['name', 'phone', 'email', 'gstNo', 'address'];

export const normalizeCompanyDraft = (draft = {}) => ({
  name: String(draft.name || '').trim(),
  phone: String(draft.phone || '').trim(),
  email: normalizeEmail(draft.email),
  gstNo: String(draft.gstNo || '').trim().toUpperCase(),
  address: String(draft.address || '').trim(),
});

export const validateCompanyDraft = (input = {}) => {
  const draft = normalizeCompanyDraft(input);
  const errors = {};
  if (!draft.name) errors.name = 'Enter a workshop / company name.';
  else if (draft.name.length > 180) errors.name = 'Company name must be 180 characters or fewer.';
  if (draft.phone.length > 30) errors.phone = 'Phone number must be 30 characters or fewer.';
  if (draft.email && !isValidEmail(draft.email)) {
    errors.email = 'Enter a valid company email address.';
  }
  if (draft.gstNo && !/^[0-9]{2}[A-Z0-9]{13}$/.test(draft.gstNo)) {
    errors.gstNo = 'GSTIN must be 15 letters/digits, starting with the 2-digit state code.';
  }
  if (draft.address.length > 2000) errors.address = 'Address must be 2,000 characters or fewer.';
  return { draft, errors };
};

export const formatCompanyApiError = (error) => {
  const data = error?.response?.data || error?.data;
  if (data && typeof data === 'object') {
    const messages = Object.entries(data).flatMap(([field, value]) => {
      const text = Array.isArray(value) ? value.join(', ') :
        typeof value === 'string' ? value : '';
      return text ? [field === 'non_field_errors' ? text : field + ': ' + text] : [];
    });
    if (messages.length) return messages.join(' ');
  }
  return error?.message || 'Could not save company details.';
};
