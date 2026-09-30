export let customersMock = [
  {
    id: "CUS-0001",
    name: "Rahul Kumar",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "rahul.k@gmail.com",
    address: "Door 4B, Green Park Avenue, Marine Drive",
    city: "Kochi",
    state: "Kerala",
    pincode: "682031",
    customerType: "Individual",
    companyName: "",
    gstNo: "",
    branch: "Main Garage Branch",
    status: "Active", // Active | Inactive | Archived
    createdAt: "2026-01-15",
    lastVisit: "2026-09-12",
    notes: "Prefers evening delivery. Call before replacing additional parts."
  },
  {
    id: "CUS-0002",
    name: "Siddharth P",
    phone: "+91 98470 11223",
    whatsapp: "+91 98470 11223",
    email: "siddharth.p@gmail.com",
    address: "Flat 10C, Sky Towers, Kakkanad",
    city: "Kochi",
    state: "Kerala",
    pincode: "682030",
    customerType: "Individual",
    companyName: "",
    gstNo: "",
    branch: "Main Garage Branch",
    status: "Active",
    createdAt: "2026-02-10",
    lastVisit: "2026-09-13",
    notes: "Requires genuine OEM Honda spare parts only."
  },
  {
    id: "CUS-0003",
    name: "Meera Menon",
    phone: "+91 97441 88990",
    whatsapp: "+91 97441 88990",
    email: "meera.m@gmail.com",
    address: "Plot 45, Panampilly Nagar",
    city: "Kochi",
    state: "Kerala",
    pincode: "682036",
    customerType: "Individual",
    companyName: "",
    gstNo: "",
    branch: "Kochi South Branch",
    status: "Active",
    createdAt: "2026-03-01",
    lastVisit: "2026-09-12",
    notes: "Regular 10k km maintenance customer."
  },
  {
    id: "CUS-0004",
    name: "Apex Logistics & Travels Ltd",
    phone: "+91 98950 44556",
    whatsapp: "+91 98950 44556",
    email: "fleet@apexlogistics.in",
    address: "Industrial Zone, Edappally",
    city: "Kochi",
    state: "Kerala",
    pincode: "682024",
    customerType: "Business / Company",
    companyName: "Apex Logistics & Travels Ltd",
    gstNo: "32AAAAA0000A1Z5",
    branch: "Main Garage Branch",
    status: "Active",
    createdAt: "2026-04-18",
    lastVisit: "2026-09-08",
    notes: "Fleet account. Monthly consolidated credit billing."
  },
  {
    id: "CUS-0005",
    name: "Anil Varma",
    phone: "+91 94471 22334",
    whatsapp: "+91 94471 22334",
    email: "anil.v@yahoo.com",
    address: "House #12, Hill Palace Road, Tripunithura",
    city: "Kochi",
    state: "Kerala",
    pincode: "682301",
    customerType: "Individual",
    companyName: "",
    gstNo: "",
    branch: "Kochi South Branch",
    status: "Inactive",
    createdAt: "2025-11-20",
    lastVisit: "2026-05-14",
    notes: "Moved to TVM branch area."
  }
];

export const getMockCustomers = () => [...customersMock];

export const getMockCustomerById = (id) => customersMock.find((c) => c.id === id);

export const addMockCustomer = (data) => {
  const newId = `CUS-${String(customersMock.length + 1).padStart(4, '0')}`;
  const newCustomer = {
    id: newId,
    status: "Active",
    createdAt: new Date().toISOString().split('T')[0],
    lastVisit: "Just Added",
    notes: data.notes || "",
    ...data
  };
  customersMock.unshift(newCustomer);
  return newCustomer;
};

export const updateMockCustomer = (id, data) => {
  const index = customersMock.findIndex((c) => c.id === id);
  if (index !== -1) {
    customersMock[index] = { ...customersMock[index], ...data };
    return customersMock[index];
  }
  return null;
};

export const archiveMockCustomer = (id) => {
  const customer = customersMock.find(c => c.id === id);
  if (customer) {
    customer.status = "Archived";
    return customer;
  }
  return null;
};

export const checkDuplicateMockCustomer = (payload) => {
  const phoneMatch = payload.phone && customersMock.find(c => c.phone.replace(/\D/g, '').includes(payload.phone.replace(/\D/g, '')));
  const whatsappMatch = payload.whatsapp && customersMock.find(c => c.whatsapp.replace(/\D/g, '').includes(payload.whatsapp.replace(/\D/g, '')));
  const emailMatch = payload.email && customersMock.find(c => c.email.toLowerCase() === payload.email.toLowerCase());
  return phoneMatch || whatsappMatch || emailMatch || null;
};
