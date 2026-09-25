import { mockStaffList } from '../mock/staff.mock';
import { enrichWorkshopStaff } from '../mock/staffManagement.mock';

export const staffService = {
  getStaff: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStaffList.map((staff) => enrichWorkshopStaff(staff))), 150);
    });
  },

  getStaffById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = mockStaffList.find((s) => s.id === id);
        if (found) resolve(enrichWorkshopStaff(found));
        else reject(new Error('Staff member not found'));
      }, 150);
    });
  },

  createStaff: async (staffData) => {
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
          activityHistory: [
            {
              id: `ACT-${Date.now()}`,
              action: 'Account Created',
              oldValue: '-',
              newValue: 'Active',
              actor: 'Current Admin',
              timestamp: new Date().toLocaleString()
            }
          ]
        });
        mockStaffList.unshift(newStaff);

        // If salary setup is enabled, create linked salary structure
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
        } else {
          resolve(null);
        }
      }, 200);
    });
  },

  toggleAccountStatus: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((s) => s.id === id);
        if (idx !== -1) {
          const current = mockStaffList[idx].accountStatus;
          const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
          mockStaffList[idx].accountStatus = nextStatus;
          mockStaffList[idx].employmentStatus = nextStatus;
          mockStaffList[idx].loginStatus = nextStatus;
          mockStaffList[idx].activityHistory.unshift({
            id: `ACT-${Date.now()}`,
            action: nextStatus === 'Inactive' ? 'Account Deactivated' : 'Account Activated',
            oldValue: current,
            newValue: nextStatus,
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString()
          });
          resolve(mockStaffList[idx]);
        } else {
          resolve(null);
        }
      }, 150);
    });
  },

  sendLoginInvite: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((s) => s.id === id);
        if (idx !== -1) {
          mockStaffList[idx].loginStatus = 'Invite Sent';
          mockStaffList[idx].activityHistory.unshift({
            id: `ACT-${Date.now()}`,
            action: 'Login Invite Sent',
            oldValue: 'Not Invited',
            newValue: 'Invite Sent',
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString()
          });
          resolve(mockStaffList[idx]);
        } else {
          resolve(null);
        }
      }, 150);
    });
  }
};
