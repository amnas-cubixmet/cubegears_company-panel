// Keep the Stock Overview compatible with both live Django API rows
// and the existing optional demo ledger, without inventing balances.
const labels = {
  purchase: 'Stock In',
  opening: 'Opening Stock',
  job_issue: 'Job Card Issue',
  sale: 'Internal Use',
  return: 'Stock Return',
  adjustment: 'Adjustment',
  transfer_in: 'Transfer In',
  transfer_out: 'Transfer Out',
};

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export const availableStock = (item) => {
  const explicit = numberOrNull(item?.available);
  if (explicit !== null) return explicit;
  return (numberOrNull(item?.onHand) ?? 0) - (numberOrNull(item?.reserved) ?? 0);
};

export const stockHealthGroups = (items = []) => {
  const lowItems = [];
  const outItems = [];
  let healthyItems = 0;

  for (const item of items) {
    const available = availableStock(item);
    if (available <= 0) outItems.push(item);
    else if (available <= (numberOrNull(item.minimumStock) ?? 0)) lowItems.push(item);
    else healthyItems += 1;
  }

  const healthPercentage = items.length
    ? Math.round((healthyItems / items.length) * 100)
    : null;

  return { lowItems, outItems, healthyItems, healthPercentage };
};

export const normalizeStockMovement = (movement = {}) => {
  const rawType = String(movement.type ?? movement.movement_type ?? '').trim();
  const typeKey = rawType.toLowerCase().replace(/\s+/g, '_');
  const absoluteIn = numberOrNull(movement.qtyIn);
  const absoluteOut = numberOrNull(movement.qtyOut);
  const signed = numberOrNull(movement.quantity);

  let quantity = signed;
  if (quantity === null) {
    if (absoluteIn !== null && absoluteIn > 0) quantity = absoluteIn;
    else if (absoluteOut !== null && absoluteOut > 0) quantity = -absoluteOut;
    else {
      const qty = numberOrNull(movement.qty);
      if (qty !== null) {
        const outgoing = ['job_issue', 'job_issue', 'stock_out', 'sale', 'transfer_out', 'internal_use'].includes(typeKey);
        quantity = outgoing ? -Math.abs(qty) : qty;
      }
    }
  }

  const dateValue = movement.created_at ?? movement.createdAt ?? movement.date ?? null;
  let dateLabel = '—';
  if (dateValue) {
    const parsed = new Date(dateValue);
    dateLabel = Number.isNaN(parsed.valueOf())
      ? String(dateValue)
      : new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
  }

  return {
    id: movement.id,
    label: labels[typeKey] || (rawType ? rawType.replace(/_/g, ' ') : 'Stock Movement'),
    typeKey,
    partName: movement.partName || movement.itemName || movement.item?.name || 'Unknown part',
    reference: movement.jobRef || movement.reference || '—',
    quantity,
    dateLabel,
  };
};
