import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
import { mockStaffList } from '../mock/staff.mock';
import { enrichWorkshopStaff } from '../mock/staffManagement.mock';

const normalizeStaff = (staff = {}) => ({
  ...staff,
  id: staff.id,
  employeeId: staff.employeeId || staff.employee_code || '',
  name: staff.name || '',
  role: staff.role || staff.role_name || '',
  department: staff.department || staff.department_name || staff.teamName || '',
  shift: staff.shift || staff.shift_label || staff.shiftName || '',
  joiningDate: staff.joiningDate || staff.joining_date || '',
  employmentStatus: staff.employmentStatus || staff.status || 'Active',
  emergencyContact: staff.emergencyContact || staff.emergency_contact || '',
  accountStatus: staff.accountStatus || 'Active',
  loginStatus: staff.loginStatus || 'Not Invited'
});

export const staffService = {
  getStaff: async () => {
    if (!USE_MOCK_API) {
      const rows = await apiClient.get('/employees');
      return Array.isArray(rows) ? rows.map(normalizeStaff) : rows;
    }
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStaffList.map((staff) => enrichWorkshopStaff(staff))), 150);
    });
  },

  getStaffById: async (id) => {
    if (!USE_MOCK_API) return normalizeStaff(await apiClient.get(`/employees/${id}`));
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = mockStaffList.find((s) => s.id === id);
        if (found) resolve(enrichWorkshopStaff(found));
        else reject(new Error('Staff member not found'));
      }, 150);
    });
  },

  createStaff: async (staffData) => {
    if (!USE_MOCK_API) {
      const created = await apiClient.post('/employees', staffData);
      if (staffData.setSalaryNow && staffData.salarySetup) {
        const salary = staffData.salarySetup;
        await apiClient.post('/payroll/salary-setup', {
          employee: created.id,
          basic: Number(salary.basicSalary || salary.basic || 0),
          hra: Number(salary.hra || 0),
          allowances: Number(salary.totalAllowances || salary.allowances || 0),
          deductions: Number(salary.deductions || 0),
          overtime_rate: Number(salary.overtimeRate || 0),
          incentive_rule: { fixed: Number(salary.fixedIncentive || 0) },
          effective_from: salary.effectiveDate || new Date().toISOString().slice(0, 10)
        });
      }
      return normalizeStaff(created);
    }

    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const newId = `EMP-${String(mockStaffList.length + 12).padStart(4, '0')}`;
        const newStaff = enrichWorkshopStaff({
          ...staffData,
          id: newId,
          employmentStatus: staffData.employmentStatus || 'Active',
          accountStatus: 'Active',
          loginStatus: 'Not Invited',
          lastLogin: '-',
          documents: [],
          activityHistory: [{
            id: `ACT-${Date.now()}`,
            action: 'Account Created',
            oldValue: '-',
            newValue: 'Active',
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString()
          }]
        });
        mockStaffList.unshift(newStaff);

        if (staffData.setSalaryNow && staffData.salarySetup) {
          const { payrollService } = await import('./payroll.service');
          await payrollService.saveSalaryStructure({
            staffId: newId,
            staffName: newStaff.name,
            salaryBasis: staffData.salarySetup.salaryBasis || 'Monthly',
            basicSalary: Number(staffData.salarySetup.basicSalary || 0),
            allowances: Number(staffData.salarySetup.totalAllowances || 0),
            fixedIncentives: Number(staffData.salarySetup.fixedIncentive || 0),
            effectiveDate: staffData.salarySetup.effectiveDate || new Date().toISOString().split('T')[0],
            status: 'Active',
            notes: staffData.salarySetup.notes || '',
            allowanceBreakdown: staffData.salarySetup.allowances || []
          });
        }

        resolve(newStaff);
      }, 200);
    });
  },

  updateStaff: async (id, staffData) => {
    if (!USE_MOCK_API) return normalizeStaff(await apiClient.patch(`/employees/${id}`, staffData));
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((s) => s.id === id);
        if (idx !== -1) {
          mockStaffList[idx] = { ...mockStaffList[idx], ...staffData };
          mockStaffList[idx].activityHistory.unshift({
            id: `ACT-${Date.now()}`,
            action: 'Profile Updated',
            oldValue: 'Previous Data',
            newValue: 'Updated Details',
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString()
          });
          resolve(enrichWorkshopStaff(mockStaffList[idx]));
        } else resolve(null);
      }, 200);
    });
  },

  toggleAccountStatus: async (id) => {
    if (!USE_MOCK_API) return normalizeStaff(await apiClient.patch(`/employees/${id}/toggle-account`));
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((s) => s.id === id);
        if (idx !== -1) {
          const current = mockStaffList[idx].accountStatus;
          const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
          mockStaffList[idx].accountStatus = nextStatus;
          mockStaffList[idx].employmentStatus = nextStatus;
          mockStaffList[idx].loginStatus = nextStatus;
          resolve(mockStaffList[idx]);
        } else resolve(null);
      }, 150);
    });
  },

  sendLoginInvite: async (id) => {
    if (!USE_MOCK_API) return apiClient.post(`/employees/${id}/invite`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((s) => s.id === id);
        if (idx !== -1) {
          mockStaffList[idx].loginStatus = 'Invite Sent';
          resolve(mockStaffList[idx]);
        } else resolve(null);
      }, 150);
    });
  }
};
