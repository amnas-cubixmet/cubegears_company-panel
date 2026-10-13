/**
 * Download an A4 PDF of the exact saved, approved Job Card estimate.
 * Renders with the browser's native fonts (including Indian-script text and ₹).
 * No npm dependency, external service, or third-party PDF upload is required.
 * Only saved catalogue/customer data is included; never print unsaved draft edits.
 */

const encoder = new TextEncoder();
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const WIDTH = 1240;
const HEIGHT = 1754;
const LEFT = 76;
const RIGHT = WIDTH - LEFT;
const CONTENT_WIDTH = RIGHT - LEFT;
const formatMoney = (amount) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(amount) || 0);

const safeText = (value, fallback = '—') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};
const safeAmount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const isApproved = (estimate) =>
  String(estimate?.status || estimate?.approvalStatus || '').toLowerCase() === 'approved' ||
  String(estimate?.approvalStatus || '').toLowerCase() === 'approved';

export const latestApprovedEstimate = (estimates = []) =>
  [...estimates].reverse().find(isApproved) || null;

export const estimatePdfData = (job, estimate) => {
  if (!job || !estimate || !isApproved(estimate)) {
    throw new Error('Only a saved, approved estimate can be downloaded.');
  }
  const pricing = (estimate.items || []).find((item) => item?._pricing)?._pricing || {};
  const items = (estimate.items || []).filter((item) => item && !item._pricing && item.description)
    .map((item) => ({
      description: safeText(item.description),
      type: item.type === 'Part' ? 'Part' : 'Work',
      quantity: safeAmount(item.quantity),
      unitPrice: safeAmount(item.unitPrice ?? item.price),
    }));
  if (!items.length) throw new Error('The approved estimate does not have any line items.');
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = safeAmount(pricing.discount ?? estimate.discount);
  const taxPercent = safeAmount(pricing.taxPercent ?? estimate.taxPercent);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * taxPercent / 100;
  const total = taxable + tax;
  const approvedDate = estimate.approved_at || estimate.approvedAt || '';
  const jobLabel = job.jobNumber || job.jobNo || job.number || '';
  const approvedBy = estimate.approvedBy || estimate.approved_by || '';
  const customer = job.customer || {};
  const vehicle = job.vehicle || {};
  return {
    workshop: safeText(job.companyName || job.company?.name || job.branchName || '', 'Workshop Estimate'),
    jobNumber: safeText(jobLabel),
    version: safeText(estimate.version, '1').replace(/^Estimate V/i, ''),
    customerName: safeText(job.customerName || customer.name),
    customerPhone: safeText(job.customerPhone || customer.phone),
    vehicleRegistration: safeText(job.vehicleReg || vehicle.registration),
    vehicleDescription: safeText(job.vehicleInfo || vehicle.name || [vehicle.make, vehicle.model].filter(Boolean).join(' ')),
    approvedDate: approvedDate ? new Date(approvedDate).toLocaleString('en-IN') : '—',
    approvedBy: safeText(approvedBy),
    items,
    subtotal,
    discount,
    taxPercent,
    tax,
    total,
  };
};

const bytesOf = (value) => encoder.encode(value);

/** Assemble one or more JPEG pages into a standards-compliant PDF. */
export const pdfBytesFromJpegPages = (pages) => {
  if (!Array.isArray(pages) || !pages.length) throw new Error('No PDF pages to download.');
  const count = pages.length;
  const offsets = [0];
  const chunks = [];
  let byteLength = 0;
  const append = (part) => {
    const buffer = typeof part === 'string' ? bytesOf(part) : part;
    chunks.push(buffer);
    byteLength += buffer.length;
  };
  const object = (id, parts) => {
    offsets[id] = byteLength;
    append(id + ' 0 obj\n');
    parts.forEach(append);
    append('\nendobj\n');
  };

  append(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10, 37, 226, 227, 207, 211, 10]));
  object(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
  const ids = pages.map((_, i) => 3 + i * 3);
  object(2, ['<< /Type /Pages /Kids [', ids.map((id) => id + ' 0 R').join(' '),
    '] /Count ' + count + ' >>']);
  pages.forEach((page, index) => {
    if (!(page.data instanceof Uint8Array) || !page.data.length) {
      throw new Error('Unable to create PDF page image.');
    }
    const pageId = ids[index];
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    const imgName = 'Im' + (index + 1);
    object(pageId, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' +
      A4_WIDTH + ' ' + A4_HEIGHT + '] /Resources << /XObject << /' +
      imgName + ' ' + imageId + ' 0 R >> >> /Contents ' + contentId + ' 0 R >>']);
    const commands = 'q\n' + A4_WIDTH + ' 0 0 ' + A4_HEIGHT +
      ' 0 0 cm\n/' + imgName + ' Do\nQ\n';
    object(contentId, ['<< /Length ' + bytesOf(commands).length + ' >>\nstream\n',
      commands, 'endstream']);
    object(imageId, ['<< /Type /XObject /Subtype /Image /Width ' + page.width +
      ' /Height ' + page.height +
      ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' +
      page.data.length + ' >>\nstream\n', page.data, '\nendstream']);
  });
  const xrefOffset = byteLength;
  const totalObjects = 2 + count * 3;
  append('xref\n0 ' + (totalObjects + 1) + '\n0000000000 65535 f \n');
  for (let i = 1; i <= totalObjects; i += 1) {
    append(String(offsets[i]).padStart(10, '0') + ' 00000 n \n');
  }
  append('trailer\n<< /Size ' + (totalObjects + 1) + ' /Root 1 0 R >>\nstartxref\n' +
    xrefOffset + '\n%%EOF\n');
  const result = new Uint8Array(byteLength);
  let at = 0;
  chunks.forEach((chunk) => { result.set(chunk, at); at += chunk.length; });
  return result;
};

const drawApprovedPages = (data) => {
  const pages = [];
  let ctx;
  let canvas;
  let y = 0;
  const navy = '#182c43';
  const blue = '#2352aa';
  const slate = '#56677d';
  const lineColor = '#e2e8f0';

  const rect = (x, top, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, top, w, h);
  };
  const text = (value, x, top, options = {}) => {
    const { size = 24, bold = false, color = navy, align = 'left' } = options;
    ctx.font = (bold ? '700 ' : '400 ') + size + 'px Arial, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillText(String(value ?? ''), x, top);
  };
  const wrap = (value, maxWidth, size = 24, bold = false) => {
    ctx.font = (bold ? '700 ' : '400 ') + size + 'px Arial, sans-serif';
    const source = String(value || '');
    const words = source.split(/\s+/);
    const result = [];
    let current = '';
    for (const word of words) {
      if (ctx.measureText(word).width > maxWidth) {
        if (current) { result.push(current); current = ''; }
        let chunk = '';
        for (const char of word) {
          if (chunk && ctx.measureText(chunk + char).width > maxWidth) {
            result.push(chunk); chunk = '';
          }
          chunk += char;
        }
        current = chunk;
      } else if (!current || ctx.measureText(current + ' ' + word).width <= maxWidth) {
        current = current ? current + ' ' + word : word;
      } else {
        result.push(current); current = word;
      }
    }
    if (current) result.push(current);
    return result.length ? result : ['—'];
  };

  const makePage = (continued = false) => {
    canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable. Cannot create PDF.');
    rect(0, 0, WIDTH, HEIGHT, '#ffffff');
    rect(0, 0, WIDTH, 12, blue);
    text(data.workshop, LEFT, 53, { size: 31, bold: true });
    text('CUSTOMER ESTIMATE', LEFT, 101, { size: 20, color: slate });
    rect(RIGHT - 182, 55, 182, 46, '#e8f5ee');
    text('APPROVED', RIGHT - 91, 68, { size: 22, color: '#177447', bold: true, align: 'center' });
    rect(LEFT, 142, CONTENT_WIDTH, 2, lineColor);
    y = 179;
    if (continued) {
      text('Estimate details (continued)', LEFT, y, { size: 23, bold: true });
      y += 56;
    } else {
      text('Estimate V' + data.version, LEFT, y, { size: 28, bold: true });
      text('Job: ' + data.jobNumber, RIGHT, y + 5, { size: 20, color: slate, align: 'right' });
      y += 55;
      text('CUSTOMER', LEFT, y, { size: 17, color: slate, bold: true });
      text('VEHICLE', LEFT + 550, y, { size: 17, color: slate, bold: true });
      y += 29;
      wrap(data.customerName, 480, 23, true).slice(0, 2)
        .forEach((t, i) => text(t, LEFT, y + i * 31, { size: 23, bold: true }));
      wrap(data.vehicleRegistration, 460, 23, true).slice(0, 2)
        .forEach((t, i) => text(t, LEFT + 550, y + i * 31, { size: 23, bold: true }));
      y += 65;
      text('Phone: ' + data.customerPhone, LEFT, y, { size: 19, color: slate });
      wrap(data.vehicleDescription, 480, 19).slice(0, 2)
        .forEach((t, i) => text(t, LEFT + 550, y + i * 24, { size: 19, color: slate }));
      y += 80;
      rect(LEFT, y, CONTENT_WIDTH, 1, lineColor);
      y += 27;
    }
  };
  const finishPage = () => {
    rect(LEFT, HEIGHT - 104, CONTENT_WIDTH, 1, lineColor);
    text('Approved Estimate · Not a tax invoice', LEFT, HEIGHT - 85, { size: 17, color: slate });
    text('Page ' + (pages.length + 1), RIGHT, HEIGHT - 85, { size: 17, color: slate, align: 'right' });
    const image = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    const binary = atob(image);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    pages.push({ width: WIDTH, height: HEIGHT, data: bytes });
  };
  const ensure = (height) => {
    if (y + height <= HEIGHT - 175) return;
    finishPage();
    makePage(true);
  };
  const tableHeader = (title) => {
    ensure(118);
    text(title, LEFT, y, { size: 23, bold: true });
    y += 41;
    rect(LEFT, y, CONTENT_WIDTH, 47, '#f0f4f9');
    text('Description', LEFT + 13, y + 12, { size: 17, bold: true });
    text('Qty', LEFT + 730, y + 12, { size: 17, bold: true, align: 'right' });
    text('Rate', LEFT + 889, y + 12, { size: 17, bold: true, align: 'right' });
    text('Amount', RIGHT - 13, y + 12, { size: 17, bold: true, align: 'right' });
    y += 47;
  };

  makePage();
  for (const group of [
    { title: 'WORK & LABOUR', rows: data.items.filter((row) => row.type !== 'Part') },
    { title: 'SPARE PARTS', rows: data.items.filter((row) => row.type === 'Part') },
  ]) {
    if (!group.rows.length) continue;
    tableHeader(group.title);
    for (let i = 0; i < group.rows.length; i += 1) {
      const item = group.rows[i];
      const lines = wrap(item.description, 640, 20);
      const rowHeight = Math.max(53, lines.length * 29 + 21);
      if (y + rowHeight > HEIGHT - 175) {
        finishPage(); makePage(true); tableHeader(group.title + ' (cont.)');
      }
      if (i % 2) rect(LEFT, y, CONTENT_WIDTH, rowHeight, '#fafbfd');
      lines.forEach((entry, j) => text(entry, LEFT + 13, y + 13 + j * 29, { size: 20 }));
      text(item.quantity.toLocaleString('en-IN'), LEFT + 730, y + 14, { size: 18, align: 'right' });
      text(formatMoney(item.unitPrice), LEFT + 889, y + 14, { size: 17, align: 'right' });
      text(formatMoney(item.quantity * item.unitPrice), RIGHT - 13, y + 14, {
        size: 18, bold: true, align: 'right',
      });
      y += rowHeight;
      rect(LEFT, y, CONTENT_WIDTH, 1, lineColor);
    }
    y += 35;
  }
  ensure(340);
  rect(LEFT + 620, y, CONTENT_WIDTH - 620, 2, lineColor);
  const totals = [
    ['Subtotal', data.subtotal],
    ['Discount', -data.discount],
    ['Tax (' + data.taxPercent + '%)', data.tax],
  ];
  let totalY = y + 22;
  totals.forEach(([label, value]) => {
    text(label, LEFT + 645, totalY, { size: 19, color: slate });
    text(formatMoney(value), RIGHT - 13, totalY, { size: 20, align: 'right' });
    totalY += 42;
  });
  rect(LEFT + 620, totalY + 1, CONTENT_WIDTH - 620, 2, lineColor);
  text('TOTAL', LEFT + 645, totalY + 19, { size: 22, bold: true });
  text(formatMoney(data.total), RIGHT - 13, totalY + 17, { size: 27, bold: true, align: 'right' });
  y = totalY + 100;
  text('Approved on: ' + data.approvedDate, LEFT, y, { size: 18, color: slate });
  if (data.approvedBy !== '—') {
    text('Approved by: ' + data.approvedBy, LEFT, y + 31, { size: 18, color: slate });
  }
  finishPage();
  return pages;
};

export const downloadApprovedEstimatePdf = (job, estimate) => {
  const data = estimatePdfData(job, estimate);
  const jpegPages = drawApprovedPages(data);
  const pdf = pdfBytesFromJpegPages(jpegPages);
  const jobLabel = (job.jobNumber || job.jobNo || job.number || 'Job')
    .toString().replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 55);
  const filename = 'Approved-Estimate-' + jobLabel + '-V' +
    String(data.version).replace(/[^a-zA-Z0-9_-]/g, '') + '.pdf';
  const file = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
};
