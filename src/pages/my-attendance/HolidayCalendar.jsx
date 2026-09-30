import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { attendanceService } from '../../services/attendance.service';

export const HolidayCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // Sep 2026
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getCalendarEvents(currentDate.getMonth() + 1, currentDate.getFullYear());
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 12));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysArray.push(d);
  }

  const formatDateStr = (d) => {
    if (!d) return null;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const getEventForDate = (d) => {
    const dateStr = formatDateStr(d);
    if (!dateStr) return null;
    return events.find(e => e.date === dateStr);
  };

  const getDotColor = (type) => {
    switch (type) {
      case 'Company Holiday': return 'var(--danger)';
      case 'Branch Holiday': return 'var(--warning)';
      case 'Approved Leave': return 'var(--primary)';
      case 'Weekly Off': return 'var(--text-muted)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className="attendance-module attendance-calendar-page" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* Month Navigation Controls */}
      <div className="attendance-toolbar-card calendar-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '10px 14px'
      }}>
        <div className="calendar-month-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            className="attendance-icon-button calendar-nav-button"
            aria-label="Previous month"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="calendar-month-label" style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="attendance-icon-button calendar-nav-button"
            aria-label="Next month"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Compact Today Button */}
        <button
          onClick={handleToday}
          className="attendance-secondary-button calendar-today-button"
          style={{
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <span className="desktop-table-view">Today · 12 Sep</span>
          <span className="mobile-card-view">Today</span>
        </button>
      </div>

      {/* Legend Container */}
      <div className="calendar-legend" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 14px',
        fontSize: '12px',
        color: 'var(--text-muted)',
        padding: '2px 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
          <span>Company Holiday</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
          <span>Branch Holiday</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
          <span>Approved Leave</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
          <span>Weekly Off</span>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="attendance-card calendar-shell" style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Day Headers (7 Columns) */}
        <div className="calendar-weekdays" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '6px',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          {dayLabels.map(day => (
            <div key={day} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid with responsive .calendar-day class */}
        <div className="calendar-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '6px'
        }}>
          {daysArray.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} style={{ visibility: 'hidden' }} />;
            }

            const evt = getEventForDate(dayNum);
            const isToday = dayNum === 12 && month === 8 && year === 2026;
            const isSelected = selectedDateDetails?.dayNum === dayNum;

            return (
              <div
                key={`day-${dayNum}`}
                className="calendar-day"
                onClick={() => setSelectedDateDetails({ dayNum, evt })}
                style={{
                  backgroundColor: isSelected ? 'var(--primary-soft)' : 'var(--surface-2)',
                  borderColor: isToday ? 'var(--primary)' : (isSelected ? 'var(--primary)' : 'var(--border)'),
                  borderWidth: isToday ? '1.5px' : '1px'
                }}
              >
                {/* Day Header & Number */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isToday ? '800' : (evt ? '700' : '500'),
                    color: isToday ? 'var(--primary)' : 'var(--text-primary)'
                  }}>
                    {dayNum}
                  </span>

                  {/* Desktop Status Badge Snippet */}
                  {evt && (
                    <span className="desktop-table-view" style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: getDotColor(evt.type),
                      backgroundColor: 'var(--surface-3)',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}>
                      {evt.type === 'Weekly Off' ? 'Off' : 'Event'}
                    </span>
                  )}
                </div>

                {/* Desktop Event Title */}
                {evt && (
                  <span className="desktop-table-view" style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%',
                    textAlign: 'left'
                  }}>
                    {evt.title}
                  </span>
                )}

                {/* Mobile Status Dot */}
                {evt && (
                  <div className="mobile-card-view" style={{
                    position: 'absolute',
                    bottom: '4px',
                    display: 'flex',
                    gap: '2px',
                    justifyContent: 'center'
                  }}>
                    <span style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: getDotColor(evt.type)
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Details Sheet / Popover Modal */}
      {selectedDateDetails && (
        <div className="calendar-details-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          <div className="calendar-details-sheet" style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'var(--surface)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '20px',
            boxSizing: 'border-box',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Date Details
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  {selectedDateDetails.dayNum} September 2026
                </h3>
              </div>
              <button
                onClick={() => setSelectedDateDetails(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedDateDetails.evt ? (
              <div style={{
                backgroundColor: 'var(--surface-2)',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {selectedDateDetails.evt.title}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-3)',
                    color: getDotColor(selectedDateDetails.evt.type)
                  }}>
                    {selectedDateDetails.evt.type}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  Official workshop calendar event logged for all garage staff members.
                </p>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--surface-2)',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span style={{ fontWeight: '700', color: 'var(--success)' }}>Present</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shift:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>09:00 AM - 06:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Clock In:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>09:03 AM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Clock Out:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>06:12 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Worked Duration:</span>
                  <span style={{ fontWeight: '800', color: 'var(--primary)' }}>8h 39m</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedDateDetails(null)}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

