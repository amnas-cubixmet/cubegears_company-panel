import React, { useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export const AttendanceHistory = () => {
  const [history] = useState([
    {
      date: 'Sat, Sep 12',
      punches: [
        { clockIn: '09:03 AM', clockOut: '01:00 PM', duration: '3h 57m' },
        { clockIn: '02:00 PM', clockOut: '06:14 PM', duration: '4h 14m' }
      ],
      totalWorked: '8h 11m',
      status: 'Present'
    },
    {
      date: 'Fri, Sep 11',
      punches: [
        { clockIn: '09:18 AM', clockOut: '06:02 PM', duration: '8h 44m' }
      ],
      totalWorked: '8h 44m',
      status: 'Late'
    },
    {
      date: 'Thu, Sep 10',
      punches: [
        { clockIn: '08:55 AM', clockOut: '06:00 PM', duration: '9h 05m' }
      ],
      totalWorked: '9h 05m',
      status: 'Present'
    }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0 }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            My Personal Attendance History
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Detailed date-wise punch sessions & multiple shift logging history.
          </p>
        </div>
      </div>

      {/* History Session Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {history.map((item, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{item.date}</h3>
              </div>
              <Badge variant={item.status === 'Present' ? 'success' : 'warning'}>{item.status}</Badge>
            </div>

            {/* Individual Punch Sessions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {item.punches.map((p, pIdx) => (
                <div key={pIdx} style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--surface-2)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      In: <strong>{p.clockIn}</strong> → Out: <strong>{p.clockOut}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary)' }}>
                    Session: {p.duration}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Total Worked Today: <strong style={{ color: 'var(--text-primary)' }}>{item.totalWorked}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
