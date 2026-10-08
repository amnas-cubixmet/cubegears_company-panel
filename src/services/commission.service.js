import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
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


if (!USE_MOCK_API) {
  const normalizeGenerated = (row = {}) => ({
    ...row,
    category: row.category || 'Auto Commission',
    jobCardId: row.jobCardId || row.job?.jobNumber || row.job || 'Job Card',
    customerName: row.customerName || 'Workshop Customer',
    vehicle: row.vehicle || row.metadata?.vehicle || 'Linked Job Card',
    serviceName: row.serviceName || String(row.revenueBasis || 'labour_revenue').replaceAll('_', ' '),
    customerCharge: Number(row.eligibleBase || 0),
    method: row.commissionType === 'fixed' ? 'Fixed Job Commission' : 'Revenue Percentage',
    rate: row.commissionType === 'fixed'
      ? 'Fixed'
      : `${Number(row.rate || 0)}%`,
    amount: Number(row.amount || 0),
    sourceType: 'generated',
  });

  const normalizeManual = (row = {}) => ({
    ...row,
    category: row.metadata?.category || row.incentive_type || row.incentiveType || 'Manual Incentive',
    jobCardId: row.reference || row.jobCardId || 'Manual',
    customerName: row.metadata?.customerName || 'Manual Entry',
    vehicle: row.metadata?.vehicle || '—',
    serviceName: row.source || row.metadata?.serviceName || 'Manual Incentive',
    customerCharge: Number(row.metadata?.customerCharge || row.amount || 0),
    method: row.metadata?.method || 'Manual Authorized Commission',
    rate: row.metadata?.rate || 'Manual',
    amount: Number(row.amount || 0),
    sourceType: 'manual',
  });

  Object.assign(commissionService, {
    getCommissions: async (filters = {}) => {
      const monthName = filters.month || '';
      const yearMatch = String(monthName).match(/(\d{4})/);
      const monthText = String(monthName).replace(/\d{4}/, '').trim();
      const monthNumber = [
        '', 'January','February','March','April','May','June',
        'July','August','September','October','November','December'
      ].indexOf(monthText);

      const generatedParams = {
        ...(filters.staffId ? { staffId: filters.staffId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(yearMatch ? { year: Number(yearMatch[1]) } : {}),
        ...(monthNumber > 0 ? { month: monthNumber } : {}),
      };

      const [generatedRows, manualRows] = await Promise.all([
        apiClient.get('/payroll/commissions', { params: generatedParams }),
        apiClient.get('/payroll/incentives', { params: filters }),
      ]);

      const generated = (Array.isArray(generatedRows) ? generatedRows : generatedRows?.results || [])
        .map(normalizeGenerated);
      const manual = (Array.isArray(manualRows) ? manualRows : manualRows?.results || [])
        .map(normalizeManual);

      return [...generated, ...manual];
    },

    getApprovedCommissionTotal: async (staffId, month) => {
      const rows = await commissionService.getCommissions({
        staffId,
        month,
        status: 'Approved',
      });
      return rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    },

    createCommissionRecord: async (data) => apiClient.post('/payroll/incentives', {
      staffId: data.staffId,
      incentive_type: data.incentive_type || data.type || 'Commission',
      source: data.serviceName || data.source || 'Manual Commission',
      reference: data.jobCardId || data.reference || '',
      completionDate: data.completionDate || new Date().toISOString().slice(0, 10),
      payrollMonth: data.payrollMonth || '',
      amount: Number(data.amount || 0),
      status: data.status || 'Pending',
      notes: data.notes || '',
      metadata: {
        category: data.category,
        customerName: data.customerName,
        vehicle: data.vehicle,
        serviceName: data.serviceName,
        customerCharge: data.customerCharge,
        method: data.method,
        rate: data.rate,
      },
    }),

    updateStatus: async (id, nextStatus, approvedBy = 'Branch Manager', sourceType = null) => {
      if (sourceType === 'generated') {
        return apiClient.post(`/payroll/commissions/${id}/status`, { status: nextStatus });
      }

      try {
        return await apiClient.post(`/payroll/commissions/${id}/status`, { status: nextStatus });
      } catch {
        return apiClient.post(`/payroll/incentives/${id}/status`, {
          status: nextStatus,
          approvedBy,
        });
      }
    }
  });
}
