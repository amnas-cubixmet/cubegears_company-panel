import React from 'react';

export const Avatar = ({ src, alt = '', name = '', size = 40, className = '' }) => <span className={`ui-avatar ${className}`.trim()} style={{ width: size, height: size, fontSize: Math.max(11, size * .32) }}>{src ? <img src={src} alt={alt || name} /> : (name || '?').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>;
