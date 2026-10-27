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

export const prepareInvoicePayloadForApi = (draft) => {
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
