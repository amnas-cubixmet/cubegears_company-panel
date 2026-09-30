import React from 'react';
import { ChevronRight } from 'lucide-react';
export const Breadcrumb = ({ items = [], className = '' }) => <nav className={`ui-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">{items.map((item, index) => <React.Fragment key={item.label}>{index > 0 && <ChevronRight size={13} />}{item.href ? <a href={item.href}>{item.label}</a> : <span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>}</React.Fragment>)}</nav>;
