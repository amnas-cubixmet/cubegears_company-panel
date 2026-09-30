export const STORAGE_PRICE_PER_GB_DAY = 2;

export function storageDayCharge(usedGb) {
  return Number((Number(usedGb || 0) * STORAGE_PRICE_PER_GB_DAY).toFixed(2));
}
