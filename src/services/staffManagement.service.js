import {
  workshopDepartments,
  workshopShifts,
  workshopSkills,
  staffWorkshopProfiles
} from '../mock/staffManagement.mock';
import { mockStaffList } from '../mock/staff.mock';

const skillMeta = new Map(
  workshopSkills.map((name, index) => [
    name,
    {
      id: `SKILL-${String(index + 1).padStart(2, '0')}`,
      name,
      category: 'Workshop',
      description: ''
    }
  ])
);

const clone = (value) => JSON.parse(JSON.stringify(value));

const staffUsingShift = (shiftName) =>
  mockStaffList.filter((staff) =>
    String(staff.shift || '').toLowerCase().includes(
      String(shiftName || '').replace(' Shift', '').toLowerCase()
    )
  );

const getStaffSkills = (staff) =>
  Array.isArray(staff.skills)
    ? staff.skills
    : [...(staffWorkshopProfiles[staff.id]?.skills || [])];

const ensureStaffSkills = (staff) => {
  if (!Array.isArray(staff.skills)) staff.skills = getStaffSkills(staff);
  return staff.skills;
};

const assignedToSkill = (skillName) =>
  mockStaffList.filter((staff) => getStaffSkills(staff).includes(skillName));

const touchActivity = (staff, action, oldValue, newValue) => {
  staff.activityHistory = Array.isArray(staff.activityHistory) ? staff.activityHistory : [];
  staff.activityHistory.unshift({
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    oldValue,
    newValue,
    actor: 'Current Admin',
    timestamp: new Date().toLocaleString()
  });
};

export const staffManagementService = {
  getTeams: async () =>
    new Promise((resolve) => {
      setTimeout(() => resolve(workshopDepartments.map((team) => ({ ...team }))), 120);
    }),

  createTeam: async (teamData) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const team = {
          id: `DEP-${Date.now()}`,
          name: teamData.name.trim(),
          lead: teamData.lead || 'Not Assigned',
          branch: teamData.branch || 'All Branches',
          description: teamData.description?.trim() || '',
          icon: 'Users'
        };
        workshopDepartments.push(team);
        resolve({ ...team });
      }, 180);
    }),

  assignStaffToTeam: async (teamId, staffIds = []) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const team = workshopDepartments.find((item) => item.id === teamId);
        if (!team) return reject(new Error('Team not found.'));

        const assigned = [];
        staffIds.forEach((staffId) => {
          const staff = mockStaffList.find((item) => item.id === staffId);
          if (!staff) return;

          const oldValue = staff.department || staffWorkshopProfiles[staff.id]?.department || 'Unassigned';
          staff.department = team.name;
          touchActivity(staff, 'Team Assigned', oldValue, team.name);
          assigned.push(staff.id);
        });

        resolve({
          ...team,
          assignedStaffIds: mockStaffList
            .filter((staff) => (staff.department || staffWorkshopProfiles[staff.id]?.department) === team.name)
            .map((staff) => staff.id),
          addedStaffIds: assigned
        });
      }, 180);
    }),

  addStaffToSkill: async (skillId, staffIds = []) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const skillName = workshopSkills.find((name) => skillMeta.get(name)?.id === skillId);
        if (!skillName) return reject(new Error('Skill not found.'));

        const added = [];
        staffIds.forEach((staffId) => {
          const staff = mockStaffList.find((item) => item.id === staffId);
          if (!staff) return;

          ensureStaffSkills(staff);
          if (!staff.skills.includes(skillName)) {
            staff.skills.push(skillName);
            touchActivity(staff, 'Skill Assigned', '-', skillName);
            added.push(staff.id);
          }
        });

        resolve({
          ...(skillMeta.get(skillName) || { id: skillId, name: skillName }),
          assignedStaffIds: assignedToSkill(skillName).map((staff) => staff.id),
          addedStaffIds: added
        });
      }, 180);
    }),

  getShifts: async () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          workshopShifts.map((shift) => ({
            ...shift,
            assignedStaffIds: staffUsingShift(shift.name).map((staff) => staff.id)
          }))
        );
      }, 120);
    }),

  createShift: async (shiftData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const name = shiftData.name?.trim();
        if (!name) return reject(new Error('Shift name is required.'));
        if (workshopShifts.some((shift) => shift.name.toLowerCase() === name.toLowerCase())) {
          return reject(new Error('A shift with this name already exists.'));
        }

        const shift = {
          id: `SHIFT-${Date.now()}`,
          name,
          time: shiftData.time?.trim() || '09:00 AM - 06:00 PM',
          weeklyOff: shiftData.weeklyOff || 'Sunday',
          branch: shiftData.branch || 'All Branches'
        };
        workshopShifts.push(shift);

        const assignedIds = new Set(shiftData.assignedStaffIds || []);
        mockStaffList.forEach((staff) => {
          if (assignedIds.has(staff.id)) {
            const oldValue = staff.shift || '';
            staff.shift = `${shift.name} (${shift.time})`;
            touchActivity(staff, 'Shift Assigned', oldValue, staff.shift);
          }
        });

        resolve({ ...shift, assignedStaffIds: [...assignedIds] });
      }, 180);
    }),

  updateShift: async (id, shiftData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = workshopShifts.findIndex((shift) => shift.id === id);
        if (index === -1) return reject(new Error('Shift not found.'));

        const previous = { ...workshopShifts[index] };
        const name = shiftData.name?.trim() || previous.name;
        const duplicate = workshopShifts.some(
          (shift) => shift.id !== id && shift.name.toLowerCase() === name.toLowerCase()
        );
        if (duplicate) return reject(new Error('A shift with this name already exists.'));

        const next = {
          ...previous,
          name,
          time: shiftData.time?.trim() || previous.time,
          weeklyOff: shiftData.weeklyOff || previous.weeklyOff,
          branch: shiftData.branch || previous.branch
        };
        workshopShifts[index] = next;

        const assignedIds = new Set(shiftData.assignedStaffIds || []);
        mockStaffList.forEach((staff) => {
          const wasAssigned = String(staff.shift || '').toLowerCase().includes(
            previous.name.replace(' Shift', '').toLowerCase()
          );
          const shouldAssign = assignedIds.has(staff.id);

          if (shouldAssign) {
            const oldValue = staff.shift || '';
            staff.shift = `${next.name} (${next.time})`;
            if (oldValue !== staff.shift) touchActivity(staff, 'Shift Updated', oldValue, staff.shift);
          } else if (wasAssigned && previous.id !== 'SHIFT-GENERAL') {
            const oldValue = staff.shift || '';
            staff.shift = 'General Shift (09:00 AM - 06:00 PM)';
            touchActivity(staff, 'Shift Reassigned', oldValue, staff.shift);
          }
        });

        resolve({ ...next, assignedStaffIds: [...assignedIds] });
      }, 180);
    }),

  deleteShift: async (id) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = workshopShifts.findIndex((shift) => shift.id === id);
        if (index === -1) return reject(new Error('Shift not found.'));
        if (workshopShifts[index].id === 'SHIFT-GENERAL') {
          return reject(new Error('General Shift is protected and cannot be deleted.'));
        }

        const [removed] = workshopShifts.splice(index, 1);
        mockStaffList.forEach((staff) => {
          if (
            String(staff.shift || '').toLowerCase().includes(
              removed.name.replace(' Shift', '').toLowerCase()
            )
          ) {
            const oldValue = staff.shift || '';
            staff.shift = 'General Shift (09:00 AM - 06:00 PM)';
            touchActivity(staff, 'Shift Reassigned', oldValue, staff.shift);
          }
        });
        resolve({ ...removed });
      }, 150);
    }),

  getSkills: async () =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          workshopSkills.map((name) => ({
            ...(skillMeta.get(name) || {
              id: `SKILL-${Date.now()}`,
              name,
              category: 'Workshop',
              description: ''
            }),
            assignedStaffIds: assignedToSkill(name).map((staff) => staff.id)
          }))
        );
      }, 120);
    }),

  createSkill: async (skillData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const name = skillData.name?.trim();
        if (!name) return reject(new Error('Skill name is required.'));
        if (workshopSkills.some((skill) => skill.toLowerCase() === name.toLowerCase())) {
          return reject(new Error('A skill with this name already exists.'));
        }

        workshopSkills.push(name);
        const skill = {
          id: `SKILL-${Date.now()}`,
          name,
          category: skillData.category || 'Workshop',
          description: skillData.description?.trim() || ''
        };
        skillMeta.set(name, skill);

        const assignedIds = new Set(skillData.assignedStaffIds || []);
        mockStaffList.forEach((staff) => {
          ensureStaffSkills(staff);
          if (assignedIds.has(staff.id) && !staff.skills.includes(name)) {
            staff.skills.push(name);
            touchActivity(staff, 'Skill Assigned', '-', name);
          }
        });

        resolve({ ...skill, assignedStaffIds: [...assignedIds] });
      }, 180);
    }),

  updateSkill: async (id, skillData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const currentName = workshopSkills.find((name) => skillMeta.get(name)?.id === id);
        if (!currentName) return reject(new Error('Skill not found.'));

        const nextName = skillData.name?.trim() || currentName;
        const duplicate = workshopSkills.some(
          (name) => name !== currentName && name.toLowerCase() === nextName.toLowerCase()
        );
        if (duplicate) return reject(new Error('A skill with this name already exists.'));

        const index = workshopSkills.indexOf(currentName);
        workshopSkills[index] = nextName;

        const previousMeta = skillMeta.get(currentName) || {};
        skillMeta.delete(currentName);
        const nextMeta = {
          ...previousMeta,
          id,
          name: nextName,
          category: skillData.category || previousMeta.category || 'Workshop',
          description: skillData.description?.trim() ?? previousMeta.description ?? ''
        };
        skillMeta.set(nextName, nextMeta);

        const assignedIds = new Set(skillData.assignedStaffIds || []);
        mockStaffList.forEach((staff) => {
          ensureStaffSkills(staff);
          const hadSkill = staff.skills.includes(currentName);
          const shouldHave = assignedIds.has(staff.id);

          staff.skills = staff.skills.filter((skill) => skill !== currentName && skill !== nextName);
          if (shouldHave) staff.skills.push(nextName);

          if (hadSkill && !shouldHave) touchActivity(staff, 'Skill Removed', currentName, '-');
          if (!hadSkill && shouldHave) touchActivity(staff, 'Skill Assigned', '-', nextName);
          if (hadSkill && shouldHave && currentName !== nextName) {
            touchActivity(staff, 'Skill Updated', currentName, nextName);
          }
        });

        resolve({ ...nextMeta, assignedStaffIds: [...assignedIds] });
      }, 180);
    }),

  deleteSkill: async (id) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const name = workshopSkills.find((skill) => skillMeta.get(skill)?.id === id);
        if (!name) return reject(new Error('Skill not found.'));

        const index = workshopSkills.indexOf(name);
        workshopSkills.splice(index, 1);
        const removed = skillMeta.get(name);
        skillMeta.delete(name);

        mockStaffList.forEach((staff) => {
          if (Array.isArray(staff.skills) && staff.skills.includes(name)) {
            staff.skills = staff.skills.filter((skill) => skill !== name);
            touchActivity(staff, 'Skill Removed', name, '-');
          }
        });

        resolve({ ...removed });
      }, 150);
    }),

  getDocuments: async () =>
    new Promise((resolve) => {
      setTimeout(() => {
        const documents = mockStaffList.flatMap((staff) =>
          (staff.documents || []).map((document) => ({
            ...clone(document),
            staffId: staff.id,
            staffName: staff.name,
            designation: staff.designation
          }))
        );
        resolve(documents);
      }, 120);
    }),

  createDocument: async (staffId, documentData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const staff = mockStaffList.find((item) => item.id === staffId);
        if (!staff) return reject(new Error('Staff member not found.'));

        staff.documents = Array.isArray(staff.documents) ? staff.documents : [];
        const document = {
          id: `DOC-${Date.now()}`,
          name: documentData.name?.trim() || documentData.fileName || 'Document',
          type: documentData.type || 'Document',
          uploadedDate: documentData.uploadedDate || new Date().toISOString().split('T')[0],
          uploadedBy: documentData.uploadedBy || 'Current Admin',
          expiryDate: documentData.expiryDate || '',
          status: documentData.status || 'Valid',
          fileName: documentData.fileName || ''
        };
        staff.documents.push(document);
        touchActivity(staff, 'Document Added', '-', document.name);
        resolve({ ...document, staffId: staff.id, staffName: staff.name, designation: staff.designation });
      }, 180);
    }),

  updateDocument: async (staffId, documentId, documentData) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const staff = mockStaffList.find((item) => item.id === staffId);
        if (!staff) return reject(new Error('Staff member not found.'));
        const index = (staff.documents || []).findIndex((document) => document.id === documentId);
        if (index === -1) return reject(new Error('Document not found.'));

        const previous = staff.documents[index];
        const next = {
          ...previous,
          name: documentData.name?.trim() || previous.name,
          type: documentData.type || previous.type,
          uploadedDate: documentData.uploadedDate || previous.uploadedDate,
          uploadedBy: documentData.uploadedBy || previous.uploadedBy,
          expiryDate: documentData.expiryDate ?? previous.expiryDate ?? '',
          status: documentData.status || previous.status || 'Valid',
          fileName: documentData.fileName || previous.fileName || ''
        };
        staff.documents[index] = next;
        touchActivity(staff, 'Document Updated', previous.name, next.name);
        resolve({ ...next, staffId: staff.id, staffName: staff.name, designation: staff.designation });
      }, 180);
    }),

  deleteDocument: async (staffId, documentId) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const staff = mockStaffList.find((item) => item.id === staffId);
        if (!staff) return reject(new Error('Staff member not found.'));
        const index = (staff.documents || []).findIndex((document) => document.id === documentId);
        if (index === -1) return reject(new Error('Document not found.'));

        const [removed] = staff.documents.splice(index, 1);
        touchActivity(staff, 'Document Deleted', removed.name, '-');
        resolve({ ...removed });
      }, 150);
    })
};
