const NON_TEXT_TYPES = new Set([
  'button', 'checkbox', 'color', 'date', 'datetime-local', 'file', 'hidden',
  'image', 'month', 'radio', 'range', 'reset', 'submit', 'time', 'week',
]);

const readable = (value) => String(value || '')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/[_-]+/g, ' ')
  .replace(/\*/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/** Create a useful example for text-like fields whose label is already visible. */
export function defaultFormPlaceholder({ type = 'text', kind = 'input', label = '', ariaLabel = '', name = '', id = '' } = {}) {
  const inputType = String(type || 'text').toLowerCase();
  if (NON_TEXT_TYPES.has(inputType)) return '';

  const fieldLabel = readable(label || ariaLabel || name || id);
  const lower = fieldLabel.toLowerCase();
  if (inputType === 'email' || /\bemail\b/.test(lower)) return 'name@example.com';
  if (inputType === 'tel' || /phone|mobile|whatsapp/.test(lower)) return '+91 98765 43210';
  if (/gstin|\bgst\b/.test(lower)) return 'GSTIN / URP';
  if (/pin code|pincode|postal code/.test(lower)) return 'e.g. 682031';
  if (/registration number|vehicle number|reg no/.test(lower)) return 'e.g. KL 10 AB 1234';
  if (/quantity|\bqty\b/.test(lower)) return 'e.g. 1';
  if (/amount|price|rate|cost|discount|tax/.test(lower) || inputType === 'number') return 'e.g. 0.00';
  if (inputType === 'search' || /^search\b/.test(lower)) {
    const subject = fieldLabel.replace(/^search\s*/i, '').trim();
    return subject ? `Search ${subject.toLowerCase()}` : 'Search';
  }
  if (!fieldLabel) return '';
  return `${kind === 'textarea' ? 'Write' : 'Enter'} ${fieldLabel.charAt(0).toLowerCase()}${fieldLabel.slice(1)}`;
}

const fieldLabel = (field) => {
  if (field.getAttribute('aria-label')) return field.getAttribute('aria-label');
  const label = field.labels?.[0];
  if (label) {
    const copy = label.cloneNode(true);
    copy.querySelectorAll('input, select, textarea, button, svg, [role="alert"], [aria-hidden="true"]').forEach((node) => node.remove());
    return copy.textContent || '';
  }
  return field.name || field.id || '';
};

/** Fill omitted hints in form controls while keeping authored placeholders intact. */
export function addDefaultFormPlaceholders(root = document) {
  const fields = [];
  if (root instanceof Element) {
    if (root.matches('input, textarea') && root.closest('form')) fields.push(root);
    fields.push(...[...root.querySelectorAll('input, textarea')].filter((field) => field.closest('form')));
  }

  for (const field of new Set(fields)) {
    if (field.hasAttribute('placeholder') || field.disabled || field.type === 'file') continue;
    if (field.closest('[data-placeholder-ignore]')) continue;
    const placeholder = defaultFormPlaceholder({
      type: field.type,
      kind: field.tagName === 'TEXTAREA' ? 'textarea' : 'input',
      label: fieldLabel(field),
    });
    if (placeholder) field.setAttribute('placeholder', placeholder);
  }
}
