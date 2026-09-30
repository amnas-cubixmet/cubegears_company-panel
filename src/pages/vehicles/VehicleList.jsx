import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarClock,
  Car,
  ChevronRight,
  ClipboardList,
  Edit3,
  Gauge,
  Plus,
  Search,
  ShieldCheck,
  User
} from 'lucide-react';
import { vehicleService } from '../../services/vehicle.service';
import { customerService } from '../../services/customer.service';
import { jobService } from '../../services/job.service';
import '../../styles/vehicle-management.css';

const OPEN_JOB_STATUSES = new Set([
  'New',
  'Checked In',
  'Inspection',
  'Estimate Pending',
  'Awaiting Approval',
  'Approved',
  'In Progress',
  'Waiting for Parts',
  'QC',
  'Quality Check',
  'Ready for Delivery'
]);

const dateDiff = (dateValue) => {
  if (!dateValue) return null;
  const target = new Date(dateValue);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.ceil((target - start) / 86400000);
};

const Metric = ({ label, value, icon: Icon, tone = 'primary', note }) => (
  <article className="vehicle-metric-card">
    <div className="vehicle-metric-card__top">
      <span>{label}</span>
      <i className={`is-${tone}`}><Icon size={16}/></i>
    </div>
    <strong>{value}</strong>
    {note ? <small>{note}</small> : null}
  </article>
);

const statusText = (vehicle) => {
  const serviceDays = dateDiff(vehicle.nextServiceDue);
  const insuranceDays = dateDiff(vehicle.insuranceExpiry);

  if (insuranceDays !== null && insuranceDays < 0) return { label: 'Insurance Expired', tone: 'danger' };
  if (serviceDays !== null && serviceDays <= 30) return { label: serviceDays < 0 ? 'Service Overdue' : 'Service Due', tone: 'warning' };
  return { label: vehicle.status || 'Active', tone: 'success' };
};

export const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [vehicleRows, customers] = await Promise.all([
          vehicleService.getVehicles(),
          customerService.getCustomers()
        ]);

        const customerMap = new Map(customers.map((customer) => [String(customer.id), customer]));

        const enriched = await Promise.all(vehicleRows.map(async (vehicle) => {
          const customer = customerMap.get(String(vehicle.customerId));
          const history = await jobService.getVehicleHistory(vehicle.registration);
          const openJob = history.find((job) => OPEN_JOB_STATUSES.has(job.status)) || null;
          const latestJob = history[0] || null;

          return {
            ...vehicle,
            customer,
            customerName: customer?.name || vehicle.customerName || 'Unknown Customer',
            customerPhone: customer?.phone || '',
            history,
            openJob,
            latestJob
          };
        }));

        if (alive) setVehicles(enriched);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!q) return vehicles;

    return vehicles.filter((vehicle) =>
      [
        vehicle.registration,
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.customerName,
        vehicle.customerPhone
      ].some((value) => String(value || '').toLowerCase().replace(/\s+/g, '').includes(q))
    );
  }, [vehicles, query]);

  const metrics = useMemo(() => {
    const serviceDue = vehicles.filter((vehicle) => {
      const days = dateDiff(vehicle.nextServiceDue);
      return days !== null && days <= 30;
    }).length;

    const insuranceDue = vehicles.filter((vehicle) => {
      const days = dateDiff(vehicle.insuranceExpiry);
      return days !== null && days <= 30;
    }).length;

    return {
      total: vehicles.length,
      active: vehicles.filter((vehicle) => vehicle.status !== 'Inactive').length,
      openJobs: vehicles.filter((vehicle) => vehicle.openJob).length,
      serviceDue,
      insuranceDue
    };
  }, [vehicles]);

  if (loading) {
    return <div className="vehicle-empty">Loading vehicles...</div>;
  }

  return (
    <div className="vehicle-management-page cg-vehicles">
      <header className="vehicle-page-header">
        <div>
          <h1>Vehicles</h1>
          <p>Customer vehicles, registration details, workshop history, reminders and active Job Cards.</p>
        </div>
        <button type="button" className="vehicle-primary-button" onClick={() => navigate('/vehicles/new')}>
          <Plus size={15}/> Add Vehicle
        </button>
      </header>

      <div className="vehicle-metric-grid">
        <Metric label="Total Vehicles" value={metrics.total} icon={Car}/>
        <Metric label="Active Vehicles" value={metrics.active} icon={ShieldCheck} tone="success"/>
        <Metric label="Open Jobs" value={metrics.openJobs} icon={ClipboardList}/>
        <Metric label="Service Due" value={metrics.serviceDue} icon={CalendarClock} tone="warning"/>
        <Metric label="Insurance Due" value={metrics.insuranceDue} icon={AlertTriangle} tone="warning"/>
      </div>

      <label className="vehicle-search">
        <Search size={16}/>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search registration number, VIN, make/model, customer or phone"
        />
      </label>

      <section className="vehicle-directory-panel">
        <div className="vehicle-section-header">
          <div>
            <h2>Vehicle Directory</h2>
            <p>{filtered.length} vehicle(s) found.</p>
          </div>
        </div>

        <div className="vehicle-card-grid">
          {filtered.map((vehicle) => {
            const status = statusText(vehicle);
            const lastService = vehicle.latestJob?.createdDate || vehicle.lastServiceDate || '—';
            const odometer = vehicle.latestJob?.kilometre || vehicle.odometer || '—';

            return (
              <article key={vehicle.id} className="vehicle-directory-card">
                <div className="vehicle-directory-card__head">
                  <div>
                    <strong>{vehicle.registration || 'No Registration'}</strong>
                    <span>{vehicle.make} {vehicle.model}{vehicle.variant ? ` · ${vehicle.variant}` : ''}</span>
                  </div>
                  <span className={`vehicle-status is-${status.tone}`}>{status.label}</span>
                </div>

                <div className="vehicle-owner-row">
                  <User size={14}/>
                  <div>
                    <strong>{vehicle.customerName}</strong>
                    <span>{vehicle.customerPhone || vehicle.customerId || 'No owner contact'}</span>
                  </div>
                </div>

                <div className="vehicle-detail-grid">
                  <div><span>Year</span><strong>{vehicle.year || '—'}</strong></div>
                  <div><span>Fuel</span><strong>{vehicle.fuelType || '—'}</strong></div>
                  <div><span>Odometer</span><strong>{odometer}</strong></div>
                  <div><span>Last Service</span><strong>{lastService}</strong></div>
                  <div><span>Next Service</span><strong>{vehicle.nextServiceDue || 'Not set'}</strong></div>
                  <div><span>Insurance</span><strong>{vehicle.insuranceExpiry || 'Not set'}</strong></div>
                </div>

                {vehicle.openJob ? (
                  <button
                    type="button"
                    className="vehicle-open-job"
                    onClick={() => navigate(`/jobs/${vehicle.openJob.id}/overview`)}
                  >
                    <ClipboardList size={13}/>
                    <span>{vehicle.openJob.jobNumber || vehicle.openJob.id}</span>
                    <b>{vehicle.openJob.status}</b>
                    <ChevronRight size={13}/>
                  </button>
                ) : null}

                <div className="vehicle-card-actions">
                  <button type="button" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                    <Car size={13}/> View Vehicle
                  </button>
                  <button type="button" onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}>
                    <Edit3 size={13}/> Edit
                  </button>
                  <button
                    type="button"
                    className="is-primary"
                    onClick={() => navigate(`/jobs/new?customerId=${vehicle.customerId || ''}&vehicle=${encodeURIComponent(vehicle.registration || '')}`)}
                  >
                    <ClipboardList size={13}/> New Job Card
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!filtered.length ? (
          <div className="vehicle-empty">No vehicles matched your search.</div>
        ) : null}
      </section>
    </div>
  );
};

export const AddVehicle = VehicleList;

export default VehicleList;
