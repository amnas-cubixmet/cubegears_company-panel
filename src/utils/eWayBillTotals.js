/** Pure E-Way Bill money calculations; no browser API or backend dependency. */
const roundRupees = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export const calculateEWayTotals = (doc) => {
  const goods = Array.isArray(doc?.items) ? doc.items : [];
  const taxableValue = roundRupees(goods.reduce((sum, item) =>
    sum + Number(item.taxableValue || 0), 0));
  const taxFor = (key) => roundRupees(goods.reduce((sum, item) =>
    sum + roundRupees(Number(item.taxableValue || 0) * Number(item[key] || 0) / 100), 0));
  const cgst = taxFor('cgstRate');
  const sgst = taxFor('sgstRate');
  const igst = taxFor('igstRate');
  const cess = taxFor('cessRate');
  const cessNonAdvol = roundRupees(doc?.cessNonAdvolAmount);
  const otherAmount = roundRupees(doc?.otherAmount);
  return {
    taxableValue, cgst, sgst, igst, cess, cessNonAdvol, otherAmount,
    totalValue: roundRupees(taxableValue + cgst + sgst + igst + cess + cessNonAdvol + otherAmount),
  };
};
