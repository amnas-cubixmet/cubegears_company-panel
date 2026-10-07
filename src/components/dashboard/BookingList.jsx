import React from 'react';
import { Search } from 'lucide-react';
import { statusClass } from './dashboard.utils';

export const BookingList = ({
  bookings,
  search,
  onSearchChange,
  selectedBooking,
  onSelectBooking,
}) => (
  <div className="booking-pane">
    <div className="dashboard-search">
      <Search size={14} />
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search customer, vehicle or job"
      />
    </div>

    <div className="booking-list">
      {bookings.map((booking) => {
        const active = booking.id === selectedBooking?.id;
        return (
          <button
            key={booking.id}
            type="button"
            className={`booking-row ${active ? 'is-active' : ''}`}
            onClick={() => onSelectBooking(booking.id)}
          >
            <div className="booking-row-top">
              <strong>{booking.id} · {booking.customer}</strong>
              <span className={`status-pill ${statusClass(booking.status)}`}>{booking.status}</span>
            </div>
            <span className="booking-vehicle">{booking.vehicle}</span>
            <div className="booking-row-bottom">
              <span>{booking.service}</span>
              <time>{booking.time}</time>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
