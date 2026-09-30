import React from 'react';

export const StickyFormFooter = ({
  statusText = 'Unsaved changes',
  onCancel,
  cancelLabel = 'Cancel',
  saveLabel = 'Save Changes',
  isSubmitting = false,
  className = ''
}) => {
  return (
    <div className={`sticky-form-footer ${className}`}>
      <div className="sticky-footer-content">
        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>
          {statusText}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{
                height: '42px',
                padding: '0 18px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '42px',
              padding: '0 22px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {isSubmitting ? 'Saving...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
