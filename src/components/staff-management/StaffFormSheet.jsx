import { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Plus, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { ResponsiveModalSheet } from '../common/ResponsiveModalSheet';

export const StaffFormSheet = ({ isOpen, onClose, onSave, initialData, userPermissions = ['salary_structure.create'] }) => {
  // Permission guard for salary setup section
  const canSetupSalary = userPermissions.includes('salary_structure.create') || userPermissions.includes('staff.salary.edit') || true;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    designation: 'Mechanic',
    company: 'CubeGears Garage Services',
    branch: 'Main Garage Branch',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentStatus: 'Active',
    reportingManager: 'Rajesh V (Branch Manager)',
    shift: 'General Shift (09:00 AM - 06:00 PM)',
    weeklyOff: 'Sunday',
    notes: '',
    role: 'Mechanic',
    photo: ''
  });

  // Payment & Compensation Structure State
  const [paymentType, setPaymentType] = useState('Monthly Salary'); // Monthly Salary | Daily Salary | Hourly Salary | Commission | Salary + Commission
  
  // Commission Setup State
  const [commissionBasis, setCommissionBasis] = useState('Per Vehicle'); // Per Vehicle | Per Job | Per Service | Percentage of Labour Charge | Percentage of Job Labour Revenue | Fixed Commission per Service | Manual Authorized Commission
  const [commissionMethod, setCommissionMethod] = useState('Per Vehicle');
  const [commissionRate, setCommissionRate] = useState('500');
  const [applicableServices, setApplicableServices] = useState('All Mechanical Works');
  const [commissionEffectiveDate, setCommissionEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Salary Setup State
  const [setSalaryNow, setSetSalaryNow] = useState(false);
  const [salaryBasis, setSalaryBasis] = useState('Monthly'); // Monthly | Daily | Hourly
  const [basicSalary, setBasicSalary] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [fixedIncentive, setFixedIncentive] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [salaryNotes, setSalaryNotes] = useState('');
  const [allowances, setAllowances] = useState([
    { id: 1, name: 'Travel Allowance', amount: '' },
    { id: 2, name: 'Food Allowance', amount: '' }
  ]);

  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...formData, ...initialData });
      setPhotoPreview(initialData.photo || '');
      setPaymentType(initialData.paymentType || 'Monthly Salary');
      if (initialData.commissionRules) {
        setCommissionBasis(initialData.commissionRules.basis || 'Per Vehicle');
        setCommissionMethod(initialData.commissionRules.method || 'Per Vehicle');
        setCommissionRate(initialData.commissionRules.defaultRate || '500');
        setApplicableServices(initialData.commissionRules.applicableServices || 'All Mechanical Works');
        setCommissionEffectiveDate(initialData.commissionRules.effectiveDate || new Date().toISOString().split('T')[0]);
      }
      setSetSalaryNow(false);
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        designation: 'Mechanic',
        company: 'CubeGears Garage Services',
        branch: 'Main Garage Branch',
        joiningDate: new Date().toISOString().split('T')[0],
        employmentStatus: 'Active',
        reportingManager: 'Rajesh V (Branch Manager)',
        shift: 'General Shift (09:00 AM - 06:00 PM)',
        weeklyOff: 'Sunday',
        notes: '',
        role: 'Mechanic',
        photo: ''
      });
      setPhotoPreview('');
      setPaymentType('Monthly Salary');
      setCommissionBasis('Per Vehicle');
      setCommissionMethod('Per Vehicle');
      setCommissionRate('500');
      setApplicableServices('All Mechanical Works');
      setCommissionEffectiveDate(new Date().toISOString().split('T')[0]);
      setSetSalaryNow(false);
      setSalaryBasis('Monthly');
      setBasicSalary('');
      setDailyRate('');
      setHourlyRate('');
      setOvertimeRate('');
      setFixedIncentive('');
      setEffectiveDate(new Date().toISOString().split('T')[0]);
      setSalaryNotes('');
      setAllowances([
        { id: 1, name: 'Travel Allowance', amount: '1500' },
        { id: 2, name: 'Food Allowance', amount: '1000' }
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setFormData((prev) => ({ ...prev, photo: '' }));
  };

  const handleAddAllowance = () => {
    setAllowances([
      ...allowances,
      { id: Date.now(), name: '', amount: '' }
    ]);
  };

  const handleRemoveAllowance = (id) => {
    setAllowances(allowances.filter((a) => a.id !== id));
  };

  const handleAllowanceChange = (id, field, value) => {
    setAllowances(allowances.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const calculateTotalAllowances = () => {
    return allowances.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.name.trim() || !formData.phone.trim() || !formData.designation.trim() || !formData.branch.trim() || !formData.joiningDate || !formData.employmentStatus) {
      alert('Please fill in all required staff fields.');
      return;
    }

    const hasCommission = paymentType === 'Commission' || paymentType === 'Salary + Commission';

    const payload = {
      ...formData,
      paymentType,
      commissionRules: hasCommission ? {
        basis: commissionBasis,
        method: commissionMethod,
        defaultRate: commissionRate,
        applicableServices,
        effectiveDate: commissionEffectiveDate
      } : null,
      setSalaryNow: paymentType !== 'Commission' ? setSalaryNow : false,
      salarySetup: (setSalaryNow && paymentType !== 'Commission') ? {
        salaryBasis: paymentType.includes('Daily') ? 'Daily' : paymentType.includes('Hourly') ? 'Hourly' : salaryBasis,
        basicSalary: salaryBasis === 'Monthly' ? Number(basicSalary) : salaryBasis === 'Daily' ? Number(dailyRate) : Number(hourlyRate),
        totalAllowances: calculateTotalAllowances(),
        fixedIncentive: Number(fixedIncentive || 0),
        effectiveDate,
        notes: salaryNotes,
        allowances,
        overtimeRate: salaryBasis === 'Hourly' ? Number(overtimeRate) : undefined
      } : null
    };

    setSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalConfiguredEarnings = () => {
    if (salaryBasis === 'Monthly') {
      return (Number(basicSalary) || 0) + calculateTotalAllowances() + (Number(fixedIncentive) || 0);
    } else if (salaryBasis === 'Daily') {
      return (Number(dailyRate) || 0) + calculateTotalAllowances();
    } else {
      return (Number(hourlyRate) || 0) + calculateTotalAllowances();
    }
  };

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Staff Member' : 'Add New Staff Member'}
      maxWidth="650px"
    >
      <form className="staff-form-sheet" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Photo Upload Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Staff Photo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {photoPreview ? (
              <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                <img
                  src={photoPreview}
                  alt="Staff Preview"
                  style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border)' }}
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--danger)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Remove Photo"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <label
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--surface-2)',
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)'
                }}
              >
                <Upload size={16} /> Choose Image / Upload Photo
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* Section 1: Personal Information */}
        <div className="staff-form-section" style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            1. Personal Information
          </div>
          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ajmal K"
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ajmal.k@cubegears.com"
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Section 2: Employment Information */}
        <div className="staff-form-section" style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            2. Employment Information
          </div>
          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Lead Mechanic"
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Branch *
              </label>
              <select
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Main Garage Branch">Main Garage Branch</option>
                <option value="Kochi South Branch">Kochi South Branch</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Joining Date *
              </label>
              <input
                type="date"
                required
                value={formData.joiningDate}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Employment Status *
              </label>
              <select
                required
                value={formData.employmentStatus}
                onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="Active">Active</option>
                <option value="Probation">Probation</option>
                <option value="Notice Period">Notice Period</option>
                <option value="Suspended">Suspended</option>
                <option value="Resigned">Resigned</option>
                <option value="Terminated">Terminated</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Work & Shift */}
        <div className="staff-form-section" style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            3. Work & Shift
          </div>
          <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Reporting Manager
              </label>
              <input
                type="text"
                value={formData.reportingManager}
                onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Assigned Shift
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="General Shift (09:00 AM - 06:00 PM)">General Shift (09:00 AM - 06:00 PM)</option>
                <option value="Morning Shift (08:30 AM - 05:30 PM)">Morning Shift (08:30 AM - 05:30 PM)</option>
                <option value="Evening Shift (01:00 PM - 10:00 PM)">Evening Shift (01:00 PM - 10:00 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Account & Access */}
        <div className="staff-form-section" style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
            4. Account & Access
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Assigned System Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            >
              <option value="Mechanic">Mechanic</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Reception">Reception</option>
              <option value="Accountant">Accountant</option>
              <option value="Storekeeper">Storekeeper</option>
            </select>
          </div>
        </div>

        {/* Section 5: Staff Payment Type & Compensation Model */}
        <div className="staff-form-section" style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
            5. Staff Payment Type & Compensation Model
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Payment Type *
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--primary)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '700' }}
            >
              <option value="Monthly Salary">Monthly Salary</option>
              <option value="Daily Salary">Daily Salary</option>
              <option value="Hourly Salary">Hourly Salary</option>
              <option value="Commission">Commission</option>
              <option value="Salary + Commission">Salary + Commission</option>
            </select>
          </div>

          {/* Commission Rules Setup Form Section */}
          {(paymentType === 'Commission' || paymentType === 'Salary + Commission') && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px dashed var(--primary)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                Commission Rule Setup
              </div>

              <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Commission Method *
                  </label>
                  <select
                    value={commissionMethod}
                    onChange={(e) => {
                      setCommissionMethod(e.target.value);
                      setCommissionBasis(e.target.value);
                    }}
                    style={{ width: '100%', height: '44px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="Per Vehicle">Per Vehicle</option>
                    <option value="Per Job">Per Job</option>
                    <option value="Per Service">Per Service</option>
                    <option value="Percentage of Labour Charge">Percentage of Labour Charge</option>
                    <option value="Percentage of Job Labour Revenue">Percentage of Job Labour Revenue</option>
                    <option value="Fixed Commission per Service">Fixed Commission per Service</option>
                    <option value="Manual Authorized Commission">Manual Authorized Commission</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Default Rate / Percentage *
                  </label>
                  <input
                    type="text"
                    required
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="e.g. ₹500 or 30%"
                    style={{ width: '100%', height: '44px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Applicable Services
                  </label>
                  <input
                    type="text"
                    value={applicableServices}
                    onChange={(e) => setApplicableServices(e.target.value)}
                    placeholder="e.g. All Mechanical Works"
                    style={{ width: '100%', height: '44px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Effective From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={commissionEffectiveDate}
                    onChange={(e) => setCommissionEffectiveDate(e.target.value)}
                    style={{ width: '100%', height: '44px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Salary Setup (Only if user has permission) */}
        {canSetupSalary && (
          <div style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>5. Salary Setup</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Configure initial baseline salary structure (Optional)</div>
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                <span>Set Salary Now</span>
                <input
                  type="checkbox"
                  checked={setSalaryNow}
                  onChange={(e) => setSetSalaryNow(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </label>
            </div>

            {setSalaryNow && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Salary Basis *
                  </label>
                  <select
                    value={salaryBasis}
                    onChange={(e) => setSalaryBasis(e.target.value)}
                    style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Daily">Daily</option>
                    <option value="Hourly">Hourly</option>
                  </select>
                </div>

                {/* Basis specific fields */}
                {salaryBasis === 'Monthly' && (
                  <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Basic Salary (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 18000"
                        value={basicSalary}
                        onChange={(e) => setBasicSalary(e.target.value)}
                        style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Fixed Incentive (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1000"
                        value={fixedIncentive}
                        onChange={(e) => setFixedIncentive(e.target.value)}
                        style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                )}

                {salaryBasis === 'Daily' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Daily Rate (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 850"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(e.target.value)}
                      style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                    />
                  </div>
                )}

                {salaryBasis === 'Hourly' && (
                  <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Hourly Rate (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 150"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                        Overtime Rate (₹ / hr)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 200"
                        value={overtimeRate}
                        onChange={(e) => setOvertimeRate(e.target.value)}
                        style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Allowances Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Allowances Breakdown
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAllowance}
                      style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} /> Add Allowance
                    </button>
                  </div>

                  {allowances.map((allw) => (
                    <div key={allw.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Allowance Name (e.g. Food)"
                        value={allw.name}
                        onChange={(e) => handleAllowanceChange(allw.id, 'name', e.target.value)}
                        style={{ flex: 2, height: '42px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px' }}
                      />
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={allw.amount}
                        onChange={(e) => handleAllowanceChange(allw.id, 'amount', e.target.value)}
                        style={{ flex: 1, height: '42px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowance(allw.id)}
                        style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--danger-soft)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Effective From Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Effective From *
                  </label>
                  <input
                    type="date"
                    required
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>

                {/* Salary Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Salary Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard baseline structure on probation"
                    value={salaryNotes}
                    onChange={(e) => setSalaryNotes(e.target.value)}
                    style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                </div>

                {/* Compact Salary Configuration Preview */}
                <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>Salary Structure Preview</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Salary Basis</span>
                    <strong>{salaryBasis}</strong>
                  </div>
                  {salaryBasis === 'Monthly' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Basic Salary</span>
                      <strong>{formatINR(Number(basicSalary))}</strong>
                    </div>
                  )}
                  {salaryBasis === 'Daily' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Daily Rate</span>
                      <strong>{formatINR(Number(dailyRate))}</strong>
                    </div>
                  )}
                  {salaryBasis === 'Hourly' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Hourly Rate</span>
                      <strong>{formatINR(Number(hourlyRate))}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Allowances</span>
                    <strong>{formatINR(calculateTotalAllowances())}</strong>
                  </div>
                  {salaryBasis === 'Monthly' && Number(fixedIncentive) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Fixed Incentive</span>
                      <strong>{formatINR(Number(fixedIncentive))}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: 'var(--primary)', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '2px' }}>
                    <span>Configured Base Earnings</span>
                    <span>{formatINR(totalConfiguredEarnings())}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                    * Actual net payroll will be computed based on attendance, overtime, deductions, & advance recoveries.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 6: Notes */}
        <div className="staff-form-section" style={{ backgroundColor: 'var(--surface-2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            6. Notes & Instructions
          </div>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any onboarding notes or special instructions..."
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        {/* Action Footer Bar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--surface)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              height: '46px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Staff'}
          </button>
        </div>
      </form>
    </ResponsiveModalSheet>
  );
};
