export let mockStaffList = [
  {
    id: "EMP-0012",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    name: "Ajmal K",
    phone: "+91 98765 43210",
    email: "ajmal.k@cubegears.com",
    designation: "Mechanic",
    company: "CubeGears Garage Services",
    branch: "Main Garage Branch",
    branchId: "BR-01",
    joiningDate: "2025-01-12",
    employmentStatus: "Active",
    accountStatus: "Active",
    loginStatus: "Active",
    lastLogin: "2026-09-12 09:15 AM",
    reportingManager: "Rajesh V (Workshop Manager)",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    weeklyOff: "Sunday",
    notes: "Lead mechanic for engine diagnostics and transmission overhauls.",
    role: "Mechanic",
    roleId: "ROLE-04",
    permittedBranches: ["Main Garage Branch"],
    salary: {
      basic: 18000,
      allowances: 6000,
      incentives: 4000,
      grossSalary: 28000,
      advanceBalance: 2000
    },
    paymentType: "Salary + Commission", // Monthly Salary | Daily Salary | Hourly Salary | Commission | Salary + Commission
    commissionRules: {
      basis: "Percentage of Labour Charge",
      method: "Percentage of Labour Charge",
      defaultRate: "30%",
      applicableServices: "Engine & Transmission Repair",
      effectiveDate: "2026-09-01"
    },
    documents: [
      { id: "DOC-101", name: "Aadhaar_Card.pdf", type: "ID Proof", uploadedDate: "2025-01-12", uploadedBy: "HR Admin" },
      { id: "DOC-102", name: "Driving_Licence.pdf", type: "Licence", uploadedDate: "2025-01-12", uploadedBy: "HR Admin" }
    ],
    activityHistory: [
      { id: "ACT-1", action: "Account Created", oldValue: "-", newValue: "Active", actor: "Admin", timestamp: "2025-01-12 10:00 AM" },
      { id: "ACT-2", action: "Role Assigned", oldValue: "-", newValue: "Mechanic", actor: "Admin", timestamp: "2025-01-12 10:05 AM" }
    ]
  },
  {
    id: "EMP-0013",
    photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    name: "Niyas P",
    phone: "+91 98471 22334",
    email: "niyas.p@cubegears.com",
    designation: "Senior Mechanic",
    company: "CubeGears Garage Services",
    branch: "Main Garage Branch",
    branchId: "BR-01",
    joiningDate: "2025-03-01",
    employmentStatus: "Active",
    accountStatus: "Active",
    loginStatus: "Active",
    lastLogin: "2026-09-13 11:20 AM",
    reportingManager: "Rajesh V (Branch Manager)",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    weeklyOff: "Sunday",
    notes: "Specialized in quick service, oil change, and vehicle inspections.",
    role: "Mechanic",
    roleId: "ROLE-04",
    permittedBranches: ["Main Garage Branch"],
    salary: {
      basic: 0,
      allowances: 0,
      incentives: 0,
      grossSalary: 0,
      advanceBalance: 0
    },
    paymentType: "Commission",
    commissionRules: {
      basis: "Per Vehicle",
      method: "Per Vehicle",
      defaultRate: "₹500",
      applicableServices: "All Completed Vehicles",
      effectiveDate: "2026-09-01"
    },
    documents: [],
    activityHistory: []
  },
  {
    id: "EMP-0014",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    name: "Rajesh V",
    phone: "+91 98950 12345",
    email: "rajesh.v@cubegears.com",
    designation: "Branch Manager",
    company: "CubeGears Garage Services",
    branch: "Main Garage Branch",
    branchId: "BR-01",
    joiningDate: "2024-03-01",
    employmentStatus: "Active",
    accountStatus: "Active",
    loginStatus: "Active",
    lastLogin: "2026-09-12 08:30 AM",
    reportingManager: "Suresh Menon (Owner)",
    shift: "Morning Shift (08:30 AM - 05:30 PM)",
    weeklyOff: "Sunday",
    notes: "Oversees daily operations and staff allocations.",
    role: "Branch Manager",
    roleId: "ROLE-02",
    permittedBranches: ["Main Garage Branch", "Kochi South Branch"],
    salary: {
      basic: 30000,
      allowances: 10000,
      incentives: 8000,
      grossSalary: 48000,
      advanceBalance: 0
    },
    paymentType: "Monthly Salary",
    commissionRules: null,
    documents: [
      { id: "DOC-201", name: "Offer_Letter.pdf", type: "Contract", uploadedDate: "2024-03-01", uploadedBy: "HR Admin" }
    ],
    activityHistory: [
      { id: "ACT-10", action: "Shift Changed", oldValue: "General Shift", newValue: "Morning Shift", actor: "Suresh Menon", timestamp: "2026-02-01 09:00 AM" }
    ]
  },
  {
    id: "EMP-0018",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    name: "Priya Nair",
    phone: "+91 97441 88990",
    email: "priya.n@cubegears.com",
    designation: "Front Desk Receptionist",
    company: "CubeGears Garage Services",
    branch: "Kochi South Branch",
    branchId: "BR-02",
    joiningDate: "2025-06-15",
    employmentStatus: "Active",
    accountStatus: "Active",
    loginStatus: "Invite Sent",
    lastLogin: "-",
    reportingManager: "Rajesh V (Branch Manager)",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    weeklyOff: "Sunday",
    notes: "Customer intake and job scheduling specialist.",
    role: "Reception",
    roleId: "ROLE-03",
    permittedBranches: ["Kochi South Branch"],
    salary: {
      basic: 15000,
      allowances: 5000,
      incentives: 2000,
      grossSalary: 22000,
      advanceBalance: 1000
    },
    paymentType: "Salary + Commission",
    commissionRules: {
      basis: "Customer Referral Commission",
      method: "Percentage of Job Labour Revenue",
      defaultRate: "5%",
      applicableServices: "Customer Referral & Onboarding",
      effectiveDate: "2026-09-01"
    },
    documents: [],
    activityHistory: [
      { id: "ACT-20", action: "Login Invite Sent", oldValue: "Not Invited", newValue: "Invite Sent", actor: "Rajesh V", timestamp: "2025-06-15 11:30 AM" }
    ]
  },
  {
    id: "EMP-0021",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    name: "Vikram Sethi",
    phone: "+91 98460 77112",
    email: "vikram.s@cubegears.com",
    designation: "Storekeeper",
    company: "CubeGears Garage Services",
    branch: "Main Garage Branch",
    branchId: "BR-01",
    joiningDate: "2024-11-10",
    employmentStatus: "Inactive",
    accountStatus: "Inactive",
    loginStatus: "Inactive",
    lastLogin: "2026-07-20 05:10 PM",
    reportingManager: "Rajesh V (Branch Manager)",
    shift: "General Shift (09:00 AM - 06:00 PM)",
    weeklyOff: "Sunday",
    notes: "Resigned on 2026-07-31. Account deactivated.",
    role: "Storekeeper",
    roleId: "ROLE-06",
    permittedBranches: ["Main Garage Branch"],
    salary: {
      basic: 16000,
      allowances: 4000,
      incentives: 1000,
      grossSalary: 21000,
      advanceBalance: 0
    },
    paymentType: "Monthly Salary",
    commissionRules: null,
    documents: [
      { id: "DOC-301", name: "Resignation_Letter.pdf", type: "Document", uploadedDate: "2026-07-31", uploadedBy: "HR Admin" }
    ],
    activityHistory: [
      { id: "ACT-30", action: "Account Deactivated", oldValue: "Active", newValue: "Inactive", actor: "Rajesh V", timestamp: "2026-07-31 06:00 PM" }
    ]
  }
];
