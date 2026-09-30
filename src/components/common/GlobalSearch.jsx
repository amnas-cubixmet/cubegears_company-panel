import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { searchWorkspace } from '../../services/globalSearch.service';
import {
  Search,
  X,
  Users,
  Car,
  Calendar,
  ClipboardList,
  FileText,
  DollarSign,
  Package,
  Wrench,
  UserCheck,
  Truck,
  Clock
} from 'lucide-react';

const RECENT_SEARCHES_KEY = 'cubegears_recent_searches';

export const GlobalSearch = ({ isMobileView = false, onMobileClose = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load Recent Searches on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  // Save Recent Search item
  const saveRecentSearch = (item) => {
    try {
      const newRecent = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecent));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Keyboard Shortcuts (Ctrl+K / Cmd+K & Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
        if (isMobileView && onMobileClose) onMobileClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileView, onMobileClose]);

  // Click Outside Listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Handler (250ms)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim() || val.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchWorkspace(val);
        setResults(res);
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  // Keyboard Navigation Handling (ArrowUp, ArrowDown, Enter)
  const handleKeyDownInput = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelectResult(results[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (item) => {
    saveRecentSearch(item);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    if (isMobileView && onMobileClose) onMobileClose();
    const destination = item.path || item.route;
    if (destination) navigate(destination);
  };

  const getModuleIcon = (group) => {
    switch (group?.toLowerCase()) {
      case 'customers': return <Users size={16} className="text-muted" />;
      case 'vehicles': return <Car size={16} className="text-muted" />;
      case 'jobs': return <ClipboardList size={16} className="text-muted" />;
      case 'invoices': return <FileText size={16} className="text-muted" />;
      case 'stock': return <Package size={16} className="text-muted" />;
      case 'services': return <Wrench size={16} className="text-muted" />;
      case 'employees': return <UserCheck size={16} className="text-muted" />;
      default: return <Search size={16} className="text-muted" />;
    }
  };

  // Grouping results by module
  const groupedResults = results.reduce((acc, current) => {
    const groupName = current.group || current.type || 'Other';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(current);
    return acc;
  }, {});

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[620px] max-md:max-w-none" ref={containerRef}>
      <div className="flex h-10 w-full min-w-0 items-center overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 max-md:h-11">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] font-medium text-content outline-none placeholder:font-normal placeholder:text-muted" placeholder="Search customer, vehicle, job, invoice, stock..."
        />

        {query ? (
          <button
            type="button"
            className="mr-1 grid size-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-surface-2 hover:text-content"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        ) : (
          <button
            type="button"
            className="mr-1 grid size-8 shrink-0 place-items-center rounded-lg border-0 bg-transparent text-muted transition hover:bg-surface-2 hover:text-primary"
            onClick={() => {
              if (query.trim()) setIsOpen(true);
              else inputRef.current?.focus();
            }}
            aria-label="Search"
          >
            <Search size={17} />
          </button>
        )}
      </div>

      {/* Floating Results Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] max-h-[min(460px,70dvh)] w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-surface shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading && (
            <div className="flex flex-col gap-2.5 p-4">
              {[1, 2, 3].map((i) => (
                <div key={`skel-${i}`} className="flex items-center gap-2.5">
                  <div className="size-8 shrink-0 rounded-lg bg-surface-3 opacity-60" />
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="h-3 w-2/5 rounded bg-surface-3 opacity-60" />
                    <div className="h-2.5 w-3/5 rounded bg-surface-3 opacity-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="px-4 py-6 text-center text-muted">
              <p className="mb-1 text-sm font-semibold text-content">
                No matching records found
              </p>
              <p className="m-0 text-xs">
                Try searching customer, phone, vehicle registration or job number.
              </p>
            </div>
          )}

          {!loading && query.trim().length < 2 && recentSearches.length > 0 && (
            <div className="py-1">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="border-0 bg-transparent text-[11px] font-semibold text-primary"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((item) => (
                <div
                  key={`recent-${item.id}`}
                  className="flex min-h-[52px] w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-surface-2 max-md:min-h-[58px] max-md:py-3"
                  onClick={() => handleSelectResult(item)}
                >
                  <Clock size={16} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-content">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">{item.type}</span>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-1">
              {Object.keys(groupedResults).map((group) => (
                <div key={`group-${group}`} className="mb-2">
                  <div className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                    {group} ({groupedResults[group].length})
                  </div>
                  {groupedResults[group].map((item) => {
                    const globalIdx = results.findIndex(r => r.id === item.id);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        className={`flex min-h-[52px] w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition max-md:min-h-[58px] max-md:py-3 ${isSelected ? 'bg-surface-2' : 'hover:bg-surface-2'}`}
                        onClick={() => handleSelectResult(item)}
                      >
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2">
                          {getModuleIcon(group)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-content">
                            {item.title}
                          </div>
                          <div className="truncate text-[11px] text-muted">
                            {item.subtitle}
                          </div>
                        </div>
                        {item.status && (
                          <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-content">
                            {item.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
