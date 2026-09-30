import { mockCommissionLedger } from '../mock/commission.mock';

export const commissionService = {
  getCommissions: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...mockCommissionLedger];
        if (filters.month) {
          result = result.filter((item) => item.payrollMonth === filters.month);
        }
        if (filters.staffId && filters.staffId !== 'All' && filters.staffId !== 'all') {
          result = result.filter((item) => item.staffId === filters.staffId);
        }
        if (filters.status && filters.status !== 'All' && filters.status !== 'all') {
          result = result.filter((item) => item.status === filters.status);
        }
        resolve(result);
      }, 150);
    });
  },

  getApprovedCommissionTotal: async (staffId, month) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const approved = mockCommissionLedger.filter(
          (item) => item.staffId === staffId && item.status === 'Approved' && (!month || item.payrollMonth === month)
        );
        const total = approved.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        resolve(total);
      }, 100);
    });
  },

  createCommissionRecord: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecord = {
          id: `COM-${Date.now().toString().slice(-6)}`,
          ...data,
          status: data.status || 'Pending',
          completionDate: data.completionDate || new Date().toISOString().split('T')[0]
        };
        mockCommissionLedger.unshift(newRecord);
        resolve(newRecord);
      }, 150);
    });
  },

  updateStatus: async (id, status, approvedBy = 'Branch Manager') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = mockCommissionLedger.find((c) => c.id === id);
        if (item) {
          item.status = status;
          if (status === 'Approved') {
            item.approvedBy = approvedBy;
            item.approvedAt = new Date().toLocaleString();
          }
          resolve(item);
        } else {
          reject(new Error('Commission record not found.'));
        }
      }, 150);
    });
  }
};
