// Shared pure estimate line validation; frontend rules match the Django quick
// estimate API (1–75 lines, positive quantity, nonnegative unit price).
const decimal = /^(?:\d+|\d*\.\d{1,2})$/;

const validAmount = (input, { min, max }) => {
  const text = String(input ?? '').trim();
  const number = Number(text);
  return text.length > 0 && decimal.test(text) &&
    Number.isFinite(number) && number >= min && number <= max;
};

export const estimateLineErrors = (line = {}) => {
  const errors = {};
  const label = String(line.description ?? '').trim();
  if (!label) errors.description = 'Enter a work description or part name.';
  else if (label.length > 250) errors.description = 'Description must be 250 characters or fewer.';

  if (!validAmount(line.quantity, { min: 0.01, max: 10000 })) {
    errors.quantity = 'Enter quantity greater than 0, up to 10,000 (max 2 decimals).';
  }
  if (!validAmount(line.unitPrice, { min: 0, max: 10000000 })) {
    errors.unitPrice = 'Enter a valid unit price from ₹0 to ₹1,00,00,000 (max 2 decimals).';
  }
  return errors;
};

export const estimateFormValidation = (lines = [], discount, taxPercent) => {
  if (!lines.length) return 'Add at least one Work or Spare Part item before saving.';
  if (lines.length > 75) return 'Maximum 75 items per estimate.';

  for (let i = 0; i < lines.length; i += 1) {
    const errors = estimateLineErrors(lines[i]);
    const first = Object.values(errors)[0];
    if (first) {
      const row = lines[i];
      const part = row.type === 'Part';
      const number = lines.slice(0, i + 1).filter((item) => (item.type === 'Part') === part).length;
      return (part ? 'Spare Part ' : 'Work / Service ') + number + ': ' + first;
    }
  }

  const subtotal = lines.reduce((sum, line) => sum +
    Number(line.quantity) * Number(line.unitPrice), 0);
  if (!validAmount(taxPercent, { min: 0, max: 100 })) {
    return 'Enter tax between 0% and 100% (max 2 decimals).';
  }
  if (!validAmount(discount, { min: 0, max: subtotal })) {
    return 'Discount must be between ₹0 and the subtotal (max 2 decimals).';
  }
  return '';
};
