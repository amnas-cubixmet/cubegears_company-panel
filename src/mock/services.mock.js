// Custom Dynamic Categories with Sub-Types
export let serviceCategoriesMock = [
  {
    id: "CAT-001",
    name: "Washing",
    description: "Vehicle body, interior, and underbody cleaning services",
    status: "active",
    types: [
      { id: "TYP-101", name: "Full Body Wash", description: "Exterior foam wash & tire shine", defaultPrice: 500, estimatedTime: "45 mins", status: "active" },
      { id: "TYP-102", name: "Exterior Wash", description: "Quick exterior pressure wash", defaultPrice: 300, estimatedTime: "30 mins", status: "active" },
      { id: "TYP-103", name: "Interior Cleaning", description: "Vacuuming, seat shampooing & dashboard polish", defaultPrice: 800, estimatedTime: "60 mins", status: "active" },
      { id: "TYP-104", name: "Exterior + Interior", description: "Complete internal and external detailing", defaultPrice: 1100, estimatedTime: "90 mins", status: "active" },
      { id: "TYP-105", name: "Engine Room Wash", description: "Degreasing and high-pressure steam clean", defaultPrice: 800, estimatedTime: "40 mins", status: "active" },
      { id: "TYP-106", name: "Underbody Wash", description: "Underchassis anti-rust cleaning", defaultPrice: 450, estimatedTime: "30 mins", status: "active" }
    ]
  },
  {
    id: "CAT-002",
    name: "Mechanical Works",
    description: "Engine, gearbox, suspension, and brake repairs",
    status: "active",
    types: [
      { id: "TYP-201", name: "Routine Service", description: "Oil, filter, fluids, and multipoint inspection", defaultPrice: 2200, estimatedTime: "120 mins", status: "active" },
      { id: "TYP-202", name: "Engine Repair", description: "Diagnostic troubleshooting and component repair", defaultPrice: 3500, estimatedTime: "240 mins", status: "active" },
      { id: "TYP-203", name: "Engine Overhaul", description: "Complete engine dismantling, rebuild and tuning", defaultPrice: 18500, estimatedTime: "2880 mins", status: "active" },
      { id: "TYP-204", name: "Clutch Work", description: "Clutch plate, pressure plate & release bearing", defaultPrice: 4200, estimatedTime: "180 mins", status: "active" },
      { id: "TYP-205", name: "Gearbox Work", description: "Manual/Automatic transmission servicing", defaultPrice: 5500, estimatedTime: "300 mins", status: "active" },
      { id: "TYP-206", name: "Suspension Work", description: "Shock absorber, strut & bushing replacement", defaultPrice: 3200, estimatedTime: "150 mins", status: "active" },
      { id: "TYP-207", name: "Brake Work", description: "Brake pad, rotor disc, and fluid flush", defaultPrice: 1800, estimatedTime: "90 mins", status: "active" },
      { id: "TYP-208", name: "Cooling System", description: "Radiator, water pump & thermostat service", defaultPrice: 2400, estimatedTime: "120 mins", status: "active" }
    ]
  },
  {
    id: "CAT-003",
    name: "Body Works",
    description: "Panel repair, denting, and tinkering services",
    status: "active",
    types: [
      { id: "TYP-301", name: "Denting", description: "Precision dent removal per panel", defaultPrice: 1500, estimatedTime: "180 mins", status: "active" },
      { id: "TYP-302", name: "Tinkering", description: "Structural sheet metal alignment", defaultPrice: 2800, estimatedTime: "240 mins", status: "active" },
      { id: "TYP-303", name: "Panel Repair", description: "Fiber & steel panel restoration", defaultPrice: 2200, estimatedTime: "180 mins", status: "active" },
      { id: "TYP-304", name: "Panel Replacement", description: "OE panel installation & alignment", defaultPrice: 4500, estimatedTime: "300 mins", status: "active" },
      { id: "TYP-305", name: "Accident Repair", description: "Chassis pull & major collision restoration", defaultPrice: 12500, estimatedTime: "1440 mins", status: "active" }
    ]
  },
  {
    id: "CAT-004",
    name: "Painting",
    description: "Full body refinishing, bumper, and touch-up painting",
    status: "active",
    types: [
      { id: "TYP-401", name: "Full Body Painting", description: "Complete booth painting with clear coat", defaultPrice: 35000, estimatedTime: "4320 mins", status: "active" },
      { id: "TYP-402", name: "Panel Painting", description: "Single panel color match painting", defaultPrice: 3200, estimatedTime: "360 mins", status: "active" },
      { id: "TYP-403", name: "Bumper Painting", description: "Front/Rear bumper refinish", defaultPrice: 2500, estimatedTime: "240 mins", status: "active" },
      { id: "TYP-404", name: "Touch-up", description: "Scratch & chip color touch-up", defaultPrice: 1200, estimatedTime: "120 mins", status: "active" }
    ]
  },
  {
    id: "CAT-005",
    name: "Electrical & AC",
    description: "Wiring, alternator, battery, and AC gas recharge",
    status: "active",
    types: [
      { id: "TYP-501", name: "AC Gas Recharge", description: "R134a refrigerant refill & leak test", defaultPrice: 1800, estimatedTime: "60 mins", status: "active" },
      { id: "TYP-502", name: "AC Compressor Service", description: "Clutch, coil & oil replacement", defaultPrice: 4500, estimatedTime: "180 mins", status: "active" },
      { id: "TYP-503", name: "Wiring & Diagnostics", description: "ECU scan & harness troubleshooting", defaultPrice: 1500, estimatedTime: "90 mins", status: "active" }
    ]
  }
];

export let servicesMock = [
  { id: "SRV-0001", code: "FULL-TUNE", name: "Full Engine Tuneup & Diagnostics", category: "Mechanical Works", categoryId: "CAT-002", typeId: "TYP-202", durationMinutes: 120, price: 2500.00, status: "active" },
  { id: "SRV-0002", code: "BRAKE-PAD", name: "Front & Rear Brake Pad Replacement", category: "Mechanical Works", categoryId: "CAT-002", typeId: "TYP-207", durationMinutes: 60, price: 1800.00, status: "active" },
  { id: "SRV-0003", code: "OIL-CHANGE", name: "Synthetic Motor Oil & Filter Change", category: "Washing", categoryId: "CAT-001", typeId: "TYP-101", durationMinutes: 30, price: 850.00, status: "active" }
];

export const getMockCategories = () => [...serviceCategoriesMock];

export const addMockCategory = (data) => {
  const newCat = {
    id: `CAT-${String(serviceCategoriesMock.length + 1).padStart(3, '0')}`,
    status: "active",
    types: [],
    ...data
  };
  serviceCategoriesMock.push(newCat);
  return newCat;
};

export const addMockServiceType = (categoryId, typeData) => {
  const cat = serviceCategoriesMock.find(c => c.id === categoryId);
  if (cat) {
    const newType = {
      id: `TYP-${Date.now()}`,
      status: "active",
      ...typeData
    };
    cat.types.push(newType);
    return newType;
  }
  return null;
};

export const getMockServices = () => [...servicesMock];
export const addMockService = (data) => {
  const newSrv = {
    id: `SRV-${String(servicesMock.length + 1).padStart(4, '0')}`,
    status: "active",
    ...data
  };
  servicesMock.unshift(newSrv);
  return newSrv;
};


export const getMockServiceById = (id) => servicesMock.find((service) => service.id === id) || null;

export const updateMockService = (id, data) => {
  const index = servicesMock.findIndex((service) => service.id === id);
  if (index === -1) return null;
  servicesMock[index] = { ...servicesMock[index], ...data, id };
  return servicesMock[index];
};

export const deleteMockService = (id) => {
  const index = servicesMock.findIndex((service) => service.id === id);
  if (index === -1) return false;
  servicesMock.splice(index, 1);
  return true;
};

export const updateMockCategory = (id, data) => {
  const index = serviceCategoriesMock.findIndex((category) => category.id === id);
  if (index === -1) return null;
  serviceCategoriesMock[index] = { ...serviceCategoriesMock[index], ...data, id };
  return serviceCategoriesMock[index];
};

export const deleteMockCategory = (id) => {
  const index = serviceCategoriesMock.findIndex((category) => category.id === id);
  if (index === -1) return false;
  const category = serviceCategoriesMock[index];
  if (servicesMock.some((service) => service.categoryId === id || service.category === category.name)) {
    throw new Error('Move or delete services in this category before deleting it.');
  }
  serviceCategoriesMock.splice(index, 1);
  return true;
};
