import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { hasPermission } from '../../utils/permissions';
import { ActiveRepairPanel } from './ActiveRepairPanel';
import { BookingList } from './BookingList';
import { JobDetailPanel } from './JobDetailPanel';

export const ServiceOperations = ({
  data,
  user,
  filterPeriod,
  setFilterPeriod,
  filterBranch,
  setFilterBranch,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    const firstId = data?.bookings?.[0]?.id || null;
    setSelectedBookingId((current) => {
      if (current && data?.bookings?.some((booking) => booking.id === current)) return current;
      return firstId;
    });
  }, [data?.bookings]);

  const selectedBooking = useMemo(
    () => data?.bookings?.find((booking) => booking.id === selectedBookingId) || data?.bookings?.[0],
    [data?.bookings, selectedBookingId],
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.bookings || [];
    return (data?.bookings || []).filter((booking) =>
      [booking.customer, booking.vehicle, booking.service, booking.id]
        .some((value) => String(value || '').toLowerCase().includes(query)),
    );
  }, [data?.bookings, search]);

  const activeRepair = data?.recentJobs?.[0];

  return (
    <section className="operations-card">
      <header className="operations-header">
        <div>
          <h2>Service Operations</h2>
          <p>Track today's bookings and repair progress.</p>
        </div>

        <div className="operations-tools">
          <select value={filterPeriod} onChange={(event) => setFilterPeriod(event.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select value={filterBranch} onChange={(event) => setFilterBranch(event.target.value)}>
            <option value="main">Main Garage</option>
            <option value="express">Express Bay</option>
          </select>

          {hasPermission(user, 'jobs.create') && (
            <button type="button" className="dashboard-button is-primary" onClick={() => onNavigate('/jobs/new')}>
              <Plus size={14} />
              New Job Card
            </button>
          )}
        </div>
      </header>

      <div className="operations-grid">
        <BookingList
          bookings={filteredBookings}
          search={search}
          onSearchChange={setSearch}
          selectedBooking={selectedBooking}
          onSelectBooking={setSelectedBookingId}
        />

        <JobDetailPanel
          selectedBooking={selectedBooking}
          jobProgress={data?.jobProgress}
          advisorName={user?.name}
          onViewJob={() => onNavigate('/jobs')}
        />

        <ActiveRepairPanel
          activeRepair={activeRepair}
          stockAlerts={data?.stockAlerts}
          onOpenJob={() => onNavigate(activeRepair?.id ? `/jobs/${activeRepair.id}` : '/jobs')}
          onReviewStock={() => onNavigate('/stock')}
        />
      </div>
    </section>
  );
};
