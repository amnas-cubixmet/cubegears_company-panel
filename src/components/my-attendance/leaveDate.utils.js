/** Date input values must use the local calendar day, never UTC conversion.
 * Midnight in India and other positive-offset timezones must not shift date.
 */
export const todayForLeaveDate = (now = new Date()) => [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-');
