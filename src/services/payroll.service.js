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
