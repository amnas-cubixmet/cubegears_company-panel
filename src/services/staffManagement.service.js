import { workshopDepartments } from '../mock/staffManagement.mock';

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
    })
};
