import { useEffect } from 'react';
import { clearFieldValidation, focusField, setFieldValidation } from '../../utils/formValidation';

/**
 * Capture native constraint errors across the company panel, including
 * modal/portal forms. Browser invalid events do not bubble, so use capture.
 * The first invalid input is focused after all fields have been annotated.
 */
export function GlobalFormValidation() {
  useEffect(() => {
    let firstInvalid = null;
    let animationFrame = null;

    const onInvalid = (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement
        || field instanceof HTMLSelectElement
        || field instanceof HTMLTextAreaElement)) return;
      if (field.disabled || field.closest('[data-disable-global-validation]')) return;

      // Replace the browser popover with an accessible inline error.
      event.preventDefault();
      setFieldValidation(field, field.validationMessage || 'Check this field.', false);
      if (!firstInvalid) firstInvalid = field;
      if (animationFrame !== null) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        const target = firstInvalid;
        firstInvalid = null;
        if (target?.isConnected) focusField(target);
      });
    };

    const onEdit = (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement
        || field instanceof HTMLSelectElement
        || field instanceof HTMLTextAreaElement)) return;
      if (field.dataset.cgErrorActive !== 'true') return;
      if (field.validity.valid) clearFieldValidation(field);
      else setFieldValidation(field, field.validationMessage || 'Check this field.', false);
    };

    document.addEventListener('invalid', onInvalid, true);
    document.addEventListener('input', onEdit, true);
    document.addEventListener('change', onEdit, true);

    return () => {
      document.removeEventListener('invalid', onInvalid, true);
      document.removeEventListener('input', onEdit, true);
      document.removeEventListener('change', onEdit, true);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return null;
}
