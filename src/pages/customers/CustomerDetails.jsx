import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { AmountInput } from '../../components/common/AmountInput';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  ClipboardCheck,
  FileText,
  CreditCard,
  Clock,
  Plus,
  ArrowLeft,
  Wrench,
  Edit,
  Archive,
  MoreVertical,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Search,
  Tag,
  ShieldCheck,
  Check,
  Trash2,
  Upload
} from 'lucide-react';

export const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tabRailRef = useRef(null);

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [toastMsg, setToastMsg] = useState('');

  // Sub-resource state
  const [vehicles, setVehicles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activity, setActivity] = useState([]);

  // Modals state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);

  // New Vehicle form state
  const [vRegNo, setVRegNo] = useState('');
  const [vMake, setVMake] = useState('Toyota');
  const [vModel, setVModel] = useState('Innova 2.5V');
  const [vType, setVType] = useState('MPV');
  const [vFuel, setVFuel] = useState('Diesel');
  const [vTransmission, setVTransmission] = useState('Manual');
  const [vYear, setVYear] = useState('2021');
  const [vColor, setVColor] = useState('Silver Metallic');
  const [vVin, setVVin] = useState('');
  const [vKm, setVKm] = useState('1,24,500 km');
  const [vNotes, setVNotes] = useState('');

  // Record Payment form state
  const [payInvoiceNo, setPayInvoiceNo] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Edit Customer form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editType, setEditType] = useState('Individual');
  const [editCompany, setEditCompany] = useState('');
  const [editGst, setEditGst] = useState('');
  const [editBranch, setEditBranch] = useState('Main Garage Branch');

  // Customer Note form state
  const [newNoteText, setNewNoteText] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Vehicle RC');
  const [docVehicle, setDocVehicle] = useState('');
  const [docExpiry, setDocExpiry] = useState('');
  const [docStatus, setDocStatus] = useState('Valid');
  const [docFileName, setDocFileName] = useState('');

  // Service History filter state
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceVehicleFilter, setServiceVehicleFilter] = useState('All');

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const targetId = id || 'CUS-0001';
      const cust = await customerService.getCustomerById(targetId);
      if (cust) {
        setCustomer(cust);
        setEditName(cust.name || '');
        setEditPhone(cust.phone || '');
        setEditWhatsapp(cust.whatsapp || cust.phone || '');
        setEditEmail(cust.email || '');
        setEditAddress(cust.address || '');
        setEditCity(cust.city || 'Kochi');
        setEditState(cust.state || 'Kerala');
        setEditPincode(cust.pincode || '682031');
        setEditType(cust.customerType || 'Individual');
        setEditCompany(cust.companyName || '');
        setEditGst(cust.gstNo || '');
        setEditBranch(cust.branch || 'Main Garage Branch');
        setDocuments(Array.isArray(cust.documents) ? cust.documents : []);

        setNotesList(cust.notes ? [{ id: 1, text: cust.notes, addedBy: 'Service Advisor', date: '2026-09-14 09:15 AM' }] : [
          { id: 1, text: 'Prefers evening delivery.', addedBy: 'Rajesh V', date: '2026-09-10 04:30 PM' },
          { id: 2, text: 'Call before replacing additional parts.', addedBy: 'Ajmal K', date: '2026-09-12 11:20 AM' }
        ]);

        const vList = await customerService.getCustomerVehicles(targetId);
        setVehicles(vList);

        const jList = await customerService.getCustomerJobs(targetId);
        setJobs(jList);

        const invList = await customerService.getCustomerInvoices(targetId);
        setInvoices(invList);

        const payList = await customerService.getCustomerPayments(targetId);
        setPayments(payList);

        const actList = await customerService.getCustomerActivity(targetId);
        setActivity(actList);
      }
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

  const handleTabClick = (tabId, event) => {
    setActiveTab(tabId);
    if (event && event.currentTarget && tabRailRef.current) {
      event.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handleAddVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vRegNo.trim()) return;
    await customerService.addCustomerVehicle(customer.id, {
      regNo: vRegNo,
      make: vMake,
      model: vModel,
      vehicleType: vType,
      fuelType: vFuel,
      transmission: vTransmission,
      year: vYear,
      color: vColor,
      vin: vVin,
      kilometres: vKm,
      notes: vNotes
    });
    showToast('New vehicle registered to customer.');
    setIsAddVehicleOpen(false);
    setVRegNo('');
    loadCustomerData();
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return;

    const newPayment = {
      id: `PAY-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      invoiceNo: payInvoiceNo || (invoices[0]?.invoiceNo || 'INV-2026-092'),
      method: payMethod,
      amount: Number(payAmount),
      reference: payRef || 'REF-ONLINE',
      recordedBy: 'Current Staff'
    };

    setPayments([newPayment, ...payments]);
    showToast(`Payment of ${formatINR(payAmount)} recorded successfully.`);
    setIsRecordPaymentOpen(false);
    setPayAmount('');
    setPayRef('');
  };

  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault();
    const updated = await customerService.updateCustomer(customer.id, {
      name: editName,
      phone: editPhone,
      whatsapp: editWhatsapp,
      email: editEmail,
      address: editAddress,
      city: editCity,
      state: editState,
      pincode: editPincode,
      customerType: editType,
      companyName: editCompany,
      gstNo: editGst,
      branch: editBranch
    });
    setCustomer(updated);
    showToast('Customer profile updated.');
    setIsEditCustomerOpen(false);
  };

  const handleAddNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const noteObj = {
      id: Date.now(),
      text: newNoteText,
      addedBy: 'Service Advisor',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setNotesList([noteObj, ...notesList]);
    setIsAddNoteOpen(false);
    setNewNoteText('');
    showToast('Customer note saved.');
  };

  const handleAddDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const nextDocument = {
      id: `CDOC-${Date.now()}`,
      name: docName.trim(),
      type: docType,
      vehicleReg: docVehicle,
      expiryDate: docExpiry,
      status: docStatus,
      fileName: docFileName,
      uploadedDate: new Date().toISOString().split('T')[0]
    };

    const nextDocuments = [nextDocument, ...documents];
    await customerService.updateCustomer(customer.id, { documents: nextDocuments });
    setDocuments(nextDocuments);
    setDocName('');
    setDocType('Vehicle RC');
    setDocVehicle('');
    setDocExpiry('');
    setDocStatus('Valid');
    setDocFileName('');
    setIsAddDocumentOpen(false);
    showToast('Customer document added.');
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Delete this customer document record?')) return;
    const nextDocuments = documents.filter((document) => document.id !== documentId);
    await customerService.updateCustomer(customer.id, { documents: nextDocuments });
    setDocuments(nextDocuments);
    showToast('Customer document removed.');
  };

  const handleArchiveCustomer = async () => {
    if (window.confirm(`Are you sure you want to archive ${customer.name}? This will preserve historical records.`)) {
      await customerService.archiveCustomer(customer.id);
      showToast('Customer archived.');
      navigate('/customers/all');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '80px', backgroundColor: 'var(--surface-2)', borderRadius: '14px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', height: '90px' }}>
          <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px' }} />
          <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px' }} />
          <div style={{ backgroundColor: 'var(--surface-2)', borderRadius: '12px' }} />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <h2 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Customer Not Found</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>The requested customer profile does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/customers/all')}
          style={{ height: '42px', padding: '0 20px', borderRadius: '11px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
        >
          Back to Customers
        </button>
      </div>
    );
  }

  // Financial calculations derived from actual invoices & payments
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);
  const lastVisitDate = customer.lastVisit || (jobs[0]?.createdDate || '12 Sep 2026');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'vehicles', label: `Vehicles (${vehicles.length})`, icon: Car },
    { id: 'jobs', label: `Jobs (${jobs.length})`, icon: ClipboardCheck },
    { id: 'service-history', label: 'Service History', icon: Wrench },
    { id: 'invoices', label: `Invoices (${invoices.length})`, icon: FileText },
    { id: 'payments', label: `Payments (${payments.length})`, icon: CreditCard },
    { id: 'notes', label: `Notes (${notesList.length})`, icon: MessageSquare },
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'activity', label: 'Activity', icon: Clock }
  ];

  return (
    <div className="customer-profile-page cg-customers" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', paddingBottom: '90px' }}>
      
      {/* TOAST FEEDBACK */}
      {toastMsg && (
        <div style={{ backgroundColor: 'var(--success)', color: '#ffffff', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          {toastMsg}
        </div>
      )}

      {/* 1. CUSTOMER PROFILE HEADER */}
      <div className="customer-profile-header" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => navigate('/customers/all')}
              style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="Back to Customers"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                  {customer.name}
                </h1>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', backgroundColor: customer.status === 'Archived' ? 'var(--surface-2)' : 'var(--success-soft)', color: customer.status === 'Archived' ? 'var(--text-muted)' : 'var(--success)' }}>
                  {customer.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {customer.customerType || 'Individual'} • Customer ID: <strong style={{ color: 'var(--text-primary)' }}>{customer.id}</strong>
              </div>
            </div>
          </div>

          {/* Desktop Right Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                const targetVehicle = vehicles[0]?.regNo || '';
                navigate(`/jobs/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&vehicle=${encodeURIComponent(targetVehicle)}`);
              }}
              style={{ height: '40px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> New Job Card
            </button>

            <button
              onClick={() => setIsAddVehicleOpen(true)}
              style={{ height: '40px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Car size={16} /> Add Vehicle
            </button>

            <button
              onClick={() => setIsMoreMenuOpen(true)}
              style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              title="More Actions"
            >
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Contact Info & Meta Row */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12.5px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <a className="customer-contact-action" href={`tel:${customer.phone}`}>
            <Phone size={14} />
            <strong>{customer.phone}</strong>
          </a>
          {customer.whatsapp && (
            <a
              className="customer-contact-action is-whatsapp"
              href={`https://wa.me/${String(customer.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageSquare size={14} />
              <span>{customer.whatsapp}</span>
            </a>
          )}
          {customer.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{customer.email}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Branch: <strong style={{ color: 'var(--text-primary)' }}>{customer.branch}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <span>Customer Since: <strong>{customer.createdAt || '12 Jan 2025'}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '10px' }} className="customer-profile-kpis customer-kpi-grid">
        <style>{`
          @media (max-width: 1024px) {
            .customer-kpi-grid {
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 600px) {
            .customer-kpi-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
        `}</style>
        
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Vehicles</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{vehicles.length}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Jobs</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{jobs.length}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Billed</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{formatINR(totalBilled)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Total Paid</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>{formatINR(totalPaid)}</div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Outstanding</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--text-primary)', marginTop: '4px' }}>
            {formatINR(totalOutstanding)}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Last Visit</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lastVisitDate}
          </div>
        </div>
      </div>

      {/* 3. CUSTOMER HORIZONTAL TABS RAIL */}
      <div className="customer-profile-tabs" style={{ width: '100%', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)', borderRadius: '12px', overflow: 'hidden' }}>
        <div
          ref={tabRailRef}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', padding: '4px 8px', whiteSpace: 'nowrap' }}
          className="customer-profile-tabs__rail scroll-hidden"
        >
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={(e) => handleTabClick(t.id, e)}
                style={{
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 160ms ease'
                }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="customer-profile-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* 4. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Quick Actions Grid (2x2 Mobile) */}
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }} className="quick-actions-grid">
                <style>{`
                  @media (max-width: 767px) {
                    .quick-actions-grid {
                      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                    }
                  }
                `}</style>

                <button
                  onClick={() => {
                    const targetVehicle = vehicles[0]?.regNo || '';
                    navigate(`/jobs/new?customerId=${customer.id}&customerName=${encodeURIComponent(customer.name)}&vehicle=${encodeURIComponent(targetVehicle)}`);
                  }}
                  style={{ padding: '12px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--primary)', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Plus size={16} /> New Job Card
                </button>

                <button
                  onClick={() => setIsAddVehicleOpen(true)}
                  style={{ padding: '12px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Car size={16} /> Add Vehicle
                </button>

                <button
                  onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}
                  style={{ padding: '12px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <FileText size={16} /> Create Invoice
                </button>

                <button
                  onClick={() => setIsRecordPaymentOpen(true)}
                  style={{ padding: '12px', borderRadius: '11px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--success)', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <CreditCard size={16} /> Record Payment
                </button>
              </div>
            </div>

            {/* Detailed Profile Information */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }} className="overview-details-grid">
              <style>{`
                @media (max-width: 767px) {
                  .overview-details-grid {
                    grid-template-columns: 1fr !important;
                  }
                }
              `}</style>

              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} style={{ color: 'var(--primary)' }} /> Customer & Contact Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Full Name</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{customer.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{customer.phone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>WhatsApp</span>
                    <strong style={{ color: 'var(--success)' }}>{customer.whatsapp || customer.phone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{customer.email || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Customer Type</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{customer.customerType || 'Individual'}</strong>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} /> Address & Workshop Details
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Address</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{customer.address || 'Street 1, Main Road'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>City / State</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{customer.city || 'Kochi'}, {customer.state || 'Kerala'} ({customer.pincode || '682031'})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Company / GST</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{customer.companyName || 'N/A'} {customer.gstNo ? `(${customer.gstNo})` : ''}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Primary Branch</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{customer.branch}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ color: 'var(--success)', fontWeight: '700' }}>{customer.status || 'Active'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 17. Recent Activity Overview */}
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Recent Customer Activity</h3>
                <button
                  onClick={() => setActiveTab('activity')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  View All Activity →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activity.slice(0, 5).map((act, idx) => (
                  <div key={idx} style={{ backgroundColor: 'var(--surface-2)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{act.type}</strong>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{act.desc}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. VEHICLES TAB */}
        {activeTab === 'vehicles' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Linked Vehicles</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>All vehicles registered under this customer account</p>
              </div>
              <button
                onClick={() => setIsAddVehicleOpen(true)}
                style={{ height: '38px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Add Vehicle
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {vehicles.map((v) => (
                <div key={v.id} style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>{v.regNo}</span>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{v.makeModel}</h4>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
                      {v.fuelType}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div>Type: <strong style={{ color: 'var(--text-primary)' }}>{v.vehicleType}</strong></div>
                    <div>Trans: <strong style={{ color: 'var(--text-primary)' }}>{v.transmission}</strong></div>
                    <div>Year: <strong style={{ color: 'var(--text-primary)' }}>{v.year}</strong></div>
                    <div>Current KM: <strong style={{ color: 'var(--text-primary)' }}>{v.kilometres || '1,24,500 km'}</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <button
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                      style={{ flex: 1, height: '34px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      View Vehicle
                    </button>
                    <button
                      onClick={() => navigate(`/jobs/new?customerId=${customer.id}&vehicle=${encodeURIComponent(v.regNo)}`)}
                      style={{ flex: 1, height: '34px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Create Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. JOBS TAB */}
        {activeTab === 'jobs' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Job Card History</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>All repair & service jobs executed for this customer</p>
              </div>
              <button
                onClick={() => navigate(`/jobs/new?customerId=${customer.id}`)}
                style={{ height: '38px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Create Job Card
              </button>
            </div>

            {/* Cards for Mobile & Desktop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {jobs.map((j) => (
                <div
                  key={j.id}
                  onClick={() => navigate(`/jobs/${j.id}`)}
                  style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', cursor: 'pointer', transition: 'border-color 160ms ease' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>{j.jobNumber}</strong>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        {j.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {j.vehicleInfo || j.vehicleReg} ({j.vehicleReg})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Date: {j.createdDate} • Complaint: {j.customerComplaint || 'Engine vibration'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: 'auto' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: j.paymentStatus === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>
                      {j.paymentStatus || 'Partially Paid'}
                    </span>
                    <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{formatINR(j.billing?.invoiceTotal || 12500)}</strong>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${j.id}`);
                      }}
                      style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--primary)', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', marginTop: '2px' }}
                    >
                      View Job
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. SERVICE HISTORY TAB */}
        {activeTab === 'service-history' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Chronological Service History</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Complete history of services, replaced parts, and costs across all vehicles</p>
              </div>

              {/* Filters Toolbar */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Select
                  value={serviceVehicleFilter}
                  onChange={(e) => setServiceVehicleFilter(e.target.value)}
                  containerStyle={{ width: '180px' }}
                >
                  <option value="All">All Vehicles</option>
                  {vehicles.map(v => <option key={v.id} value={v.regNo}>{v.regNo}</option>)}
                </Select>
              </div>
            </div>

            {/* Timeline Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobs
                .filter(j => serviceVehicleFilter === 'All' || j.vehicleReg === serviceVehicleFilter)
                .map((j) => (
                  <div key={j.id} style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={15} style={{ color: 'var(--primary)' }} />
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{j.createdDate}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>• {j.vehicleInfo || 'Toyota Innova'} ({j.vehicleReg})</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>{j.jobNumber}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
                      <div>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11.5px', marginBottom: '4px' }}>Services Performed:</strong>
                        <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-primary)' }}>
                          {(j.services?.length ? j.services : j.labourRecords || []).slice(0, 5).map((service, index) => (
                            <li key={service.id || index}>{service.serviceName || service.service || 'Workshop labour'}</li>
                          ))}
                          {!(j.services?.length || j.labourRecords?.length) ? <li>No labour items recorded</li> : null}
                        </ul>
                      </div>

                      <div>
                        <strong style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11.5px', marginBottom: '4px' }}>Parts Installed:</strong>
                        <ul style={{ margin: 0, paddingLeft: '16px', color: 'var(--text-primary)' }}>
                          {(j.partsUsed || []).slice(0, 5).map((part, index) => (
                            <li key={part.id || index}>{part.name || part.partName || 'Part'}</li>
                          ))}
                          {!j.partsUsed?.length ? <li>No replacement parts recorded</li> : null}
                        </ul>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      <div>Technician: <strong style={{ color: 'var(--text-primary)' }}>{j.serviceAdvisor || 'Ajmal K'}</strong></div>
                      <div>
                        Labour: <strong>{formatINR((j.labourRecords || []).reduce((sum, item) => sum + Number(item.customerCharge || 0), 0))}</strong> • Parts: <strong>{formatINR((j.partsUsed || []).reduce((sum, item) => sum + Number(item.total || (Number(item.qty || 0) * Number(item.unitPrice || 0))), 0))}</strong> • <strong style={{ color: 'var(--primary)', fontSize: '14px' }}>Total: {formatINR(j.billing?.invoiceTotal || j.estimates?.at(-1)?.grandTotal || 0)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 9. INVOICES TAB & 10. FINANCIAL SUMMARY */}
        {activeTab === 'invoices' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Customer Invoices</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Calculated from actual unpaid & paid invoice balances</p>
              </div>
              <button
                onClick={() => navigate(`/invoices/create?customerId=${customer.id}`)}
                style={{ height: '38px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Create Invoice
              </button>
            </div>

            {/* Financial Summary Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: 'var(--surface-2)', padding: '12px', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Billed</span>
                <strong style={{ fontSize: '16px', color: 'var(--primary)' }}>{formatINR(totalBilled)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Paid</span>
                <strong style={{ fontSize: '16px', color: 'var(--success)' }}>{formatINR(totalPaid)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Outstanding Balance</span>
                <strong style={{ fontSize: '16px', color: totalOutstanding > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>{formatINR(totalOutstanding)}</strong>
              </div>
            </div>

            {/* Invoices List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {invoices.map((inv, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{inv.invoiceNo}</strong> (Job #{inv.jobNumber})
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Date: {inv.date} • Vehicle: {inv.vehicle}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: inv.status === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>
                      {inv.status}
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--primary)' }}>{formatINR(inv.totalAmount)}</strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Balance: {formatINR(inv.balanceDue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Payment Records</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>All transactions recorded against customer invoices</p>
              </div>
              <button
                onClick={() => setIsRecordPaymentOpen(true)}
                style={{ height: '38px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--success)', color: '#ffffff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Record Payment
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {payments.map((p) => (
                <div key={p.id} style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{p.method}</strong>
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '6px', backgroundColor: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
                        {p.invoiceNo}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Date: {p.date} • Ref: {p.reference} • Recorded by: {p.recordedBy}
                    </div>
                  </div>
                  <strong style={{ fontSize: '16px', color: 'var(--success)' }}>+{formatINR(p.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12. NOTES TAB */}
        {activeTab === 'notes' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Staff Internal Notes</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Special preferences & observations maintained by workshop staff</p>
              </div>
              <button
                onClick={() => setIsAddNoteOpen(true)}
                style={{ height: '38px', padding: '0 14px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Add Note
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {notesList.map((n) => (
                <div key={n.id} style={{ backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', fontSize: '13px' }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: '500', lineHeight: 1.4 }}>"{n.text}"</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                    Added by <strong>{n.addedBy}</strong> • {n.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="customer-profile-documents">
            <div className="customer-profile-documents__head">
              <div>
                <h3>Customer & Vehicle Documents</h3>
                <p>Vehicle RC, insurance, company documents and attachments.</p>
              </div>
              <button onClick={() => setIsAddDocumentOpen(true)}>
                <Plus size={15}/> Add Document
              </button>
            </div>

            {documents.length ? (
              <div className="customer-document-grid">
                {documents.map((document) => (
                  <article key={document.id} className="customer-document-card">
                    <div className="customer-document-card__head">
                      <span><FileText size={16}/></span>
                      <div>
                        <strong>{document.name}</strong>
                        <small>{document.type}{document.vehicleReg ? ` · ${document.vehicleReg}` : ''}</small>
                      </div>
                      <b className={`is-${String(document.status || 'valid').toLowerCase().replaceAll(' ', '-')}`}>
                        {document.status || 'Valid'}
                      </b>
                    </div>
                    <div className="customer-document-meta">
                      <div><span>Uploaded</span><strong>{document.uploadedDate || '—'}</strong></div>
                      <div><span>Expiry</span><strong>{document.expiryDate || 'No expiry'}</strong></div>
                      <div><span>File</span><strong>{document.fileName || 'Metadata only'}</strong></div>
                    </div>
                    <button className="customer-document-delete" onClick={() => deleteDocument(document.id)}>
                      <Trash2 size={13}/> Delete
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="customer-empty">No customer or vehicle documents uploaded yet.</div>
            )}
          </div>
        )}

        {/* 13. ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Full Audit & Activity Timeline</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>System events logged for this customer account</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '22px' }}>
              <div style={{ position: 'absolute', left: '8px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border)' }} />
              {activity.map((act, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '2px solid var(--surface)' }} />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>{act.time}</span>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0' }}>{act.type}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{act.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL / SHEET: RECORD PAYMENT */}
      <ResponsiveModalSheet
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        title="Record Customer Payment"
        maxWidth="480px"
      >
        <form onSubmit={handleRecordPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Select
            label="Invoice"
            value={payInvoiceNo}
            onChange={(e) => setPayInvoiceNo(e.target.value)}
          >
            {invoices.map(inv => (
              <option key={inv.invoiceNo} value={inv.invoiceNo}>
                {inv.invoiceNo} ({inv.vehicle}) - Due: {formatINR(inv.balanceDue)}
              </option>
            ))}
          </Select>

          <AmountInput
            label="Payment Amount"
            required
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="5000"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Select
              label="Payment Method"
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
            >
              <option value="UPI">UPI / QR</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card Swipe</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </Select>

            <Input
              label="Reference / Transaction ID"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="UPI/9812304/APEX"
            />
          </div>

          <Textarea
            label="Payment Notes"
            rows={2}
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
            placeholder="Received advance payment..."
          />

          <button
            type="submit"
            style={{ height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--success)', color: '#ffffff', fontWeight: '700', cursor: 'pointer', marginTop: '6px' }}
          >
            Confirm & Save Payment
          </button>
        </form>
      </ResponsiveModalSheet>

      {/* MODAL / SHEET: ADD VEHICLE */}
      <ResponsiveModalSheet
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        title={`Add Vehicle for ${customer.name}`}
        maxWidth="520px"
      >
        <form onSubmit={handleAddVehicleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Registration Number" required icon={Car} value={vRegNo} onChange={(e) => setVRegNo(e.target.value)} placeholder="e.g. KL 10 AB 1234" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input label="Make" required value={vMake} onChange={(e) => setVMake(e.target.value)} placeholder="Toyota" />
            <Input label="Model" required value={vModel} onChange={(e) => setVModel(e.target.value)} placeholder="Innova 2.5V" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Select label="Vehicle Type" value={vType} onChange={(e) => setVType(e.target.value)}>
              <option value="Car / SUV">Car / SUV</option>
              <option value="MPV">MPV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Sedan">Sedan</option>
              <option value="Commercial Truck">Commercial Truck</option>
            </Select>

            <Select label="Fuel Type" value={vFuel} onChange={(e) => setVFuel(e.target.value)}>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="EV / Electric">EV / Electric</option>
              <option value="CNG / Hybrid">CNG / Hybrid</option>
            </Select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Select label="Transmission" value={vTransmission} onChange={(e) => setVTransmission(e.target.value)}>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </Select>
            <Input label="Current Kilometres" value={vKm} onChange={(e) => setVKm(e.target.value)} placeholder="1,24,500 km" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input label="Manufacturing Year" value={vYear} onChange={(e) => setVYear(e.target.value)} placeholder="2021" />
            <Input label="VIN / Chassis Number" value={vVin} onChange={(e) => setVVin(e.target.value)} placeholder="MBJ11223344" />
          </div>

          <Textarea label="Vehicle Notes" rows={2} value={vNotes} onChange={(e) => setVNotes(e.target.value)} placeholder="Scratch on rear bumper..." />

          <button type="submit" style={{ height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', marginTop: '6px', cursor: 'pointer' }}>
            Register & Link Vehicle
          </button>
        </form>
      </ResponsiveModalSheet>

      {/* MODAL / SHEET: EDIT CUSTOMER */}
      <ResponsiveModalSheet
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        title="Edit Customer Profile"
        maxWidth="520px"
      >
        <form onSubmit={handleEditCustomerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Customer Name" required value={editName} onChange={(e) => setEditName(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Input label="Phone Number" required value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            <Input label="WhatsApp Number" value={editWhatsapp} onChange={(e) => setEditWhatsapp(e.target.value)} />
          </div>

          <Input label="Email Address" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Select label="Customer Type" value={editType} onChange={(e) => setEditType(e.target.value)}>
              <option value="Individual">Individual</option>
              <option value="Company/Fleet">Company / Fleet</option>
              <option value="Insurance">Insurance</option>
              <option value="Dealer/Partner">Dealer / Partner</option>
            </Select>

            <Select label="Branch" value={editBranch} onChange={(e) => setEditBranch(e.target.value)}>
              <option value="Main Garage Branch">Main Garage Branch</option>
              <option value="Kochi South Branch">Kochi South Branch</option>
            </Select>
          </div>

          {editType !== 'Individual' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <Input label="Company Name" value={editCompany} onChange={(e) => setEditCompany(e.target.value)} />
              <Input label="GST Number" value={editGst} onChange={(e) => setEditGst(e.target.value)} />
            </div>
          )}

          <Textarea label="Address" rows={2} value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <Input label="City" value={editCity} onChange={(e) => setEditCity(e.target.value)} />
            <Input label="State" value={editState} onChange={(e) => setEditState(e.target.value)} />
            <Input label="PIN Code" value={editPincode} onChange={(e) => setEditPincode(e.target.value)} />
          </div>

          <button type="submit" style={{ height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', marginTop: '6px', cursor: 'pointer' }}>
            Save Profile Changes
          </button>
        </form>
      </ResponsiveModalSheet>

      {/* MODAL / SHEET: ADD NOTE */}
      <ResponsiveModalSheet
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        title="Add Customer Preference / Note"
        maxWidth="460px"
      >
        <form onSubmit={handleAddNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Textarea label="Note Details" required rows={3} value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="e.g. Prefers evening delivery..." />
          <button type="submit" style={{ height: '44px', borderRadius: '11px', border: 'none', backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}>
            Save Staff Note
          </button>
        </form>
      </ResponsiveModalSheet>

      <ResponsiveModalSheet
        isOpen={isAddDocumentOpen}
        onClose={() => setIsAddDocumentOpen(false)}
        title="Add Customer Document"
        maxWidth="520px"
      >
        <form className="customer-document-form" onSubmit={handleAddDocumentSubmit}>
          <Input label="Document Name" required value={docName} onChange={(e)=>setDocName(e.target.value)} placeholder="Toyota Innova RC"/>
          <div className="customer-document-form__grid">
            <Select label="Document Type" value={docType} onChange={(e)=>setDocType(e.target.value)}>
              <option>Vehicle RC</option>
              <option>Insurance</option>
              <option>Company Document</option>
              <option>GST / Tax Document</option>
              <option>Attachment</option>
            </Select>
            <Select label="Vehicle" value={docVehicle} onChange={(e)=>setDocVehicle(e.target.value)}>
              <option value="">Customer / Company level</option>
              {vehicles.map((vehicle)=><option key={vehicle.id} value={vehicle.regNo}>{vehicle.regNo}</option>)}
            </Select>
            <Input label="Expiry Date" type="date" value={docExpiry} onChange={(e)=>setDocExpiry(e.target.value)}/>
            <Select label="Status" value={docStatus} onChange={(e)=>setDocStatus(e.target.value)}>
              <option>Valid</option>
              <option>Expiring Soon</option>
              <option>Expired</option>
              <option>Archived</option>
            </Select>
          </div>
          <label className="customer-document-upload">
            <Upload size={16}/>
            <span>{docFileName || 'Choose attachment'}</span>
            <input type="file" onChange={(e)=>setDocFileName(e.target.files?.[0]?.name || '')}/>
          </label>
          <button className="customer-document-save" type="submit">Save Document</button>
        </form>
      </ResponsiveModalSheet>

      {/* MODAL / SHEET: MORE ACTIONS MENU */}
      <ResponsiveModalSheet
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title="Customer Actions"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              setIsMoreMenuOpen(false);
              setIsEditCustomerOpen(true);
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Edit size={16} /> Edit Customer Profile
          </button>

          <button
            onClick={() => {
              setIsMoreMenuOpen(false);
              navigate(`/invoices/create?customerId=${customer.id}`);
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <FileText size={16} /> Create Invoice
          </button>

          <button
            onClick={() => {
              setIsMoreMenuOpen(false);
              setIsRecordPaymentOpen(true);
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <CreditCard size={16} /> Record Payment
          </button>

          <button
            onClick={() => {
              setIsMoreMenuOpen(false);
              handleArchiveCustomer();
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--danger-soft)', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Archive size={16} /> Archive Customer
          </button>
        </div>
      </ResponsiveModalSheet>

    </div>
  );
};

