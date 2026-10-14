/**
 * Only construct contact links from valid phone numbers.
 * Workshop default: a 10-digit mobile number without country code is Indian (+91).
 * Never construct a wa.me link from untrusted non-numeric text.
 */
export const cleanPhone = (raw) => {
  if (raw === null || raw === undefined) return '';
  const rawText = String(raw).trim();
  const cleaned = rawText.replace(/[\s().-]/g, '');
  if (!/^\+?\d{7,15}$/.test(cleaned)) return '';
  return cleaned;
};

export const customerContactLinks = (job = {}) => {
  const telephone = cleanPhone(job.customerPhone || job.customer_phone);
  const whatsappRaw = cleanPhone(job.customerWhatsapp || job.customer_whatsapp) || telephone;
  let whatsapp = whatsappRaw.replace(/^\+/, '');

  if (/^0\d{10}$/.test(whatsapp)) whatsapp = '91' + whatsapp.slice(1);
  else if (/^\d{10}$/.test(whatsapp)) whatsapp = '91' + whatsapp;

  // WhatsApp phone numbers require an international number with country code.
  const validWhatsApp = /^\d{11,15}$/.test(whatsapp);
  return {
    callUrl: telephone ? 'tel:' + telephone : null,
    whatsappUrl: validWhatsApp ? 'https://wa.me/' + whatsapp : null,
  };
};
