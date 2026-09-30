import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../../services/job.service';
import { ResponsiveModalSheet } from '../../components/common/ResponsiveModalSheet';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Camera, Wrench, Shield, Check } from 'lucide-react';

export const NewJobModal = ({ isOpen, onClose, onJobCreated }) => {
  const navigate = useNavigate();

  // Existing Customers Mock Data
  const existingCustomers = [
    { id: 'CUS-0001', name: 'Rahul Kumar', phone: '+91 98765 43210', email: 'rahul.k@gmail.com', vehicles: [{ id: 'VEH-0001', reg: 'KL 10 AB 1234', model: 'Toyota Innova 2.5V', km: '1,24,500 km' }] },
    { id: 'CUS-0002', name: 'Siddharth P', phone: '+91 98470 11223', email: 'siddharth.p@gmail.com', vehicles: [{ id: 'VEH-0002', reg: 'KL 07 BY 1234', model: 'Honda City 1.5 i-VTEC', km: '88,200 km' }] },
    { id: 'CUS-0003', name: 'Meera Menon', phone: '+91 97441 88990', email: 'meera.m@gmail.com', vehicles: [{ id: 'VEH-0003', reg: 'KL 07 CD 9090', model: 'Hyundai i20 Asta', km: '42,100 km' }] }
  ];

  // Mode States: 'existing' | 'new'
  const [customerMode, setCustomerMode] = useState('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUS-0001');

  // New Customer State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerWhatsapp, setNewCustomerWhatsapp] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerNotes, setNewCustomerNotes] = useState('');

  // Vehicle Mode State: 'existing' | 'new'
  const [vehicleMode, setVehicleMode] = useState('existing');
  const [selectedVehicleId, setSelectedVehicleId] = useState('VEH-0001');

  // New Vehicle State
  const [newVehicleReg, setNewVehicleReg] = useState('');
  const [newVehicleMake, setNewVehicleMake] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('Hatchback / Sedan');
  const [newVehicleFuel, setNewVehicleFuel] = useState('Petrol');
  const [newVehicleTransmission, setNewVehicleTransmission] = useState('Manual');
  const [newVehicleYear, setNewVehicleYear] = useState('2022');
  const [newVehicleColour, setNewVehicleColour] = useState('');
  const [newVehicleChassis, setNewVehicleChassis] = useState('');
  const [newVehicleNotes, setNewVehicleNotes] = useState('');

  // Job Details State
  const [branch, setBranch] = useState('Main Garage Branch');
  const [kilometre, setKilometre] = useState('1,24,500 km');
  const [fuelLevel, setFuelLevel] = useState('50%');
  const [priority, setPriority] = useState('Medium');
  const [assignedEmployeeName, setAssignedEmployeeName] = useState('Ajmal K');
  const [serviceAdvisor, setServiceAdvisor] = useState('Rajesh V');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('2026-09-14 05:30 PM');
  const [jobNotes, setJobNotes] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');

  // Complaints State
  const [complaints, setComplaints] = useState([
    { id: 1, description: 'Engine vibration during idling' }
  ]);

  // Accessories Checklist & Damage Collapsibles
  const [showAccessoriesSection, setShowAccessoriesSection] = useState(false);
  const [accessories, setAccessories] = useState([
    { name: 'Tool Kit', checked: true },
    { name: 'Spare Tyre', checked: true },
    { name: 'Jack & Rod', checked: true },
    { name: 'Music System / Touchscreen', checked: true },
    { name: 'Floor Mats', checked: false }
  ]);

  const [existingDamageNotes, setExistingDamageNotes] = useState('');

  // Form Validation Errors State
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Auto-fill vehicle when existing customer is picked
  useEffect(() => {
    if (customerMode === 'existing') {
      const cust = existingCustomers.find((c) => c.id === selectedCustomerId);
      if (cust && cust.vehicles.length > 0) {
        setSelectedVehicleId(cust.vehicles[0].id);
        setKilometre(cust.vehicles[0].km);
      }
    }
  }, [selectedCustomerId, customerMode]);

  if (!isOpen) return null;

  const handleAddComplaint = () => {
    setComplaints([
      ...complaints,
      { id: Date.now(), description: '' }
    ]);
  };

  const handleRemoveComplaint = (id) => {
    setComplaints(complaints.filter((c) => c.id !== id));
  };

  const handleComplaintChange = (id, value) => {
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, description: value } : c)));
  };

  const toggleAccessory = (index) => {
    const updated = [...accessories];
    updated[index].checked = !updated[index].checked;
    setAccessories(updated);
  };

  const validateForm = () => {
    const errs = {};
    if (customerMode === 'existing') {
      if (!selectedCustomerId) errs.customer = 'Please select a customer';
    } else {
      if (!newCustomerName.trim()) errs.customerName = 'Customer name is required';
      if (!newCustomerPhone.trim()) errs.customerPhone = 'Phone number is required';
    }

    if (customerMode === 'existing' && vehicleMode === 'existing') {
      if (!selectedVehicleId) errs.vehicle = 'Please select a vehicle';
    } else {
      if (!newVehicleReg.trim()) errs.vehicleReg = 'Registration number is required';
      if (!newVehicleModel.trim() && !newVehicleMake.trim()) errs.vehicleModel = 'Vehicle make/model is required';
    }

    if (!kilometre.trim()) errs.kilometre = 'Odometer reading is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (saving) return;

    let custName = newCustomerName;
    let custPhone = newCustomerPhone;
    let custEmail = newCustomerEmail;
    let custId = `CUS-${Date.now()}`;

    if (customerMode === 'existing') {
      const c = existingCustomers.find((x) => x.id === selectedCustomerId);
      if (c) {
        custName = c.name;
        custPhone = c.phone;
        custEmail = c.email;
        custId = c.id;
      }
    }

    let vehReg = newVehicleReg;
    let vehInfo = `${newVehicleMake} ${newVehicleModel}`.trim();
    let vehId = `VEH-${Date.now()}`;

    if (customerMode === 'existing' && vehicleMode === 'existing') {
      const c = existingCustomers.find((x) => x.id === selectedCustomerId);
      const v = c?.vehicles.find((x) => x.id === selectedVehicleId);
      if (v) {
        vehReg = v.reg;
        vehInfo = v.model;
        vehId = v.id;
      }
    }

    const payload = {
      customerId: custId,
      customerName: custName || 'Walk-in Customer',
      customerPhone: custPhone || '+91 98765 00000',
      customerEmail: custEmail || '',
      vehicleId: vehId,
      vehicleInfo: vehInfo || 'Custom Vehicle',
      vehicleReg: vehReg || 'KL-01-TEMP',
      branch,
      kilometre,
      fuelLevel,
      priority,
      assignedEmployeeName,
      serviceAdvisor,
      expectedDeliveryDate,
      notes: jobNotes,
      accessories: accessories.filter((a) => a.checked).map((a) => a.name),
      existingDamage: existingDamageNotes,
      complaints: complaints.filter((c) => c.description.trim()).map((c) => ({
        id: `CMP-${Date.now()}`,
        description: c.description,
        wording: c.description,
        status: 'Checked In',
        relatedService: 'Initial Inspection'
      })),
      advancePaid: Number(advancePaid || 0)
    };

    setSaving(true);
    try {
      const created = await jobService.createJob(payload);
      if (onJobCreated) onJobCreated(created);
      onClose();
      navigate(`/jobs/${created.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Common Field Styles
  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '4px'
  };

  const inputStyle = {
    width: '100%',
    height: '46px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface-2)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const sectionCardStyle = {
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const selectedCustObj = existingCustomers.find((c) => c.id === selectedCustomerId);
  const selectedVehObj = selectedCustObj?.vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <ResponsiveModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Workshop Job Card"
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* STEP 1: CUSTOMER */}
        <div style={sectionCardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            1. Customer
          </div>

          {/* Segmented Pill Toggle */}
          <div className="customer-toggle">
            <div
              className="customer-toggle-indicator"
              style={{ transform: customerMode === 'new' ? 'translateX(100%)' : 'translateX(0%)' }}
            />
            <button
              type="button"
              aria-pressed={customerMode === 'existing'}
              onClick={() => { setCustomerMode('existing'); setErrors({}); }}
              className={customerMode === 'existing' ? 'active' : ''}
            >
              Existing Customer
            </button>
            <button
              type="button"
              aria-pressed={customerMode === 'new'}
              onClick={() => { setCustomerMode('new'); setErrors({}); }}
              className={customerMode === 'new' ? 'active' : ''}
            >
              Create New
            </button>
          </div>

          {customerMode === 'existing' ? (
            <div>
              <label style={labelStyle}>Select Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {existingCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
              {selectedCustObj && (
                <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Phone: <strong style={{ color: 'var(--text-primary)' }}>{selectedCustObj.phone}</strong> | Email: {selectedCustObj.email}
                </div>
              )}
              {errors.customer && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.customer}</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Customer Name *</label>
                <input
                  type="text"
                  placeholder="Rahul Kumar"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  style={inputStyle}
                />
                {errors.customerName && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.customerName}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  style={inputStyle}
                />
                {errors.customerPhone && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.customerPhone}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>WhatsApp Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newCustomerWhatsapp}
                  onChange={(e) => setNewCustomerWhatsapp(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input
                  type="text"
                  placeholder="Street, City, PIN"
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <input
                  type="text"
                  placeholder="VIP customer / Special instructions"
                  value={newCustomerNotes}
                  onChange={(e) => setNewCustomerNotes(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: VEHICLE */}
        <div style={sectionCardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            2. Vehicle
          </div>

          {customerMode === 'existing' && (
            <div className="customer-toggle">
              <div
                className="customer-toggle-indicator"
                style={{ transform: vehicleMode === 'new' ? 'translateX(100%)' : 'translateX(0%)' }}
              />
              <button
                type="button"
                aria-pressed={vehicleMode === 'existing'}
                onClick={() => setVehicleMode('existing')}
                className={vehicleMode === 'existing' ? 'active' : ''}
              >
                Existing Vehicle
              </button>
              <button
                type="button"
                aria-pressed={vehicleMode === 'new'}
                onClick={() => setVehicleMode('new')}
                className={vehicleMode === 'new' ? 'active' : ''}
              >
                Add Vehicle
              </button>
            </div>
          )}

          {customerMode === 'existing' && vehicleMode === 'existing' ? (
            <div>
              <label style={labelStyle}>Select Vehicle *</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {selectedCustObj?.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} - {v.reg}
                  </option>
                ))}
              </select>
              {selectedVehObj && (
                <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedVehObj.model}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>{selectedVehObj.reg}</div>
                </div>
              )}
              {errors.vehicle && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.vehicle}</div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Registration Number *</label>
                <input
                  type="text"
                  placeholder="KL 10 AB 1234"
                  value={newVehicleReg}
                  onChange={(e) => setNewVehicleReg(e.target.value)}
                  style={{ ...inputStyle, textTransform: 'uppercase' }}
                />
                {errors.vehicleReg && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.vehicleReg}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Make *</label>
                <input
                  type="text"
                  placeholder="Toyota"
                  value={newVehicleMake}
                  onChange={(e) => setNewVehicleMake(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Model *</label>
                <input
                  type="text"
                  placeholder="Innova 2.5V"
                  value={newVehicleModel}
                  onChange={(e) => setNewVehicleModel(e.target.value)}
                  style={inputStyle}
                />
                {errors.vehicleModel && (
                  <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.vehicleModel}</div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Vehicle Type</label>
                <select
                  value={newVehicleType}
                  onChange={(e) => setNewVehicleType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Hatchback / Sedan">Hatchback / Sedan</option>
                  <option value="SUV / MUV">SUV / MUV</option>
                  <option value="Luxury / Premium">Luxury / Premium</option>
                  <option value="Commercial / Truck">Commercial / Truck</option>
                  <option value="Two Wheeler / Bike">Two Wheeler / Bike</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fuel Type</label>
                <select
                  value={newVehicleFuel}
                  onChange={(e) => setNewVehicleFuel(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG / LPG">CNG / LPG</option>
                  <option value="Electric (EV)">Electric (EV)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Transmission</label>
                <select
                  value={newVehicleTransmission}
                  onChange={(e) => setNewVehicleTransmission(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic (AT/CVT/DCT)">Automatic (AT/CVT/DCT)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Manufacturing Year</label>
                <input
                  type="text"
                  placeholder="2022"
                  value={newVehicleYear}
                  onChange={(e) => setNewVehicleYear(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Colour</label>
                <input
                  type="text"
                  placeholder="Pearl White"
                  value={newVehicleColour}
                  onChange={(e) => setNewVehicleColour(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>VIN / Chassis Number</label>
                <input
                  type="text"
                  placeholder="MA3FXXXXXXXXXXXXX"
                  value={newVehicleChassis}
                  onChange={(e) => setNewVehicleChassis(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <input
                  type="text"
                  placeholder="Existing scratches on rear bumper"
                  value={newVehicleNotes}
                  onChange={(e) => setNewVehicleNotes(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: JOB DETAILS */}
        <div style={sectionCardStyle}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
            3. Job Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={labelStyle}>Assigned Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={inputStyle}
              >
                <option value="Main Garage Branch">Main Garage Branch</option>
                <option value="Kochi South Branch">Kochi South Branch</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Kilometre (Odometer) *</label>
              <input
                type="text"
                value={kilometre}
                onChange={(e) => setKilometre(e.target.value)}
                placeholder="1,24,500 km"
                style={inputStyle}
              />
              {errors.kilometre && (
                <div style={{ color: 'var(--danger)', fontSize: '11px', marginTop: '4px' }}>{errors.kilometre}</div>
              )}
            </div>

            {/* 2 Column compact row for Fuel & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Fuel Level</label>
                <select
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Reserve">Low</option>
                  <option value="25%">25%</option>
                  <option value="50%">50%</option>
                  <option value="75%">75%</option>
                  <option value="100%">Full</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={inputStyle}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Expected Delivery</label>
              <input
                type="text"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                placeholder="2026-09-14 05:30 PM"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Service Advisor</label>
              <select
                value={serviceAdvisor}
                onChange={(e) => setServiceAdvisor(e.target.value)}
                style={inputStyle}
              >
                <option value="Rajesh V">Rajesh V (Lead SA)</option>
                <option value="Anil Kumar">Anil Kumar (Service Advisor)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Notes / Instructions</label>
              <input
                type="text"
                value={jobNotes}
                onChange={(e) => setJobNotes(e.target.value)}
                placeholder="Special customer requests or remarks"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* STEP 4: COMPLAINTS */}
        <div style={sectionCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              4. Complaints
            </div>
            <button
              type="button"
              onClick={handleAddComplaint}
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Plus size={14} /> Add Complaint
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {complaints.map((c, index) => (
              <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder={`Complaint #${index + 1} (e.g. Engine noise during idling)`}
                  value={c.description}
                  onChange={(e) => handleComplaintChange(c.id, e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {complaints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveComplaint(c.id)}
                    style={{
                      width: '40px',
                      height: '46px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--danger-soft, rgba(239, 68, 68, 0.1))',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 5: DAMAGE & ACCESSORIES (COMPACT EXPANDABLE) */}
        <div style={sectionCardStyle}>
          <div
            onClick={() => setShowAccessoriesSection(!showAccessoriesSection)}
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              5. Damage / Accessories
            </div>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              {showAccessoriesSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {showAccessoriesSection && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
              <div>
                <label style={labelStyle}>Accessories Checked</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                  {accessories.map((acc, idx) => (
                    <label key={acc.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={acc.checked}
                        onChange={() => toggleAccessory(idx)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <span>{acc.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Existing Vehicle Damage Notes</label>
                <input
                  type="text"
                  placeholder="Scratch on left front door, dent on rear bumper"
                  value={existingDamageNotes}
                  onChange={(e) => setExistingDamageNotes(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* PRIMARY ACTION FOOTER (STICKY) */}
        <div style={{
          display: 'flex',
          gap: '10px',
          padding: '12px 0 4px 0',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '48px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-2)',
              color: 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 2,
              height: '48px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Save size={18} /> {saving ? 'Creating Job...' : 'Create Job Card'}
          </button>
        </div>

      </form>
    </ResponsiveModalSheet>
  );
};
