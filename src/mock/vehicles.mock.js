export let vehiclesMock = [
  {
    id: "VEH-0001",
    customerId: "CUS-0001",
    customerName: "Sarah Jenkins",
    make: "Toyota",
    model: "Camry SE",
    year: 2022,
    licensePlate: "ABC-1234",
    vin: "4T1B11HK5NW123456",
    color: "Midnight Black",
    engineType: "2.5L 4-Cylinder",
    lastServiceDate: "2026-08-15"
  },
  {
    id: "VEH-0002",
    customerId: "CUS-0002",
    customerName: "Michael Chang",
    make: "BMW",
    model: "X5 xDrive40i",
    year: 2021,
    licensePlate: "XYZ-9876",
    vin: "5UXCR6C05M9B98765",
    color: "Alpine White",
    engineType: "3.0L Turbo Inline-6",
    lastServiceDate: "2026-09-02"
  },
  {
    id: "VEH-0003",
    customerId: "CUS-0003",
    customerName: "David Smith",
    make: "Ford",
    model: "F-150 Lariat",
    year: 2020,
    licensePlate: "TEX-5544",
    vin: "1FTFW1E84LKD55443",
    color: "Velocity Blue",
    engineType: "3.5L V6 EcoBoost",
    lastServiceDate: "2026-06-20"
  }
];

export const getMockVehicles = () => [...vehiclesMock];
export const getMockVehicleById = (id) => vehiclesMock.find((v) => v.id === id);
export const addMockVehicle = (data) => {
  const newVeh = {
    id: `VEH-${String(vehiclesMock.length + 1).padStart(4, '0')}`,
    ...data
  };
  vehiclesMock.unshift(newVeh);
  return newVeh;
};
export const updateMockVehicle = (id, data) => {
  const idx = vehiclesMock.findIndex((v) => v.id === id);
  if (idx !== -1) {
    vehiclesMock[idx] = { ...vehiclesMock[idx], ...data };
    return vehiclesMock[idx];
  }
  return null;
};
export const deleteMockVehicle = (id) => {
  vehiclesMock = vehiclesMock.filter((v) => v.id !== id);
  return true;
};
