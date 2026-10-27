/**
 * Build a clean Django invoice payload without changing the editable draft.
 * DRF DecimalField rejects blank strings, and UUIDField rejects "".
 */

const numberField = (value, label, { blank = '0', positive = false, min = 0, max = null, integerDigits = 10 } = {}) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    if (blank === null) throw new Error(label + ' is required.');
    value = blank;
  }
  const text = String(value).trim();
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) {
    throw new Error('Enter a valid number for ' + label + '.');
  }
  const numeric = Number(text);
  if (!Number.isFinite(numeric)) throw new Error('Enter a valid number for ' + label + '.');
  if (positive ? numeric <= 0 : numeric < min || (max !== null && numeric > max)) {
    throw new Error(label + (positive ? ' must be greater than zero.' : ' is out of range.'));
  }
  if (max !== null && numeric > max) throw new Error(label + ' is out of range.');
  const parts = text.replace(/^-/, '').split('.');
  if ((parts[1] || '').length > 2 || parts[0].replace(/^0+/, '').length > integerDigits) {
    throw new Error(label + ' must fit within ' + integerDigits + ' digits and 2 decimal places.');
  }
  return text;
};


export const validateInvoiceDraft = (draft) => {
  const errors = {};
  if (!String(draft.customer?.name || '').trim()) errors['customer.name'] = 'Customer name is required.';
  if (!draft.items?.length) errors.items = 'Add at least one item.';
  const check = (path, value, label, options) => {
    try { numberField(value, label, options); }
    catch (error) { errors[path] = error.message; }
  };
  check('paid', draft.paid, 'Received amount');
  check('discount', draft.discount, 'Invoice discount');
  check('adjustment', draft.adjustment, 'Adjustment', { min: -9999999999 });
  for (const key of ['cgstRate', 'sgstRate', 'igstRate']) {
    check(key, draft[key], key, { max: 100, integerDigits: 3 });
  }
  (draft.items || []).forEach((item, index) => {
    const path = 'items.' + index;
    if (!String(item.description || '').trim() && item.type !== 'Stock Part') {
      errors[path + '.description'] = 'Item name / description is required.';
    }
    if (draft.invoiceType === 'gst' && !String(item.hsnCode || '').trim()) {
      errors[path + '.hsnCode'] = 'HSN / SAC is required for GST invoices.';
    }
    if (item.type === 'Stock Part' && !item.inventoryId) {
      errors[path + '.inventoryId'] = 'Select a stock item.';
    }
    check(path + '.qty', item.qty, 'Item ' + (index + 1) + ' quantity', { blank: null, positive: true });
    check(path + '.rate', item.rate, 'Item ' + (index + 1) + ' price per unit');
    check(path + '.purchasePrice', item.purchasePrice, 'Item ' + (index + 1) + ' purchase price');
    check(path + '.discount', item.discount, 'Item ' + (index + 1) + ' discount');
    check(path + '.taxRate', item.taxRate, 'Item ' + (index + 1) + ' GST rate', {
      blank: draft.invoiceType === 'gst' ? null : '0',
      max: 100, integerDigits: 3,
    });
  });
  return errors;
};

export const extractInvoiceFieldErrors = (error) => {
  if (error?.fieldErrors) return error.fieldErrors;
  if (!error?.data || typeof error.data !== 'object') return {};
  const fields = {};
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      if (value.every((item) => typeof item === 'string')) {
        fields[path] = value.join(' ');
      } else {
        value.forEach((item, index) => walk(item, path ? path + '.' + index : String(index)));
      }
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, item]) => walk(item, path ? path + '.' + key : key));
    } else if (value !== undefined && value !== null && path) {
      fields[path] = String(value);
    }
  };
  walk(error.data, '');
  return fields;
};

export const prepareInvoicePayloadForApi = (draft) => {
  const fieldErrors = validateInvoiceDraft(draft);
  if (Object.keys(fieldErrors).length) {
    const error = new Error('Correct the highlighted invoice fields before saving.');
    error.fieldErrors = fieldErrors;
    throw error;
  }
  const gst = draft.invoiceType === 'gst';
  return {
    ...draft,
    paid: numberField(draft.paid, 'Received amount'),
    discount: numberField(draft.discount, 'Invoice discount'),
    adjustment: numberField(draft.adjustment, 'Adjustment', { min: -9999999999 }),
    cgstRate: numberField(draft.cgstRate, 'CGST rate', { max: 100, integerDigits: 3 }),
    sgstRate: numberField(draft.sgstRate, 'SGST rate', { max: 100, integerDigits: 3 }),
    igstRate: numberField(draft.igstRate, 'IGST rate', { max: 100, integerDigits: 3 }),
    items: (draft.items || []).map((item, index) => {
      const label = 'Item ' + (index + 1);
      return {
        ...item,
        qty: numberField(item.qty, label + ' quantity', { blank: null, positive: true }),
        rate: numberField(item.rate, label + ' price per unit'),
        purchasePrice: numberField(item.purchasePrice, label + ' purchase price'),
        discount: numberField(item.discount, label + ' discount'),
        taxRate: numberField(item.taxRate, label + ' GST rate', {
          blank: gst ? null : '0', max: 100, integerDigits: 3,
        }),
        // No stock selected is null, not an invalid empty UUID.
        inventoryId: item.inventoryId || null,
      };
    }),
  };
};

export const formatInvoiceValidationError = (error) => {
  const payload = error?.data;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return error?.message || 'Unable to save invoice.';
  }
  const messages = [];
  const collect = (value, path) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        collect(entry, typeof entry === 'object' && entry !== null ? path + '[' + (index + 1) + ']' : path);
      });
    } else if (value !== null && typeof value === 'object') {
      Object.entries(value).forEach(([key, entry]) => collect(entry, path ? path + '.' + key : key));
    } else if (value !== null && value !== undefined && String(value).trim()) {
      messages.push((path ? path + ': ' : '') + String(value));
    }
  };
  for (const [key, value] of Object.entries(payload)) {
    collect(value, key === 'non_field_errors' || key === 'detail' ? '' : key);
  }
  return messages.join(' | ') || error?.message || 'Unable to save invoice.';
};
