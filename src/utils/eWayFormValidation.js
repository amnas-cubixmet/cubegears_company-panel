import { INDIA_STATES } from './indiaGst.js';
import { eWayTaxMode, eWayTotalGstRate } from './eWayGst.js';

const states = new Set(INDIA_STATES.map(([code]) => code));
const gstinPattern = /^\d{2}[A-Z0-9]{13}$/;
const validParty = (party, prefix, errors) => {
  if (!String(party?.tradeName || '').trim()) {
    errors[prefix + '.tradeName'] = 'Enter the party trade name.';
  }
  const gstin = String(party?.gstin || '').trim().toUpperCase();
  if (gstin !== 'URP' && !gstinPattern.test(gstin)) {
    errors[prefix + '.gstin'] = 'Enter a valid 15-character GSTIN or URP.';
  }
  const code = String(party?.stateCode || '').trim();
  if (!states.has(code)) {
    errors[prefix + '.stateCode'] = 'Select a valid Indian state.';
  } else if (gstin !== 'URP' && gstinPattern.test(gstin) && gstin.slice(0, 2) !== code) {
    errors[prefix + '.stateCode'] = 'State must match the GSTIN prefix.';
  }
  if (!String(party?.address || '').trim()) {
    errors[prefix + '.address'] = 'Enter the complete address.';
  }
  if (!String(party?.place || '').trim()) {
    errors[prefix + '.place'] = 'Enter the city or place.';
  }
  if (!/^\d{6}$/.test(String(party?.pincode || ''))) {
    errors[prefix + '.pincode'] = 'Enter a valid 6-digit PIN code.';
  }
};

/** Checks the same essential data as Django's "prepare for API" action.
 * Drafts may still save partially; this runs only for preparation.
 */
export const validateEWayForPreparation = (doc) => {
  const errors = {};
  if (!doc?.documentNo?.trim()) errors.documentNo = 'Invoice / Challan number is required.';
  else if (!/^[A-Za-z0-9/-]+$/.test(doc.documentNo)) {
    errors.documentNo = 'Use only letters, numbers, / or -.';
  }
  if (!doc?.documentDate || Number.isNaN(Date.parse(doc.documentDate))) {
    errors.documentDate = 'Select a valid document date.';
  } else if (doc.documentDate > new Date().toLocaleDateString('en-CA')) {
    errors.documentDate = 'Document date cannot be in the future.';
  }
  validParty(doc?.from, 'from', errors);
  validParty(doc?.to, 'to', errors);
  if (!Array.isArray(doc?.items) || doc.items.length === 0 || doc.items.length > 75) {
    errors.items = 'Add 1–75 transported goods lines.';
  } else {
    doc.items.forEach((item, index) => {
      const key = 'items.' + index;
      if (!String(item.productName || '').trim()) errors[key + '.productName'] = 'Enter the goods name.';
      if (!/^\d{2,8}$/.test(String(item.hsnCode || ''))) errors[key + '.hsnCode'] = 'Enter a valid goods HSN code (2–8 digits).';
      if (!(Number(item.qty) > 0)) errors[key + '.qty'] = 'Quantity must be greater than zero.';
      if (!item.unit) errors[key + '.unit'] = 'Select a unit.';
      if (item.taxableValue === '' || !Number.isFinite(Number(item.taxableValue)) || Number(item.taxableValue) < 0) {
        errors[key + '.taxableValue'] = 'Enter a valid nonnegative taxable value.';
      }
      if (eWayTotalGstRate(item) > 0 && eWayTaxMode(doc) === 'unknown') {
        if (!errors['from.stateCode'] && !errors['to.stateCode']) {
          errors['to.stateCode'] = 'Select both valid states before calculating GST.';
        }
      }
    });
  }
  const transport = doc?.transport || {};
  if (!/^\d+$/.test(String(transport.distanceKm || '')) ||
    Number(transport.distanceKm) <= 0 || Number(transport.distanceKm) > 99999) {
    errors['transport.distanceKm'] = 'Enter distance between 1 and 99,999 km.';
  }
  if (transport.mode === 'Road' && !String(transport.vehicleNo || '').trim() &&
    !String(transport.transporterId || '').trim()) {
    errors['transport.vehicleNo'] = 'Enter vehicle number or transporter ID.';
  }
  if (['Rail', 'Air', 'Ship'].includes(transport.mode) && !String(transport.transportDocNo || '').trim()) {
    errors['transport.transportDocNo'] = 'Enter the transport document number.';
  }
  return errors;
};

/** DRF can return individual field errors or a nested document error. */
export const parseEWayApiErrors = (error) => {
  const fieldErrors = {};
  const data = error?.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      const message = Array.isArray(value) ? value.map(String).join(' ') : String(value || '');
      if (!message) continue;
      if (key === 'from' || key === 'to') {
        const field = /gstin|registration/i.test(message) ? 'gstin'
          : /pin/i.test(message) ? 'pincode'
            : /state/i.test(message) ? 'stateCode'
              : /address/i.test(message) ? 'address' : 'tradeName';
        fieldErrors[key + '.' + field] = message;
      } else if (key === 'items') {
        fieldErrors['items.0.hsnCode'] = message;
      } else if (key === 'transport') {
        fieldErrors['transport.vehicleNo'] = message;
      } else {
        fieldErrors[key] = message;
      }
    }
  }
  return { fieldErrors, message: error?.message || 'Unable to save E-Way Bill.' };
};
