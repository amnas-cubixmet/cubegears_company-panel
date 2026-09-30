import React from 'react';
import { Button } from '../ui/Button';
export const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) => <div className="ui-pagination"><span>Page {currentPage} of {Math.max(totalPages, 1)}</span><div className="ui-pagination__actions"><Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</Button></div></div>;
