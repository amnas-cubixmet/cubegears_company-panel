import React, { useMemo, useState } from 'react';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';
import { IconButton } from '../ui/IconButton';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';

export const DataTable = ({ columns = [], data = [], filters = [], pageSize = 5, emptyTitle = 'No matching records', className = '' }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let rows = data.filter((row) => !normalized || Object.values(row).some((value) => String(value).toLowerCase().includes(normalized)));
    if (filter !== 'All') rows = rows.filter((row) => row.status === filter);
    if (sort.key) rows = [...rows].sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, { numeric: true }) * (sort.direction === 'asc' ? 1 : -1));
    return rows;
  }, [data, filter, query, sort]);

  const totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = visibleRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const toggleSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  const toggleRow = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const allChecked = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));

  return <div className={`data-table ${className}`.trim()}>
    <div className="data-table__toolbar">
      <SearchInput value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} onClear={() => { setQuery(''); setPage(1); }} placeholder="Search records..." />
      {filters.length > 0 && <div className="data-table__filter"><Select value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1); }}><option>All</option>{filters.map((item) => <option key={item}>{item}</option>)}</Select></div>}
    </div>
    {pageRows.length === 0 ? <div className="ui-card"><EmptyState title={emptyTitle} description="Change the search or filter and try again." /></div> : <div className="ui-table-wrap"><table className="ui-table"><thead><tr><th><input type="checkbox" checked={allChecked} onChange={() => setSelected(allChecked ? selected.filter((id) => !pageRows.some((row) => row.id === id)) : [...new Set([...selected, ...pageRows.map((row) => row.id)])])} aria-label="Select all visible rows" /></th>{columns.map((column) => <th key={column.key}>{column.sortable === false ? column.label : <button className="ui-table-sort" onClick={() => toggleSort(column.key)}>{column.label}<ArrowUpDown size={12} /></button>}</th>)}<th>Actions</th></tr></thead><tbody>{pageRows.map((row) => <tr key={row.id}><td><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)} aria-label={`Select ${row.name || row.id}`} /></td>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>)}<td><IconButton label="Row actions"><MoreHorizontal size={16} /></IconButton></td></tr>)}</tbody></table></div>}
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
  </div>;
};
