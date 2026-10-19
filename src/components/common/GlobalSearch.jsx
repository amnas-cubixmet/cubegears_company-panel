import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { searchWorkspace } from '../../services/globalSearch.service';
import { getPermissionForPath } from '../../utils/permissions';
import { useFeatureAccess } from '../../context/FeatureAccessContext';
import { useAuth } from '../../hooks/useAuth';
import {
  Search,
  X,
  Users,
  Car,
  ClipboardList,
  FileText,
  Package,
  Wrench,
  UserCheck,
  Clock,
  CreditCard,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  LayoutDashboard
} from 'lucide-react';
import '../../styles/global-search.css';

const RECENT_SEARCHES_PREFIX = 'cubegears_recent_searches';

export const GlobalSearch = ({ isMobileView = false, onMobileClose = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { can, enforced } = useFeatureAccess();
  const recentKey = `${RECENT_SEARCHES_PREFIX}:${user?.companyId || user?.company?.id || 'unknown'}:${user?.id || 'unknown'}`;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentState, setRecentState] = useState({ key: '', items: [] });
  const recentSearches = recentState.key === recentKey ? recentState.items : [];
  // Search results and browser history must obey the same access check as routes.
  const isVisibleResult = (item) => {
    const path = item?.path || item?.route;
    if (typeof path !== 'string' || !path.startsWith('/')) return false;
    const permission = getPermissionForPath(path.split('?')[0].split('#')[0]);
    return permission ? can(permission) : !enforced;
  };
  const visibleResults = results.filter(isVisibleResult);
  const visibleRecentSearches = recentSearches.filter(isVisibleResult);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(recentKey);
      const items = saved ? JSON.parse(saved) : [];
      setRecentState({ key: recentKey, items: Array.isArray(items) ? items : [] });
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, [recentKey]);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (item) => {
    try {
      const next = [item, ...recentSearches.filter((r) => r.id !== item.id)].slice(0, 5);
      setRecentState({ key: recentKey, items: next });
      localStorage.setItem(recentKey, JSON.stringify(next));
    } catch (e) {
      console.error('Failed to save recent search', e);
    }
  };

  const clearRecentSearches = () => {
    setRecentState({ key: recentKey, items: [] });
    localStorage.removeItem(recentKey);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim() || value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setIsOpen(true);
      return;
    }

    setLoading(true);
    setIsOpen(true);
    debounceRef.current = setTimeout(async () => {
      try {
        setResults(await searchWorkspace(value));
      } catch (error) {
        console.error('Global search error:', error);
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  const handleSelectResult = (item) => {
    if (!isVisibleResult(item)) return;
    saveRecentSearch(item);
    setIsOpen(false);
    setQuery('');
    setResults([]);
    if (isMobileView && onMobileClose) onMobileClose();
    const destination = item.path || item.route;
    if (destination) navigate(destination);
  };

  const handleKeyDownInput = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, visibleResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < visibleResults.length) {
      e.preventDefault();
      handleSelectResult(visibleResults[selectedIndex]);
    }
  };

  const getModuleIcon = (group) => {
    switch (group?.toLowerCase()) {
      case 'customers': return <Users size={15} />;
      case 'vehicles': return <Car size={15} />;
      case 'jobs': return <ClipboardList size={15} />;
      case 'invoices': return <FileText size={15} />;
      case 'stock': return <Package size={15} />;
      case 'services': return <Wrench size={15} />;
      case 'employees': return <UserCheck size={15} />;
      case 'payments': return <CreditCard size={15} />;
      case 'expenses': return <Receipt size={15} />;
      case 'reports': return <BarChart3 size={15} />;
      case 'notifications': return <Bell size={15} />;
      case 'pages': return <LayoutDashboard size={15} />;
      case 'settings': return <Settings size={15} />;
      default: return <Search size={15} />;
    }
  };

  const groupedResults = visibleResults.reduce((acc, current) => {
    const groupName = current.group || current.type || 'Other';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(current);
    return acc;
  }, {});

  return (
    <div className={`global-search ${isMobileView ? 'is-mobile' : ''}`} ref={containerRef}>
      <div className="global-search-field">
        <Search size={15} className="global-search-leading-icon" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDownInput}
          placeholder="Search customers, vehicles, jobs..."
          aria-label="Search the CubixGear workspace"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            className="global-search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="global-search-results">
          {loading && (
            <div className="global-search-loading">
              {[1, 2, 3].map((i) => <div key={i} className="global-search-skeleton" />)}
            </div>
          )}

          {!loading && query.trim().length >= 2 && visibleResults.length === 0 && (
            <div className="global-search-empty">
              <strong>No matching records found</strong>
              <span>Try a page, customer, phone, vehicle, job, invoice, payment, expense or stock item.</span>
            </div>
          )}

          {!loading && query.trim().length < 2 && visibleRecentSearches.length > 0 && (
            <div className="global-search-group">
              <div className="global-search-group-head">
                <span>Recent Searches</span>
                <button type="button" onClick={clearRecentSearches}>Clear</button>
              </div>
              {visibleRecentSearches.map((item) => (
                <button key={item.id} type="button" className="global-search-result-row" onClick={() => handleSelectResult(item)}>
                  <span className="global-search-result-icon"><Clock size={14} /></span>
                  <span className="global-search-result-copy">
                    <strong>{item.title}</strong>
                    <small>{item.type}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && visibleResults.length > 0 && Object.keys(groupedResults).map((group) => (
            <div className="global-search-group" key={group}>
              <div className="global-search-group-title">{group} ({groupedResults[group].length})</div>
              {groupedResults[group].map((item) => {
                const globalIdx = visibleResults.findIndex((r) => r.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`global-search-result-row ${globalIdx === selectedIndex ? 'is-selected' : ''}`}
                    onClick={() => handleSelectResult(item)}
                  >
                    <span className="global-search-result-icon">{getModuleIcon(group)}</span>
                    <span className="global-search-result-copy">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    {item.status && <span className="global-search-result-status">{item.status}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
