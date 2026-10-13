// Indian GST estimate preview: server uses Decimal and is authoritative.
// 18% is a common automotive repair / auto-part rate, NOT a rule for every item.
export const INDIA_STATES = [
  ['01', 'Jammu and Kashmir'], ['02', 'Himachal Pradesh'], ['03', 'Punjab'],
  ['04', 'Chandigarh'], ['05', 'Uttarakhand'], ['06', 'Haryana'],
  ['07', 'Delhi'], ['08', 'Rajasthan'], ['09', 'Uttar Pradesh'],
  ['10', 'Bihar'], ['11', 'Sikkim'], ['12', 'Arunachal Pradesh'],
  ['13', 'Nagaland'], ['14', 'Manipur'], ['15', 'Mizoram'], ['16', 'Tripura'],
  ['17', 'Meghalaya'], ['18', 'Assam'], ['19', 'West Bengal'],
  ['20', 'Jharkhand'], ['21', 'Odisha'], ['22', 'Chhattisgarh'],
  ['23', 'Madhya Pradesh'], ['24', 'Gujarat'],
  ['26', 'Dadra and Nagar Haveli and Daman and Diu'],
  ['27', 'Maharashtra'], ['29', 'Karnataka'], ['30', 'Goa'],
  ['31', 'Lakshadweep'], ['32', 'Kerala'], ['33', 'Tamil Nadu'],
  ['34', 'Puducherry'], ['35', 'Andaman and Nicobar Islands'],
  ['36', 'Telangana'], ['37', 'Andhra Pradesh'], ['38', 'Ladakh'],
];

export const indiaTaxMode = (registered, supplierState, placeOfSupply) =>
  !registered ? 'none' : !supplierState || !placeOfSupply ? 'unknown'
    : supplierState === placeOfSupply ? 'cgst_sgst' : 'igst';

export const calculateEstimateIndiaGst = ({ lines = [], discount = 0, registered = false,
  supplierState = '', placeOfSupply = '' }) => {
  const mode = indiaTaxMode(registered, supplierState, placeOfSupply);
  const work = lines.filter((line) => line.type !== 'Part').reduce((sum, row) =>
    sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0);
  const parts = lines.filter((line) => line.type === 'Part').reduce((sum, row) =>
    sum + Number(row.quantity || 0) * Number(row.unitPrice || 0), 0);
  const toPaise = (n) => Math.round((Number(n) || 0) * 100 + Number.EPSILON);
  const subtotal = lines.reduce((sum, row) => sum + toPaise(
    Number(row.quantity || 0) * Number(row.unitPrice || 0)), 0);
  const rebate = toPaise(discount);
  const taxable = Math.max(0, subtotal - rebate);
  const weights = lines.map(row => toPaise(Number(row.quantity || 0) * Number(row.unitPrice || 0)));
  let allocated = 0;
  let cumulativeGross = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  const taxRows = lines.map((row, i) => {
    const gross = weights[i];
    cumulativeGross += gross;
    const target = subtotal ?
      Math.round(Math.min(rebate, subtotal) * cumulativeGross / subtotal) : 0;
    const allocation = Math.max(0, Math.min(gross, target - allocated));
    allocated += allocation;
    const value = gross - allocation;
    const rate = Number(row.taxRate || 0);
    const central = mode === 'cgst_sgst' ? Math.round(value * rate / 200) : 0;
    const state = central;
    const integrated = mode === 'igst' ? Math.round(value * rate / 100) : 0;
    cgst += central;
    sgst += state;
    igst += integrated;
    return { taxable: value / 100, cgst: central / 100, sgst: state / 100, igst: integrated / 100 };
  });
  return {
    mode, work, parts, subtotal: subtotal / 100, taxable: taxable / 100,
    cgst: cgst / 100, sgst: sgst / 100, igst: igst / 100,
    tax: (cgst + sgst + igst) / 100,
    total: (taxable + cgst + sgst + igst) / 100,
    taxRows,
  };
};
