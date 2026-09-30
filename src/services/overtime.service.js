import { mockOvertimeList } from '../mock/overtime.mock';

export const overtimeService = {
  getOvertime: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...mockOvertimeList];
        if (filters.month) {
          result = result.filter((item) => item.payrollMonth === filters.month);
        }
        if (filters.branch && filters.branch !== 'All') {
          result = result.filter((item) => item.branch === filters.branch);
        }
        if (filters.staffId && filters.staffId !== 'All') {
          result = result.filter((item) => item.staffId === filters.staffId);
        }
        if (filters.status && filters.status !== 'All') {
          result = result.filter((item) => item.status === filters.status);
        }
        resolve(result);
      }, 150);
    });
  },

  getOvertimeByStaff: async (staffId, month) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = mockOvertimeList.filter((item) => item.staffId === staffId);
        if (month) {
          result = result.filter((item) => item.payrollMonth === month);
        }
        resolve(result);
      }, 150);
    });
  },

  createOvertime: async (otData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Duplicate detection check for same staff & date
        const isDuplicate = mockOvertimeList.some(
          (item) => item.staffId === otData.staffId && item.date === otData.date && item.status !== 'Cancelled'
        );

        if (isDuplicate) {
          return reject(new Error(`An overtime request already exists for ${otData.staffName || 'this staff'} on ${otData.date}.`));
        }

        const newId = `OT-${Date.now().toString().slice(-6)}`;
        const newRecord = {
          id: newId,
          ...otData,
          status: 'Pending',
          auditHistory: [
            {
              action: 'Overtime Submitted',
              actor: 'Manager Entry',
              timestamp: new Date().toLocaleString()
            }
          ]
        };

        mockOvertimeList.unshift(newRecord);
        resolve(newRecord);
      }, 200);
    });
  },

  approveOvertime: async (id, approvalData = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockOvertimeList.findIndex((item) => item.id === id);
        if (idx !== -1) {
          const rec = mockOvertimeList[idx];
          rec.status = 'Approved';
          rec.approvedBy = approvalData.approvedBy || 'Branch Manager';
          rec.approvedAt = new Date().toLocaleString();
          if (approvalData.rate) rec.rate = Number(approvalData.rate);
          if (approvalData.amount) rec.amount = Number(approvalData.amount);

          rec.auditHistory = rec.auditHistory || [];
          rec.auditHistory.unshift({
            action: `Approved Overtime (₹${rec.amount})`,
            actor: rec.approvedBy,
            timestamp: rec.approvedAt,
            note: approvalData.managerNote || ''
          });

          resolve(rec);
        } else {
          reject(new Error('Overtime record not found.'));
        }
      }, 150);
    });
  },

  rejectOvertime: async (id, reasonData = {}) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockOvertimeList.findIndex((item) => item.id === id);
        if (idx !== -1) {
          const rec = mockOvertimeList[idx];
          rec.status = 'Rejected';
          rec.rejectedBy = reasonData.rejectedBy || 'Branch Manager';
          rec.rejectedAt = new Date().toLocaleString();
          rec.rejectionReason = reasonData.reason || 'Not authorized';

          rec.auditHistory = rec.auditHistory || [];
          rec.auditHistory.unshift({
            action: 'Rejected Overtime',
            actor: rec.rejectedBy,
            timestamp: rec.rejectedAt,
            reason: rec.rejectionReason
          });

          resolve(rec);
        } else {
          reject(new Error('Overtime record not found.'));
        }
      }, 150);
    });
  },

  cancelOvertime: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockOvertimeList.findIndex((item) => item.id === id);
        if (idx !== -1) {
          const rec = mockOvertimeList[idx];
          rec.status = 'Cancelled';
          rec.auditHistory = rec.auditHistory || [];
          rec.auditHistory.unshift({
            action: 'Cancelled Overtime Request',
            actor: 'System Admin',
            timestamp: new Date().toLocaleString()
          });
          resolve(rec);
        } else {
          reject(new Error('Overtime record not found.'));
        }
      }, 150);
    });
  }
};
