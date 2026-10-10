import { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';
import { serviceService } from '../../services/service.service';
import { stockService } from '../../services/stock.service';

const rowsOf = (value) => Array.isArray(value) ? value : Array.isArray(value?.results) ? value.results : [];
const isEnabled = (row) => row.is_active !== false &&
  !['inactive', 'archived', 'disabled'].includes(String(row.status || '').toLowerCase());
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

const displayName = (row, kind) =>
  kind === 'part' ? row.partName || row.name || '' : row.name || '';
const priceOf = (row, kind) => Number(
  kind === 'part' ? row.sellingPrice ?? row.price ?? row.selling_price ?? 0
    : row.price ?? row.defaultPrice ?? 0
);

export function EstimateCatalogPicker({ kind, value, disabled, onChange, onSelect }) {
  const id = useId();
  const [opened, setOpened] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(-1);
  const isPart = kind === 'part';

  useEffect(() => {
    if (!opened || disabled) return;
    let alive = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setFailed(false);
      try {
        const data = isPart
          ? await stockService.getStockItems({ search: value.trim() })
          : await serviceService.getServices({ search: value.trim() });
        if (alive) {
          const q = value.trim().toLowerCase();
          const found = rowsOf(data).filter(isEnabled).filter((row) =>
            !q || [
              displayName(row, kind), row.code, row.sku, row.barcode, row.brand, row.description
            ].some((text) => String(text || '').toLowerCase().includes(q))
          );
          setResults(found.slice(0, 12));
          setActive(-1);
        }
      } catch {
        if (alive) {
          setFailed(true);
          setResults([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }, 220);
    return () => { alive = false; clearTimeout(timer); };
  }, [value, opened, disabled, isPart, kind]);

  const choose = (row) => {
    const name = displayName(row, kind);
    onSelect({
      description: name,
      unitPrice: String(priceOf(row, kind)),
      type: isPart ? 'Part' : 'Labour',
      catalogId: row.id,
      catalogCode: isPart ? row.sku || row.barcode || '' : row.code || ''
    });
    setOpened(false);
    setActive(-1);
  };

  const keyDown = (event) => {
    if (event.key === 'Escape') {
      setOpened(false);
      setActive(-1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpened(true);
      setActive((idx) => Math.min(idx + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((idx) => Math.max(idx - 1, 0));
    } else if (event.key === 'Enter' && opened && active >= 0 && results[active]) {
      event.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <div className="job-quick-catalog">
      <div className="job-quick-catalog-field">
        <Search size={15} aria-hidden="true" />
        <input
          type="text"
          role="combobox"
          aria-label={isPart ? 'Search and select a spare part' : 'Search and select a work service'}
          aria-autocomplete="list"
          aria-expanded={opened}
          aria-controls={id}
          aria-activedescendant={opened && active >= 0 ? id + '-option-' + active : undefined}
          autoComplete="off"
          disabled={disabled}
          value={value}
          placeholder={isPart ? 'Search part name / SKU or type manually' : 'Search work / service or type manually'}
          onFocus={() => setOpened(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpened(true);
          }}
          onKeyDown={keyDown}
          onBlur={(e) => {
            if (!e.currentTarget.parentElement?.parentElement?.contains(e.relatedTarget)) {
              setOpened(false);
            }
          }}
        />
      </div>
      {opened && !disabled && (
        <div id={id} className="job-quick-catalog-options" role="listbox" aria-label={isPart ? 'Available spare parts' : 'Available services'}>
          {loading ? <p role="status">Searching {isPart ? 'parts' : 'services'}…</p>
            : failed ? <p role="status">Catalog unavailable. You can still type a custom item.</p>
              : results.length ? results.map((row, index) => {
                const quantity = Number(row.available ?? row.onHand ?? row.on_hand ?? 0);
                const name = displayName(row, kind);
                return (
                  <button
                    key={row.id || index}
                    id={id + '-option-' + index}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    className={index === active ? 'is-highlighted' : ''}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(row)}
                    onMouseEnter={() => setActive(index)}
                  >
                    <span>
                      <strong>{name}</strong>
                      <small>
                        {[isPart ? row.sku || row.barcode : row.code || row.categoryName,
                          isPart ? (quantity > 0 ? quantity + ' available' : 'Out of stock · quote only') : 'Service'
                        ].filter(Boolean).join(' · ')}
                      </small>
                    </span>
                    <b>{money.format(priceOf(row, kind))}</b>
                  </button>
                );
              }) : <p>No matches. Enter a custom {isPart ? 'part' : 'work description'} above.</p>}
        </div>
      )}
    </div>
  );
}

export default EstimateCatalogPicker;
