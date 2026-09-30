export const websiteMock = {
  profile: {
    heroTitle: "Premium Automobile Maintenance & Repairs",
    heroSubtitle: "Certified mechanics, transparent pricing, and instant job tracking.",
    address: "100 Industrial Parkway, Garage District",
    phone: "+1 (800) 555-GEAR",
    email: "info@cubixgear.com",
    published: true
  },
  services: [
    { name: "Full Diagnostics", price: "$250.00" },
    { name: "Brake Service", price: "$150.00" },
    { name: "Synthetic Oil Change", price: "$85.00" }
  ]
};

export const getMockWebsite = () => ({ ...websiteMock });
