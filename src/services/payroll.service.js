import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
import { mockPayrollList } from '../mock/payroll.mock';
import { mockSalaryStructures, mockSalaryPayments, mockSalaryAdvances } from '../mock/salaryStructure.mock';
import { overtimeService } from './overtime.service';
import { commissionService } from './commission.service';

const parseWorkedHours = (value) => {
  if (typeof value === 'number') return value;
  const text = String(value || '');
  const h = Number((text.match(/([\d.]+)h/) || [])[1] || 0);
  const m = Number((text.match(/([\d.]+)m/) || [])[1] || 0);
  return h + (m / 60);
};

const resolveBasePay = (payroll, structure) => {
  const basis = structure?.salaryBasis || payroll.salaryBasis || (payroll.paymentType === 'Commission' ? 'Commission Only' : 'Fixed Monthly');

  if (basis === 'Hourly') {
    const workedHours = parseWorkedHours(payroll.reviewedAttendance?.workedHours);
    return workedHours * Number(structure?.hourlyRate || 0);
  }

  if (basis === 'Daily') {
    const presentDays = Number(payroll.reviewedAttendance?.present || 0);
    return presentDays * Number(structure?.dailyRate || 0);
  }

  if (basis === 'Commission Only') return 0;

  return Number(structure?.fixedMonthlySalary ?? structure?.basicSalary ?? payroll.baseSalary ?? 0);
};

export const payrollService = {
  // Payroll List & Summaries
  getPayrolls: async (filters = {}) => {
    const otList = await overtimeService.getOvertime({
      month: filters.month,
      branch: filters.branch,
      status: 'Approved' // ONLY APPROVED OVERTIME ENTERS PAYROLL
    });

    const comList = await commissionService.getCommissions({
      month: filters.month,
      status: 'Approved' // ONLY APPROVED COMMISSIONS ENTER PAYROLL
    });

    return new Promise((resolve) => {
      setTimeout(() => {
        let result = mockPayrollList.map((p) => {
          const structure = mockSalaryStructures.find((item) => item.staffId === p.staffId && item.status !== 'Inactive');
          // Find approved overtime records for this staff member
          const staffApprovedOt = otList.filter((ot) => ot.staffId === p.staffId && (ot.payrollMonth === p.month || !filters.month));
          const totalOtHours = staffApprovedOt.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
          const totalOtPay = staffApprovedOt.reduce((acc, curr) => acc + (curr.amount || 0), 0);

          // Find approved commissions for this staff member
          const staffApprovedCom = comList.filter((c) => c.staffId === p.staffId && (c.payrollMonth === p.month || !filters.month));
          const totalCommission = staffApprovedCom.reduce((acc, curr) => acc + (curr.amount || 0), 0);

          const salaryBasis = structure?.salaryBasis || (p.paymentType === 'Commission' ? 'Commission Only' : 'Fixed Monthly');
          const baseSalaryVal = resolveBasePay(p, structure);
          const allowances = Number(structure?.allowances ?? p.allowances ?? 0);
          const fixedIncentives = Number(structure?.fixedIncentives ?? p.fixedIncentives ?? p.incentives ?? 0);
          const grossSalary = baseSalaryVal + allowances + fixedIncentives + totalOtPay + totalCommission;
          const netSalary = grossSalary - (p.deductions || 0) - (p.advanceRecovery || 0);

          return {
            ...p,
            salaryBasis,
            salaryRate: salaryBasis === 'Hourly'
              ? Number(structure?.hourlyRate || 0)
              : salaryBasis === 'Daily'
                ? Number(structure?.dailyRate || 0)
                : Number(structure?.fixedMonthlySalary ?? structure?.basicSalary ?? baseSalaryVal),
            baseSalary: baseSalaryVal,
            allowances,
            fixedIncentives,
            overtimeHours: totalOtHours ? `${totalOtHours}h` : '0h',
            overtimePay: totalOtPay,
            approvedCommission: totalCommission,
            grossSalary,
            netSalary
          };
        });

        // Filter by Month & Year String (e.g. "September 2026")
        if (filters.month) {
          result = result.filter((p) => p.month === filters.month);
        }
        if (filters.branch && filters.branch !== 'All' && filters.branch !== 'all') {
          result = result.filter((p) => p.branch === filters.branch);
        }
        if (filters.staffId && filters.staffId !== 'All' && filters.staffId !== 'all') {
          result = result.filter((p) => p.staffId === filters.staffId);
        }
        if (filters.approvalStatus && filters.approvalStatus !== 'All' && filters.approvalStatus !== 'all') {
          result = result.filter((p) => p.approvalStatus === filters.approvalStatus);
        }
        if (filters.paymentStatus && filters.paymentStatus !== 'All' && filters.paymentStatus !== 'all') {
          result = result.filter((p) => p.paymentStatus === filters.paymentStatus);
        }

        resolve(result);
      }, 150);
    });
  },

  updateApprovalStatus: async (id, status, reason = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockPayrollList.findIndex((p) => p.id === id);
        if (idx !== -1) {
          mockPayrollList[idx].approvalStatus = status; // Draft | Submitted | Reviewed | Approved | Rejected
          mockPayrollList[idx].history = mockPayrollList[idx].history || [];
          mockPayrollList[idx].history.push({
            action: `Status changed to ${status}`,
            timestamp: new Date().toLocaleString(),
            reason
          });
          resolve(mockPayrollList[idx]);
        } else {
          resolve(null);
        }
      }, 150);
    });
  },

  recordPayment: async (payrollId, paymentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockPayrollList.findIndex((p) => p.id === payrollId);
        if (idx !== -1) {
          const item = mockPayrollList[idx];
          const outstanding = item.netSalary - (item.paidAmount || 0);

          if (paymentData.amount > outstanding) {
            return reject(new Error(`Payment amount (₹${paymentData.amount}) exceeds outstanding balance (₹${outstanding}).`));
          }

          const transferStatus = paymentData.transferStatus || 'Successful';
          const newPayment = {
            id: `PMT-${Date.now()}`,
            payrollId,
            staffId: item.staffId,
            staffName: item.staffName,
            period: item.month,
            amount: Number(paymentData.amount),
            method: paymentData.method,
            reference: paymentData.reference || 'N/A',
            date: paymentData.date || new Date().toISOString().split('T')[0],
            remarks: paymentData.remarks || '',
            recordedBy: 'Accountant',
            transferStatus
          };

          item.payments = item.payments || [];
          item.payments.push(newPayment);
          mockSalaryPayments.push(newPayment);

          if (transferStatus === 'Successful') {
            item.paidAmount = (item.paidAmount || 0) + Number(paymentData.amount);
          }

          if (item.paidAmount >= item.netSalary) {
            item.paymentStatus = 'Paid';
          } else if (item.paidAmount > 0) {
            item.paymentStatus = 'Partially Paid';
          } else {
            item.paymentStatus = 'Unpaid';
          }

          resolve(item);
        } else {
          reject(new Error('Payroll record not found.'));
        }
      }, 200);
    });
  },

  // Salary Structure Services
  getSalaryStructures: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSalaryStructures]), 150);
    });
  },

  saveSalaryStructure: async (structureData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockSalaryStructures.findIndex((s) => s.staffId === structureData.staffId);
        if (idx !== -1) {
          mockSalaryStructures[idx] = { ...mockSalaryStructures[idx], ...structureData };
          resolve(mockSalaryStructures[idx]);
        } else {
          const newStr = {
            id: `STR-${Date.now()}`,
            ...structureData,
            status: 'Active'
          };
          mockSalaryStructures.push(newStr);
          resolve(newStr);
        }
      }, 150);
    });
  },

  // Advances & Recovery Services
  getSalaryAdvances: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSalaryAdvances]), 150);
    });
  },

  createSalaryAdvance: async (advanceData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAdv = {
          id: `ADV-${Date.now()}`,
          ...advanceData,
          recoveredAmount: 0,
          outstandingBalance: Number(advanceData.advanceAmount),
          status: 'Active',
          approvalStatus: advanceData.approvalStatus || 'Approved',
          recoveryHistory: []
        };
        mockSalaryAdvances.push(newAdv);
        resolve(newAdv);
      }, 150);
    });
  },

  recordAdvanceRecovery: async (advanceId, recoveryData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const idx = mockSalaryAdvances.findIndex((a) => a.id === advanceId);
        if (idx !== -1) {
          const adv = mockSalaryAdvances[idx];
          const recAmount = Number(recoveryData.amount);

          if (recAmount > adv.outstandingBalance) {
            return reject(new Error(`Recovery amount (₹${recAmount}) cannot exceed outstanding balance (₹${adv.outstandingBalance}).`));
          }

          adv.recoveredAmount += recAmount;
          adv.outstandingBalance -= recAmount;
          if (adv.outstandingBalance <= 0) {
            adv.status = 'Fully Recovered';
          }

          const historyEntry = {
            id: `REC-${Date.now()}`,
            date: recoveryData.date || new Date().toISOString().split('T')[0],
            amount: recAmount,
            month: recoveryData.payrollPeriod || 'Manual Recovery',
            recordedBy: 'Accountant',
            reference: recoveryData.reference || 'N/A',
            remarks: recoveryData.remarks || ''
          };

          adv.recoveryHistory = adv.recoveryHistory || [];
          adv.recoveryHistory.unshift(historyEntry);

          resolve(adv);
        } else {
          reject(new Error('Advance record not found.'));
        }
      }, 200);
    });
  }
};


const PAYMENT_TYPE_LABELS = {
  monthly: 'Fixed Monthly Salary',
  daily: 'Daily Wage',
  hourly: 'Hourly Wage',
  commission: 'Commission Only',
  monthly_commission: 'Monthly Salary + Commission',
  daily_commission: 'Daily Wage + Commission',
  hourly_commission: 'Hourly Wage + Commission',
  salary_incentive: 'Fixed Salary + Job Incentive',
  hybrid: 'Custom Hybrid Compensation'
};

const normalizeCompensationPlan = (plan = {}) => ({
  ...plan,
  staffId: plan.staffId || plan.employee,
  salaryBasis: plan.selectedPayStructure || PAYMENT_TYPE_LABELS[plan.paymentType] || plan.paymentType || 'Not configured',
  fixedMonthlySalary: Number(plan.baseSalary || 0),
  basicSalary: Number(plan.baseSalary || 0),
  dailyRate: Number(plan.dailyWageRate || 0),
  hourlyRate: Number(plan.hourlyWageRate || 0),
  commissionPercentage: Number(plan.commissionPercentage || 0),
  commissionFixedAmount: Number(plan.commissionFixedAmount || 0),
  fixedIncentives: Number(plan.bonusRules?.fixedAmount || plan.bonusRules?.fixed || 0),
  allowances: Number(
    (plan.components || [])
      .filter((item) => item.kind === 'earning' && item.calculationType === 'fixed')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  ),
  status: plan.isActive === false ? 'Inactive' : 'Active'
});

if (!USE_MOCK_API) {
  Object.assign(payrollService, {
    getPayrolls: async (filters = {}) => {
      const rows = await apiClient.get('/payroll/payslips', { params: filters });
      let result = Array.isArray(rows) ? rows : rows?.results || [];
      if (filters.month) result = result.filter((row) => row.month === filters.month);
      if (filters.staffId && !['All', 'all'].includes(filters.staffId)) {
        result = result.filter((row) => String(row.staffId) === String(filters.staffId));
      }
      if (filters.paymentStatus && !['All', 'all'].includes(filters.paymentStatus)) {
        result = result.filter((row) => row.paymentStatus === filters.paymentStatus);
      }
      if (filters.approvalStatus && !['All', 'all'].includes(filters.approvalStatus)) {
        result = result.filter((row) => row.approvalStatus === filters.approvalStatus);
      }
      return result;
    },

    updateApprovalStatus: async (id, status, reason = '') =>
      apiClient.patch(`/payroll/payslips/${id}`, { status, approval_reason: reason }),

    recordPayment: async (payrollId, paymentData) =>
      apiClient.post(`/payroll/payslips/${payrollId}/payment`, paymentData),

    getPayrollPolicy: async (filters = {}) => {
      const rows = await apiClient.get('/payroll/policy', { params: filters });
      const list = Array.isArray(rows) ? rows : rows?.results || [];
      return list[0] || null;
    },

    savePayrollPolicy: async (policy) => {
      if (policy.id) return apiClient.patch(`/payroll/policy/${policy.id}`, policy);
      return apiClient.post('/payroll/policy', policy);
    },

    getCompensationPlans: async (filters = {}) => {
      const rows = await apiClient.get('/payroll/compensation-plans', { params: filters });
      return (Array.isArray(rows) ? rows : rows?.results || []).map(normalizeCompensationPlan);
    },

    saveCompensationPlan: async (plan) => {
      const payload = {
        employee: plan.employee || plan.staffId,
        paymentType: plan.paymentType || 'monthly',
        baseSalary: Number(plan.baseSalary || plan.fixedMonthlySalary || 0),
        dailyWageRate: Number(plan.dailyWageRate || plan.dailyRate || 0),
        hourlyWageRate: Number(plan.hourlyWageRate || plan.hourlyRate || 0),
        commissionType: plan.commissionType || 'none',
        commissionPercentage: Number(plan.commissionPercentage || 0),
        commissionFixedAmount: Number(plan.commissionFixedAmount || 0),
        eligibleRevenueBasis: plan.eligibleRevenueBasis || 'labour_revenue',
        overtimeEligibility: plan.overtimeEligibility !== false,
        incentiveEligibility: plan.incentiveEligibility !== false,
        bonusRules: plan.bonusRules || {
          fixedAmount: Number(plan.fixedIncentives || 0)
        },
        applicableDeductions: plan.applicableDeductions || [],
        effectiveDate: plan.effectiveDate || new Date().toISOString().slice(0, 10),
        effectiveTo: plan.effectiveTo || null,
        paymentFrequency: plan.paymentFrequency || 'monthly',
        approvalStatus: plan.approvalStatus || 'Approved',
        isActive: plan.isActive !== false,
        notes: plan.notes || ''
      };

      const saved = plan.id
        ? await apiClient.patch(`/payroll/compensation-plans/${plan.id}`, payload)
        : await apiClient.post('/payroll/compensation-plans', payload);

      const components = Array.isArray(plan.components)
        ? plan.components.filter((item) => item.name && Number(item.amount || item.percentage || 0) > 0)
        : [];

      for (const component of components) {
        const componentPayload = {
          plan: saved.id,
          code: component.code || String(component.name).toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
          name: component.name,
          kind: component.kind || 'earning',
          calculationType: component.calculationType || 'fixed',
          amount: Number(component.amount || 0),
          percentage: Number(component.percentage || 0),
          revenueBasis: component.revenueBasis || '',
          taxable: component.taxable !== false,
          is_active: component.is_active !== false,
          metadata: component.metadata || {}
        };

        if (component.id) {
          await apiClient.patch(`/payroll/compensation-components/${component.id}`, componentPayload);
        } else {
          await apiClient.post('/payroll/compensation-components', componentPayload);
        }
      }

      const refreshed = await apiClient.get(`/payroll/compensation-plans/${saved.id}`);
      return normalizeCompensationPlan(refreshed);
    },

    approveCompensationPlan: async (id) =>
      normalizeCompensationPlan(
        await apiClient.post(`/payroll/compensation-plans/${id}/approve`, {})
      ),

    getSalaryStructures: async () =>
      payrollService.getCompensationPlans({ active: true }),

    saveSalaryStructure: async (structureData) =>
      payrollService.saveCompensationPlan(structureData),

    getJobAssignments: async (filters = {}) =>
      apiClient.get('/payroll/job-assignments', { params: filters }),

    saveJobAssignment: async (assignment) => {
      if (assignment.id) {
        return apiClient.patch(`/payroll/job-assignments/${assignment.id}`, assignment);
      }
      return apiClient.post('/payroll/job-assignments', assignment);
    },

    getGeneratedCommissions: async (filters = {}) =>
      apiClient.get('/payroll/commissions', { params: filters }),

    updateGeneratedCommissionStatus: async (id, status) =>
      apiClient.post(`/payroll/commissions/${id}/status`, { status }),

    createPayrollRun: async ({ month, year, branch = null }) =>
      apiClient.post('/payroll/runs', { month, year, branch }),

    processPayrollRun: async (id) =>
      apiClient.post(`/payroll/runs/${id}/process`, {}),

    submitPayrollRun: async (id) =>
      apiClient.post(`/payroll/runs/${id}/submit`, {}),

    approvePayrollRun: async (id) =>
      apiClient.post(`/payroll/runs/${id}/approve`, {}),

    getSalaryAdvances: async () => apiClient.get('/payroll/advances'),

    createSalaryAdvance: async (advanceData) => apiClient.post('/payroll/advances', {
      employee: advanceData.employee || advanceData.staffId,
      date: advanceData.date || new Date().toISOString().slice(0, 10),
      advanceAmount: Number(advanceData.advanceAmount || advanceData.amount || 0),
      remarks: advanceData.remarks || ''
    }),

    recordAdvanceRecovery: async (advanceId, recoveryData) =>
      apiClient.post(`/payroll/advances/${advanceId}/recover`, recoveryData)
  });
}
