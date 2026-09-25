import React, { useEffect, useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { attendanceManagerService } from '../../services/attendanceManager.service';

export const AttendanceReports = () => {
  const [team, setTeam] = useState([]);
  const [reportType, setReportType] = useState('Daily Attendance');

  useEffect(() => {
    attendanceManagerService.getTeamAttendance().then(setTeam);
  }, []);

  const rows = useMemo(() => {
    if (reportType === 'Late Report') return team.filter((item) => Number(item.lateMinutes || 0) > 0);
    if (reportType === 'Absence Report') return team.filter((item) => item.status === 'Absent');
    if (reportType === 'OT Report') return team.filter((item) => Number(item.overtimeHours || 0) > 0);
    return team;
  }, [team, reportType]);

  const exportCsv = () => {
    const header = ['Employee','Role','Branch','Status','Check In','Check Out','Working Hours','OT Hours','Late Minutes'];
    const body = rows.map((item) => [
      item.name,item.designation,item.branch,item.status,item.clockIn || '',item.clockOut || '',
      item.worked || '',item.overtimeHours || 0,item.lateMinutes || 0
    ]);
    const csv = [header, ...body].map((row) => row.map((cell) => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${reportType.toLowerCase().replaceAll(' ','-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <div>
          <div className="text-base font-extrabold text-content">Attendance Reports</div>
          <div className="mt-1 text-xs text-muted">Daily, monthly, late, absence, overtime and employee-wise reports.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-content"><Download size={14}/>Export CSV</button>
          <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-content"><Printer size={14}/>Print</button>
        </div>
      </div>

      <select value={reportType} onChange={(e)=>setReportType(e.target.value)} className="h-11 max-w-xs rounded-xl border border-line bg-surface px-3 text-sm text-content">
        {['Daily Attendance','Monthly Attendance','Late Report','Absence Report','OT Report','Employee-wise Report'].map((type)=><option key={type}>{type}</option>)}
      </select>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[820px] border-collapse text-left text-xs">
          <thead className="bg-surface-2 text-[10px] uppercase tracking-wide text-muted">
            <tr>{['Employee','Role','Branch','Status','Check In','Check Out','Worked','OT','Late'].map((head)=><th key={head} className="px-3 py-3">{head}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((item)=>(
              <tr key={item.id} className="border-t border-line">
                <td className="px-3 py-3 font-bold text-content">{item.name}</td>
                <td className="px-3 py-3 text-secondary">{item.designation}</td>
                <td className="px-3 py-3 text-secondary">{item.branch}</td>
                <td className="px-3 py-3 font-semibold text-content">{item.status}</td>
                <td className="px-3 py-3 text-content">{item.clockIn || '—'}</td>
                <td className="px-3 py-3 text-content">{item.clockOut || '—'}</td>
                <td className="px-3 py-3 text-content">{item.worked || '—'}</td>
                <td className="px-3 py-3 text-content">{item.overtimeHours || 0}h</td>
                <td className="px-3 py-3 text-content">{item.lateMinutes || 0}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
