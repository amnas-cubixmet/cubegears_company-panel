export const workshopDepartments = [
  { id: 'DEP-MECH', name: 'Mechanical', lead: 'Niyas P', icon: 'Wrench' },
  { id: 'DEP-ELEC', name: 'Electrical', lead: 'Ajmal K', icon: 'Zap' },
  { id: 'DEP-BODY', name: 'Body Shop', lead: 'Workshop Supervisor', icon: 'Car' },
  { id: 'DEP-WASH', name: 'Washing', lead: 'Team Lead', icon: 'Droplets' },
  { id: 'DEP-DESK', name: 'Service Desk', lead: 'Priya Nair', icon: 'Headphones' },
  { id: 'DEP-ACC', name: 'Accounts', lead: 'Accounts Lead', icon: 'Receipt' }
];

export const workshopSkills = [
  'Engine',
  'Transmission',
  'AC',
  'Electrical',
  'Diagnostics',
  'Painting',
  'Body Repair',
  'Wheel Alignment',
  'Tyres',
  'Quick Service',
  'Customer Handling',
  'Inventory'
];

export const workshopShifts = [
  { id: 'SHIFT-GENERAL', name: 'General Shift', time: '09:00 AM - 06:00 PM', weeklyOff: 'Sunday', branch: 'All Branches' },
  { id: 'SHIFT-MORNING', name: 'Morning Shift', time: '08:30 AM - 05:30 PM', weeklyOff: 'Sunday', branch: 'Main Garage Branch' },
  { id: 'SHIFT-EVENING', name: 'Evening Shift', time: '01:00 PM - 10:00 PM', weeklyOff: 'Monday', branch: 'Kochi South Branch' }
];

export const staffWorkshopProfiles = {
  'EMP-0012': {
    department: 'Mechanical',
    skills: ['Engine', 'Transmission', 'Diagnostics', 'AC'],
    emergencyContact: 'Sameer K · +91 98470 11223',
    address: 'Chalakudy, Thrissur, Kerala',
    idProof: 'Aadhaar verified',
    currentShift: 'General Shift',
    statusNote: 'Lead diagnostic technician'
  },
  'EMP-0013': {
    department: 'Mechanical',
    skills: ['Engine', 'Quick Service', 'Wheel Alignment', 'Tyres'],
    emergencyContact: 'Fathima P · +91 98472 22661',
    address: 'Angamaly, Ernakulam, Kerala',
    idProof: 'Aadhaar verified',
    currentShift: 'General Shift',
    statusNote: 'Senior workshop technician'
  },
  'EMP-0014': {
    department: 'Service Desk',
    skills: ['Customer Handling', 'Diagnostics', 'Inventory'],
    emergencyContact: 'Lakshmi V · +91 98950 22114',
    address: 'Kochi, Ernakulam, Kerala',
    idProof: 'Aadhaar + PAN verified',
    currentShift: 'Morning Shift',
    statusNote: 'Branch operations lead'
  },
  'EMP-0018': {
    department: 'Service Desk',
    skills: ['Customer Handling', 'Quick Service'],
    emergencyContact: 'Arun Nair · +91 97441 55122',
    address: 'Kakkanad, Ernakulam, Kerala',
    idProof: 'Aadhaar verified',
    currentShift: 'General Shift',
    statusNote: 'Customer intake and scheduling'
  },
  'EMP-0021': {
    department: 'Accounts',
    skills: ['Inventory'],
    emergencyContact: 'Neethu Sethi · +91 98460 99122',
    address: 'Aluva, Ernakulam, Kerala',
    idProof: 'Aadhaar verified',
    currentShift: 'General Shift',
    statusNote: 'Former storekeeper'
  }
};

export const staffJobAssignments = [
  { id: 'JOB-0128', staffId: 'EMP-0012', vehicle: 'Toyota Innova · KL 45 M 2210', work: 'Engine diagnostics', status: 'In Progress', bookedHours: 5.5, progress: 70 },
  { id: 'JOB-0131', staffId: 'EMP-0012', vehicle: 'Hyundai i20 · KL 64 D 8041', work: 'AC cooling issue', status: 'Waiting Parts', bookedHours: 2.5, progress: 35 },
  { id: 'JOB-0125', staffId: 'EMP-0013', vehicle: 'Maruti Baleno · KL 08 CB 4180', work: 'Quick service', status: 'QC', bookedHours: 3, progress: 90 },
  { id: 'JOB-0130', staffId: 'EMP-0013', vehicle: 'Kia Seltos · KL 07 CU 9088', work: 'Wheel alignment', status: 'In Progress', bookedHours: 2, progress: 55 },
  { id: 'JOB-0122', staffId: 'EMP-0014', vehicle: 'Workshop Queue', work: 'Job allocation & approval', status: 'Supervising', bookedHours: 4, progress: 60 }
];

export const staffPerformance = {
  'EMP-0012': { jobsCompleted: 38, labourRevenue: 148500, productiveHours: 176.5, utilization: 88, comebackJobs: 1, customerRating: 4.8 },
  'EMP-0013': { jobsCompleted: 44, labourRevenue: 126800, productiveHours: 181, utilization: 91, comebackJobs: 2, customerRating: 4.7 },
  'EMP-0014': { jobsCompleted: 12, labourRevenue: 204000, productiveHours: 168, utilization: 84, comebackJobs: 0, customerRating: 4.9 },
  'EMP-0018': { jobsCompleted: 31, labourRevenue: 98500, productiveHours: 170, utilization: 86, comebackJobs: 0, customerRating: 4.8 },
  'EMP-0021': { jobsCompleted: 0, labourRevenue: 0, productiveHours: 0, utilization: 0, comebackJobs: 0, customerRating: 0 }
};

export const defaultWorkshopProfile = {
  department: 'Mechanical',
  skills: [],
  emergencyContact: 'Not configured',
  address: 'Not configured',
  idProof: 'Not uploaded',
  currentShift: 'General Shift',
  statusNote: ''
};

export const enrichWorkshopStaff = (staff) => ({
  ...defaultWorkshopProfile,
  ...staff,
  ...(staffWorkshopProfiles[staff?.id] || {}),
  department: staff?.department || staffWorkshopProfiles[staff?.id]?.department || defaultWorkshopProfile.department,
  skills: staff?.skills || staffWorkshopProfiles[staff?.id]?.skills || [],
  emergencyContact: staff?.emergencyContact || staffWorkshopProfiles[staff?.id]?.emergencyContact || defaultWorkshopProfile.emergencyContact,
  address: staff?.address || staffWorkshopProfiles[staff?.id]?.address || defaultWorkshopProfile.address,
  idProof: staff?.idProof || staffWorkshopProfiles[staff?.id]?.idProof || defaultWorkshopProfile.idProof
});
