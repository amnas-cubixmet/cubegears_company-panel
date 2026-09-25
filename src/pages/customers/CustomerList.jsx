import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from '../../components/common/Search';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { customerService } from '../../services/customer.service';
import { CustomerManagementTabs } from '../../components/customers/CustomerManagementTabs';
import {
  Users,
  UserCheck,
  UserPlus,
  DollarSign,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Car,
  FileText,
  CreditCard,
  Archive,
  Phone,
  MessageSquare,
  Mail,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const CustomerList = () => {
  const navigate = useNavigate();

  // Core Data State
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Add / Edit Customer Modal State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kochi');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('');
  const [customerType, setCustomerType] = useState('Individual');
  const [companyName, setCompanyName] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [branch, setBranch] = useState('Main Garage Branch');
  const [notes, setNotes] = useState('');

  // Duplicate Check Modal State
  const [duplicateFound, setDuplicateFound] = useState(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // Actions Popover / Menu State
  const [activeMenuCustomer, setActiveMenuCustomer] = useState(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, branchFilter, typeFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers({
        search,
        status: statusFilter,
        branch: branchFilter,
        customerType: typeFilter
      });

      const enriched = await Promise.all(data.map(async (customer) => {
        const [vehicles, jobs, invoices] = await Promise.all([
          customerService.getCustomerVehicles(customer.id),
          customerService.getCustomerJobs(customer.id),
          customerService.getCustomerInvoices(customer.id)
        ]);

        return {
          ...customer,
          vehicleCount: vehicles.length,
          jobsCount: jobs.length,
          totalSpent: invoices.reduce((sum, invoice) => sum + Number(invoice.paidAmount || 0), 0),
          outstanding: invoices.reduce((sum, invoice) => sum + Number(invoice.balanceDue || 0), 0)
        };
      }));

      setCustomers(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const openAddModal = () => {
    setEditingCustomerId(null);
    resetForm();
    setIsAddCustomerOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCustomerId(c.id);
    setName(c.name || '');
    setPhone(c.phone || '');
    setWhatsapp(c.whatsapp || '');
    setEmail(c.email || '');
    setAddress(c.address || '');
    setCity(c.city || 'Kochi');
    setState(c.state || 'Kerala');
    setPincode(c.pincode || '');
    setCustomerType(c.customerType || 'Individual');
    setCompanyName(c.companyName || '');
    setGstNo(c.gstNo || '');
    setBranch(c.branch || 'Main Garage Branch');
    setNotes(c.notes || '');
    setIsAddCustomerOpen(true);
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setAddress('');
    setCity('Kochi');
    setState('Kerala');
    setPincode('');
    setCustomerType('Individual');
    setCompanyName('');
    setGstNo('');
    setBranch('Main Garage Branch');
    setNotes('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      phone,
      whatsapp: whatsapp || phone,
      email,
      address,
      city,
      state,
      pincode,
      customerType,
      companyName,
      gstNo,
      branch,
      notes
    };

    // If creating a new customer, perform duplicate check first
    if (!editingCustomerId) {
      const match = await customerService.checkDuplicateCustomer(payload);
      if (match) {
        setDuplicateFound(match);
        setIsDuplicateModalOpen(true);
        return;
      }
    }

    await saveCustomer(payload);
  };

  const saveCustomer = async (payload) => {
    if (editingCustomerId) {
      await customerService.updateCustomer(editingCustomerId, payload);
      showToast('Customer information updated.');
    } else {
      await customerService.createCustomer(payload);
      showToast('New customer created successfully.');
    }
    setIsAddCustomerOpen(false);
    setIsDuplicateModalOpen(false);
    resetForm();
    fetchCustomers();
  };

  const handleArchive = async (id) => {
    if (window.confirm('Archive this customer profile? Customer record will remain in job history.')) {
      await customerService.archiveCustomer(id);
      showToast('Customer archived.');
      fetchCustomers();
    }
  };

  // Metrics
  const totalCount = customers.length;
  const activeCount = customers.filter(c => c.status === 'Active').length;
  const newThisMonthCount = customers.filter(c => c.createdAt && c.createdAt.startsWith('2026-09')).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', paddingBottom: '70px' }}>
      
      {/* Toast Banner */}
      {toastMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>
          {toastMsg}
        </div>
      )}

      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Manage workshop customers, vehicles and service history.</p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            height: '42px',
            padding: '0 18px',
            borderRadius: '11px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: 'auto'
          }}
          className="mobile-full-width-btn"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <CustomerManagementTabs />

      {/* SUMMARY CARDS GRID (4 DESKTOP, 2x2 MOBILE) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }} className="customers-summary-grid">
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Customers</div>
            <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>{totalCount}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Customers</div>
            <strong style={{ fontSize: '18px', color: 'var(--success)' }}>{activeCount}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>New This Month</div>
            <strong style={{ fontSize: '18px', color: 'var(--primary)' }}>{newThisMonthCount}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding</div>
            <strong style={{ fontSize: '18px', color: 'var(--warning)' }}>{formatINR(14500)}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTERS TOOLBAR */}
      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Search
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, WhatsApp, email or vehicle..."
            />
          </div>
          
          {/* Desktop Filter Dropdowns */}
          <div className="desktop-filters-row" style={{ display: 'flex', gap: '8px' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              containerStyle={{ width: '130px', marginBottom: 0 }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </Select>

            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              containerStyle={{ width: '140px', marginBottom: 0 }}
            >
              <option value="All">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Company/Fleet">Company / Fleet</option>
              <option value="Business / Company">Business / Company</option>
              <option value="Insurance">Insurance</option>
              <option value="Dealer/Partner">Dealer / Partner</option>
            </Select>
          </div>

          {/* Mobile Filter Button */}
          <button
            className="mobile-filter-trigger"
            onClick={() => setIsFilterSheetOpen(true)}
            style={{ height: '44px', padding: '0 14px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* CUSTOMER LIST: DESKTOP TABLE & MOBILE CARDS */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers directory...</div>
      ) : customers.length === 0 ? (
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Users size={36} style={{ color: 'var(--text-muted)' }} />
          <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>No matching customers found.</strong>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>Try clearing filters or add a new customer.</p>
          <button onClick={openAddModal} style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', marginTop: '6px' }}>
            + Add First Customer
          </button>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="desktop-customers-table" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>
                  <th style={{ padding: '12px 14px' }}>Customer</th>
                  <th style={{ padding: '12px 14px' }}>Phone / WhatsApp</th>
                  <th style={{ padding: '12px 14px' }}>Customer Type</th>
                  <th style={{ padding: '12px 14px' }}>Vehicles</th>
                  <th style={{ padding: '12px 14px' }}>Last Visit</th>
                  <th style={{ padding: '12px 14px' }}>Outstanding</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{c.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.email || c.id}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{c.phone}</div>
                      <span style={{ fontSize: '11px', color: 'var(--success)' }}>WhatsApp ✓</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{c.customerType || 'Individual'}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{c.vehicleCount || 0} Vehicles</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{c.lastVisit || '—'}</td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: c.outstanding ? 'var(--warning)' : 'var(--success)' }}>{formatINR(c.outstanding)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: c.status === 'Active' ? 'var(--success-soft)' : 'var(--surface-2)', color: c.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/customers/${c.id}`)}
                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--primary)', fontWeight: '600', fontSize: '12px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', cursor: 'pointer' }}
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="mobile-customers-cards" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {customers.map((c) => (
              <div key={c.id} style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{c.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.phone} • WhatsApp available</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: c.status === 'Active' ? 'var(--success-soft)' : 'var(--surface-2)', color: c.status === 'Active' ? 'var(--success)' : 'var(--text-muted)' }}>
                    {c.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--surface-2)', padding: '10px', borderRadius: '10px', fontSize: '12px' }}>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Vehicles & Jobs</span><strong>{c.vehicleCount || 0} Vehicles • {c.jobsCount || 0} Jobs</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Last Visit</span><strong>{c.lastVisit || '—'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Customer Type</span><strong>{c.customerType || 'Individual'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Outstanding</span><strong style={{ color: c.outstanding ? 'var(--warning)' : 'var(--success)' }}>{formatINR(c.outstanding)}</strong></div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                  <button
                    onClick={() => navigate(`/customers/${c.id}`)}
                    style={{ flex: 1, height: '38px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                  >
                    View Customer <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => openEditModal(c)}
                    style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL / SHEET: ADD OR EDIT CUSTOMER */}
      <ResponsiveModalSheet
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title={editingCustomerId ? "Edit Customer Details" : "Add Workshop Customer"}
        maxWidth="540px"
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <Input
            label="Customer Name"
            required
            icon={Users}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Kumar"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input
              label="Phone Number"
              required
              icon={Phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
            />
            <Input
              label="WhatsApp Number"
              icon={MessageSquare}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="98765 43210"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul.k@example.com"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Select
              label="Customer Type"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
            >
              <option value="Individual">Individual</option>
              <option value="Business / Company">Business / Company</option>
            </Select>

            <Select
              label="Assigned Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="Main Garage Branch">Main Garage Branch</option>
              <option value="Kochi South Branch">Kochi South Branch</option>
            </Select>
          </div>

          {customerType === 'Business / Company' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Logistics Ltd"
              />
              <Input
                label="GST Number"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value)}
                placeholder="32AAAAA0000A1Z5"
              />
            </div>
          )}

          <Textarea
            label="Address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, building details..."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
            <Input label="PIN Code" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="682031" />
          </div>

          <Textarea
            label="Customer Notes & Preferences"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Call before replacing additional parts..."
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              style={{ flex: 1, height: '44px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontWeight: '600' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700' }}
            >
              {editingCustomerId ? "Save Changes" : "Create Customer"}
            </button>
          </div>
        </form>
      </ResponsiveModalSheet>

      {/* MODAL: DUPLICATE WARNING */}
      <ResponsiveModalSheet
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Possible Existing Customer Found"
        maxWidth="460px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ backgroundColor: 'var(--warning-soft)', padding: '12px', borderRadius: '10px', border: '1px solid var(--warning-soft)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
              A customer with matching phone or email already exists in your database.
            </span>
          </div>

          {duplicateFound && (
            <div style={{ backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '10px', fontSize: '13px' }}>
              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{duplicateFound.name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{duplicateFound.phone} • {duplicateFound.email}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setIsDuplicateModalOpen(false);
                setIsAddCustomerOpen(false);
                navigate(`/customers/${duplicateFound?.id}`);
              }}
              style={{ flex: 1, height: '44px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--primary)', fontWeight: '700' }}
            >
              View Existing
            </button>
            <button
              type="button"
              onClick={() => {
                const payload = { name, phone, whatsapp: whatsapp || phone, email, address, city, state, pincode, customerType, companyName, gstNo, branch, notes };
                saveCustomer(payload);
              }}
              style={{ flex: 1, height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700' }}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </ResponsiveModalSheet>

      {/* BOTTOM SHEET: MOBILE FILTERS */}
      <ResponsiveModalSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Customers"
        maxWidth="420px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Select
            label="Customer Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </Select>

          <Select
            label="Customer Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Individual">Individual</option>
            <option value="Business / Company">Business</option>
          </Select>

          <Select
            label="Branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Branches</option>
            <option value="Main Garage Branch">Main Garage Branch</option>
            <option value="Kochi South Branch">Kochi South Branch</option>
          </Select>

          <button
            onClick={() => setIsFilterSheetOpen(false)}
            style={{ height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', marginTop: '6px' }}
          >
            Apply Filters
          </button>
        </div>
      </ResponsiveModalSheet>

      <style>{`
        @media (max-width: 767px) {
          .customers-summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .mobile-full-width-btn {
            width: 100% !important;
          }
          .desktop-filters-row {
            display: none !important;
          }
          .desktop-customers-table {
            display: none !important;
          }
          .mobile-customers-cards {
            display: flex !important;
          }
          .mobile-filter-trigger {
            display: flex !important;
          }
        }
        @media (min-width: 768px) {
          .mobile-customers-cards {
            display: none !important;
          }
          .mobile-filter-trigger {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
