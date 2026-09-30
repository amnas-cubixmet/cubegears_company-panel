import React from 'react';

export const Tooltip = ({ content, children, className = '' }) => <span className={`ui-tooltip ${className}`.trim()} tabIndex={0}>{children}<span className="ui-tooltip__content" role="tooltip">{content}</span></span>;
