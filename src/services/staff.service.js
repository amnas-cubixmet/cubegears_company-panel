import apiClient from '../api/apiClient';
import { USE_MOCK_API } from '../api/apiConfig';
import { mockStaffList } from '../mock/staff.mock';
import { enrichWorkshopStaff } from '../mock/staffManagement.mock';

const employeeLabel = (staff = {}) => {
  if (staff.displayEmployeeNo) return staff.displayEmployeeNo;
  const source = staff.employeeId || staff.employee_code || '';
  const match = String(source).match(/(\d+)(?!.*\d)/);
  return match ? `Employee ${Number(match[1])}` : 'Employee';
};

const normalizeSkills = (skills = []) =>
  (Array.isArray(skills) ? skills : []).map((skill) =>
    typeof skill === 'string' ? skill : skill?.name,
  ).filter(Boolean);

const normalizeStaff = (staff = {}) => ({
  ...staff,
  id: staff.id,
  employeeId: staff.employeeId || staff.employee_code || '',
  displayEmployeeNo: employeeLabel(staff),
  name: staff.name || '',
  branch: staff.branchName || staff.branch?.name || staff.branch || '',
  role: staff.role || staff.role_name || '',
  department:
    staff.department ||
    staff.department_name ||
    staff.teamName ||
    staff.team?.name ||
    '',
  teamId: staff.teamId || staff.team?.id || '',
  teamName: staff.teamName || staff.team?.name || '',
  shift:
    staff.shift ||
    staff.shift_label ||
    staff.shiftName ||
    staff.shiftDetails?.name ||
    '',
  shiftId: staff.shiftId || staff.shiftDetails?.id || '',
  joiningDate: staff.joiningDate || staff.joining_date || '',
  employmentStatus: staff.employmentStatus || staff.status || 'Active',
  emergencyContact: staff.emergencyContact || staff.emergency_contact || '',
  paymentType: staff.paymentType || staff.payment_type || '',
  skills: normalizeSkills(staff.skills),
  skillDetails: Array.isArray(staff.skills)
    ? staff.skills.filter((skill) => skill && typeof skill === 'object')
    : [],
  accountStatus: staff.accountStatus || 'Active',
  loginStatus: staff.loginStatus || 'Not Invited',
});

export const staffService = {
  getStaff: async () => {
    if (!USE_MOCK_API) {
      const rows = await apiClient.get('/employees');
      const list = Array.isArray(rows) ? rows : rows?.results || [];
      return list.map(normalizeStaff);
    }
    return new Promise((resolve) => {
      setTimeout(
        () => resolve(mockStaffList.map((staff) => normalizeStaff(enrichWorkshopStaff(staff)))),
        150,
      );
    });
  },

  getStaffById: async (id) => {
    if (!USE_MOCK_API) {
      return normalizeStaff(await apiClient.get(`/employees/${id}`));
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const found = mockStaffList.find((staff) => staff.id === id);
        if (found) resolve(normalizeStaff(enrichWorkshopStaff(found)));
        else reject(new Error('Staff member not found'));
      }, 150);
    });
  },

  getMyStaff: async () => {
    if (!USE_MOCK_API) {
      return normalizeStaff(await apiClient.get('/employees/me'));
    }

    const authUser = (() => {
      try {
        return JSON.parse(localStorage.getItem('auth_user') || '{}');
      } catch {
        return {};
      }
    })();

    const id = authUser.employeeProfileId || mockStaffList[0]?.id;
    return staffService.getStaffById(id);
  },

  getActivities: async (staffId) => {
    if (!USE_MOCK_API) {
      const rows = await apiClient.get('/employees/activities', {
        params: { employee: staffId },
      });
      return Array.isArray(rows) ? rows : rows?.results || [];
    }

    const staff = mockStaffList.find((item) => item.id === staffId);
    return (staff?.activityHistory || []).map((item) => ({
      ...item,
      actorName: item.actor,
      details:
        item.details ||
        [item.oldValue, item.newValue].filter(Boolean).join(' → '),
      created_at: item.created_at || item.timestamp,
    }));
  },

  createStaff: async (staffData) => {
    if (!USE_MOCK_API) {
      const payload = {
        ...staffData,
        teamId: staffData.teamId || null,
        shiftId: staffData.shiftId || null,
        skillIds: staffData.skillIds || [],
      };
      delete payload.skills;
      const created = await apiClient.post('/employees', payload);

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
          effective_from:
            salary.effectiveDate || new Date().toISOString().slice(0, 10),
        });
      }
      return normalizeStaff(created);
    }

    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const existingNumbers = mockStaffList
          .map((item) => Number(String(item.id || '').match(/(\d+)$/)?.[1] || 0));
        const nextNumber = Math.max(0, ...existingNumbers) + 1;
        const newId = `EMP-${String(nextNumber).padStart(4, '0')}`;
        const newStaff = enrichWorkshopStaff({
          ...staffData,
          id: newId,
          employeeId: newId,
          displayEmployeeNo: `Employee ${nextNumber}`,
          skills: staffData.skills || [],
          employmentStatus: staffData.employmentStatus || 'Active',
          accountStatus: 'Active',
          loginStatus: 'Not Invited',
          lastLogin: '-',
          documents: [],
          activityHistory: [{
            id: `ACT-${Date.now()}`,
            action: 'Staff Created',
            oldValue: '-',
            newValue: 'Active',
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString(),
          }],
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
            effectiveDate:
              staffData.salarySetup.effectiveDate ||
              new Date().toISOString().split('T')[0],
            status: 'Active',
            notes: staffData.salarySetup.notes || '',
            allowanceBreakdown: staffData.salarySetup.allowances || [],
          });
        }

        resolve(normalizeStaff(newStaff));
      }, 200);
    });
  },

  updateStaff: async (id, staffData) => {
    if (!USE_MOCK_API) {
      const payload = {
        ...staffData,
      };
      if (Object.prototype.hasOwnProperty.call(staffData, 'teamId')) {
        payload.teamId = staffData.teamId || null;
      }
      if (Object.prototype.hasOwnProperty.call(staffData, 'shiftId')) {
        payload.shiftId = staffData.shiftId || null;
      }
      if (Object.prototype.hasOwnProperty.call(staffData, 'skillIds')) {
        payload.skillIds = staffData.skillIds || [];
      }
      delete payload.skills;
      return normalizeStaff(await apiClient.patch(`/employees/${id}`, payload));
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((staff) => staff.id === id);
        if (idx !== -1) {
          const previous = mockStaffList[idx];
          mockStaffList[idx] = {
            ...previous,
            ...staffData,
            skills: staffData.skills ?? previous.skills,
          };
          mockStaffList[idx].activityHistory =
            mockStaffList[idx].activityHistory || [];
          mockStaffList[idx].activityHistory.unshift({
            id: `ACT-${Date.now()}`,
            action: 'Profile Updated',
            oldValue: 'Previous Data',
            newValue: 'Updated Details',
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString(),
          });
          resolve(normalizeStaff(enrichWorkshopStaff(mockStaffList[idx])));
        } else resolve(null);
      }, 200);
    });
  },

  toggleAccountStatus: async (id) => {
    if (!USE_MOCK_API) {
      return normalizeStaff(
        await apiClient.patch(`/employees/${id}/toggle-account`),
      );
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((staff) => staff.id === id);
        if (idx !== -1) {
          const current = mockStaffList[idx].accountStatus;
          const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
          mockStaffList[idx].accountStatus = nextStatus;
          mockStaffList[idx].employmentStatus = nextStatus;
          mockStaffList[idx].loginStatus = nextStatus;
          resolve(normalizeStaff(mockStaffList[idx]));
        } else resolve(null);
      }, 150);
    });
  },

  sendLoginInvite: async (id) => {
    if (!USE_MOCK_API) return apiClient.post(`/employees/${id}/invite`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = mockStaffList.findIndex((staff) => staff.id === id);
        if (idx !== -1) {
          mockStaffList[idx].loginStatus = 'Invite Sent';
          mockStaffList[idx].activityHistory =
            mockStaffList[idx].activityHistory || [];
          mockStaffList[idx].activityHistory.unshift({
            id: `ACT-${Date.now()}`,
            action: 'Login Invite Sent',
            oldValue: 'Not Invited',
            newValue: mockStaffList[idx].email || 'Email',
            actor: 'Current Admin',
            timestamp: new Date().toLocaleString(),
          });
          resolve(mockStaffList[idx]);
        } else resolve(null);
      }, 150);
    });
  },
};
