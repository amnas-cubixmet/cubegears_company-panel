import React from 'react';
export const FormSection = ({ title, description, children, className = '', style }) => <section className={`form-section ${className}`.trim()} style={style}>
  {(title || description) && <header className="form-section-header">{title && <h2 className="form-section-title">{title}</h2>}{description && <p className="form-section-desc">{description}</p>}</header>}
  <div className="form-grid-2">{children}</div>
</section>;
