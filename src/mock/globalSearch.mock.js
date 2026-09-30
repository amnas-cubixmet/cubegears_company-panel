import { customersMock } from './customers.mock';
import { vehiclesMock } from './vehicles.mock';
import { jobsMock } from './jobs.mock';
import { invoicesMock } from './invoices.mock';
import { paymentsMock } from './payments.mock';
import { stockMock } from './stock.mock';
import { servicesMock } from './services.mock';
import { employeesMock } from './employees.mock';
import { notificationsMock } from './notifications.mock';
import { formatCurrency } from '../utils/formatCurrency';

// Extended Suppliers Mock Data
export const suppliersMock = [
  { id: 'SUP-0001', name: 'AutoParts Wholesale Co.', contact: '+91 98765 43210', category: 'Parts', city: 'Mumbai' },
  { id: 'SUP-0002', name: 'Global Oil Distributors', contact: '+91 98123 45678', category: 'Fluids', city: 'Bengaluru' },
  { id: 'SUP-0003', name: 'Bosch Direct India', contact: '+91 99000 11223', category: 'Electrical & Filters', city: 'Chennai' }
];

// Extended Bookings Mock Data
export const bookingsMock = [
  { id: 'BKG-0001', customerName: 'Sarah Jenkins', vehicle: 'Toyota Camry (ABC-1234)', service: 'Full Engine Tuneup', time: '09:30 AM', status: 'Confirmed' },
  { id: 'BKG-0002', customerName: 'Michael Chang', vehicle: 'BMW X5 (XYZ-9876)', service: 'Brake Replacement', time: '11:00 AM', status: 'In Progress' },
  { id: 'BKG-0003', customerName: 'David Smith', vehicle: 'Ford F-150 (TEX-5544)', service: 'Oil Change', time: '02:15 PM', status: 'Pending' }
];

export const searchMockData = (query) => {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const results = [];

  // 1. Customers
  customersMock.forEach((c) => {
    if (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    ) {
      results.push({
        id: c.id,
        type: 'Customer',
        group: 'Customers',
        title: c.name,
        subtitle: `${c.phone} • ${c.email}`,
        status: c.status,
        route: `/customers/${c.id}`
      });
    }
  });

  // 2. Vehicles
  vehiclesMock.forEach((v) => {
    const fullDesc = `${v.year} ${v.make} ${v.model}`.toLowerCase();
    if (
      fullDesc.includes(q) ||
      v.licensePlate.toLowerCase().includes(q) ||
      v.vin.toLowerCase().includes(q) ||
      v.customerName.toLowerCase().includes(q) ||
      v.id.toLowerCase().includes(q)
    ) {
      results.push({
        id: v.id,
        type: 'Vehicle',
        group: 'Vehicles',
        title: `${v.licensePlate} (${v.make} ${v.model})`,
        subtitle: `Owner: ${v.customerName} • VIN: ${v.vin}`,
        status: v.year ? String(v.year) : null,
        route: `/vehicles/${v.id}`
      });
    }
  });

  // 3. Bookings
  bookingsMock.forEach((b) => {
    if (
      b.customerName.toLowerCase().includes(q) ||
      b.vehicle.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    ) {
      results.push({
        id: b.id,
        type: 'Booking',
        group: 'Bookings',
        title: `${b.customerName} - ${b.service}`,
        subtitle: `${b.vehicle} at ${b.time}`,
        status: b.status,
        route: `/jobs`
      });
    }
  });

  // 4. Job Cards
  jobsMock.forEach((j) => {
    if (
      j.id.toLowerCase().includes(q) ||
      j.jobNumber.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.vehicleInfo.toLowerCase().includes(q) ||
      j.assignedEmployeeName.toLowerCase().includes(q)
    ) {
      results.push({
        id: j.id,
        type: 'Job Card',
        group: 'Job Cards',
        title: `${j.jobNumber} • ${j.customerName}`,
        subtitle: `${j.vehicleInfo} • Assigned: ${j.assignedEmployeeName}`,
        status: j.status.toUpperCase(),
        route: `/jobs/${j.id}`
      });
    }
  });

  // 5. Invoices
  invoicesMock.forEach((i) => {
    if (
      i.id.toLowerCase().includes(q) ||
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.customerName.toLowerCase().includes(q)
    ) {
      results.push({
        id: i.id,
        type: 'Invoice',
        group: 'Invoices',
        title: `${i.invoiceNumber} - ${i.customerName}`,
        subtitle: `Total: ${formatCurrency(i.totalAmount)} • Due: ${i.dueDate}`,
        status: i.status.toUpperCase(),
        route: `/invoices/${i.id}`
      });
    }
  });

  // 6. Payments
  paymentsMock.forEach((p) => {
    if (
      p.id.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.transactionRef.toLowerCase().includes(q)
    ) {
      results.push({
        id: p.id,
        type: 'Payment',
        group: 'Payments',
        title: `${p.id} • ${p.customerName}`,
        subtitle: `Amount: ${formatCurrency(p.amount)} via ${p.paymentMethod}`,
        status: p.status.toUpperCase(),
        route: `/payments`
      });
    }
  });

  // 7. Stock Items
  stockMock.forEach((s) => {
    if (
      s.partName.toLowerCase().includes(q) ||
      s.sku.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.brand.toLowerCase().includes(q)
    ) {
      results.push({
        id: s.id,
        type: 'Stock Item',
        group: 'Stock Items',
        title: s.partName,
        subtitle: `SKU: ${s.sku} • Stock: ${s.onHand} ${s.unit} • Price: ${formatCurrency(s.sellingPrice)}`,
        status: s.onHand <= 0 ? 'Out of Stock' : s.onHand <= s.minimumStock ? 'Low Stock' : 'In Stock',
        route: `/stock/items/${s.id}`
      });
    }
  });

  // 8. Services
  servicesMock.forEach((srv) => {
    if (
      srv.name.toLowerCase().includes(q) ||
      srv.code.toLowerCase().includes(q) ||
      srv.category.toLowerCase().includes(q)
    ) {
      results.push({
        id: srv.id,
        type: 'Service',
        group: 'Services',
        title: `${srv.name} (${srv.code})`,
        subtitle: `Category: ${srv.category} • ${srv.durationMinutes} mins • Price: ${formatCurrency(srv.price)}`,
        status: srv.status,
        route: `/services`
      });
    }
  });

  // 9. Employees
  employeesMock.forEach((emp) => {
    if (
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.department.toLowerCase().includes(q)
    ) {
      results.push({
        id: emp.id,
        type: 'Employee',
        group: 'Employees',
        title: emp.name,
        subtitle: `${emp.role} • ${emp.department}`,
        status: emp.status,
        route: `/employees/${emp.id}`
      });
    }
  });

  // 10. Suppliers
  suppliersMock.forEach((sup) => {
    if (
      sup.name.toLowerCase().includes(q) ||
      sup.contact.toLowerCase().includes(q) ||
      sup.category.toLowerCase().includes(q) ||
      sup.city.toLowerCase().includes(q)
    ) {
      results.push({
        id: sup.id,
        type: 'Supplier',
        group: 'Suppliers',
        title: sup.name,
        subtitle: `${sup.category} • ${sup.city} • ${sup.contact}`,
        status: 'Active',
        route: `/stock`
      });
    }
  });

  // 11. Notifications
  notificationsMock.forEach((n) => {
    if (
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q)
    ) {
      results.push({
        id: n.id,
        type: 'Notification',
        group: 'Notifications',
        title: n.title,
        subtitle: `${n.message} (${n.time})`,
        status: n.read ? 'READ' : 'UNREAD',
        route: `/notifications`
      });
    }
  });

  return results;
};
