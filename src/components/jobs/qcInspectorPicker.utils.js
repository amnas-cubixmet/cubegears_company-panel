/**
 * QC Inspector picker reads the existing company-scoped staff directory.
 * New inspectors are regular staff profiles, never local-only demo options.
 */
export const eligibleQcInspectors = (staff = []) => (Array.isArray(staff) ? staff : [])
  .filter((person) => person && person.id &&
    String(person.employmentStatus || person.status || 'Active').toLowerCase() === 'active' &&
    String(person.name || '').trim())
  .map((person) => ({
    id: String(person.id),
    name: String(person.name).trim(),
    subtitle: [person.designation || person.role, person.displayEmployeeNo || person.employeeId]
      .filter(Boolean).join(' · '),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const searchQcInspectors = (staff = [], query = '', limit = 15) => {
  const phrase = String(query ?? '').trim().toLocaleLowerCase();
  return eligibleQcInspectors(staff)
    .filter((person) => !phrase || (person.name + ' ' + person.subtitle).toLocaleLowerCase().includes(phrase))
    .slice(0, limit);
};

export const qcInspectorDuplicate = (staff = [], input = '') => {
  const name = String(input || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return name
    ? eligibleQcInspectors(staff).find((person) =>
      person.name.replace(/\s+/g, ' ').toLocaleLowerCase() === name) || null
    : null;
};

export const validateNewQcInspector = (name = '', phone = '') => {
  const errors = {};
  const cleanedName = String(name ?? '').trim();
  const cleanedPhone = String(phone ?? '').trim();
  if (!cleanedName) errors.name = 'Enter inspector name.';
  else if (cleanedName.length > 120) errors.name = 'Inspector name must be 120 characters or fewer.';
  if (cleanedPhone && !/^[+\d().\s-]{7,30}$/.test(cleanedPhone)) {
    errors.phone = 'Enter a valid phone number or leave it blank.';
  }
  return errors;
};
