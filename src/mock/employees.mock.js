export let employeesMock = [
  {
    id: "EMP-0001",
    name: "Alex Rivera",
    email: "alex@cubixgear.com",
    phone: "+1 555-9011",
    role: "Lead Mechanic",
    department: "Workshop Operations",
    permissions: ["manage_jobs", "manage_inventory"],
    hourlyRate: 38.00,
    status: "active"
  },
  {
    id: "EMP-0002",
    name: "Dan Miller",
    email: "dan.m@cubixgear.com",
    phone: "+1 555-9012",
    role: "Diagnostic Specialist",
    department: "Diagnostics",
    permissions: ["manage_jobs"],
    hourlyRate: 35.00,
    status: "active"
  },
  {
    id: "EMP-0003",
    name: "Elena Rostova",
    email: "elena@cubixgear.com",
    phone: "+1 555-9013",
    role: "Service Advisor",
    department: "Customer Service",
    permissions: ["manage_customers", "manage_invoices"],
    hourlyRate: 30.00,
    status: "active"
  }
];

export const getMockEmployees = () => [...employeesMock];
export const getMockEmployeeById = (id) => employeesMock.find((e) => e.id === id);
export const addMockEmployee = (data) => {
  const newEmp = {
    id: `EMP-${String(employeesMock.length + 1).padStart(4, '0')}`,
    status: "active",
    ...data
  };
  employeesMock.unshift(newEmp);
  return newEmp;
};
