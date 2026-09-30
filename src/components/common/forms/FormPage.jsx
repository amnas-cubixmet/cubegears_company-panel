import React from 'react';

export const FormPage = ({ title, description, children, className = '', style = {} }) => {
  return (
    <div className={`form-page-container ${className}`} style={style}>
      {title && (
        <div className="form-header">
          <h1 className="form-header-title">{title}</h1>
          {description && <p className="form-header-desc">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
