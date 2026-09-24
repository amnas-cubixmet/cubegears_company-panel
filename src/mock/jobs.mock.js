export let jobsMock = [
  {
    id: "JOB-00251",
    jobNumber: "JOB-00251",
    customerId: "CUS-0001",
    customerName: "Rahul Kumar",
    customerPhone: "+91 98765 43210",
    customerEmail: "rahul.k@gmail.com",
    vehicleId: "VEH-0001",
    vehicleInfo: "Toyota Innova 2.5V",
    vehicleReg: "KL 10 AB 1234",
    kilometre: "1,24,500 km",
    fuelLevel: "50%",
    accessories: ["Tool Kit", "Spare Tyre", "Jack", "Music System"],
    existingDamage: ["Minor scratch on rear bumper", "Small dent on driver door"],
    branch: "Main Garage Branch",
    assignedEmployeeId: "EMP-0012",
    assignedEmployeeName: "Ajmal K",
    serviceAdvisor: "Rajesh V",
    priority: "High",
    status: "In Progress", // Draft | Checked In | Inspection | Awaiting Approval | In Progress | Waiting for Parts | Quality Check | Ready for Delivery | Delivered | Cancelled
    paymentStatus: "Partially Paid", // Unpaid | Partially Paid | Paid
    approvalStatus: "Approved", // Pending | Approved | Rejected
    createdDate: "2026-09-14",
    expectedDeliveryDate: "2026-09-14 05:30 PM",
    checkInTime: "2026-09-14 09:10 AM",
    complaints: [
      { id: "CMP-01", description: "Engine vibration during idling", wording: "Engine vibrates heavily when standing at signals", status: "In Progress", relatedService: "Engine Overhaul Work" },
      { id: "CMP-02", description: "AC not cooling properly", wording: "Blowing warm air after 10 minutes", status: "In Progress", relatedService: "AC Gas Top-Up & Filter Clean" },
      { id: "CMP-03", description: "Front brake squeal noise", wording: "High pitch squeal when braking downhill", status: "Completed", relatedService: "Front Brake Pad Replacement" }
    ],
    inspectionFindings: [
      { id: "FND-01", description: "Worn Engine Mount Rubber Bushing", severity: "High", photo: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=300", recommendedAction: "Replace Left Engine Mount Assembly", estimatedCost: 3200, addedToEstimate: true },
      { id: "FND-02", description: "Low Refrigerant Pressure & Dusty AC Filter", severity: "Medium", photo: null, recommendedAction: "Recharge R134a Gas & Replace Cabin Filter", estimatedCost: 1800, addedToEstimate: true }
    ],
    photos: [
      { id: "PH-01", stage: "Before", url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400", caption: "Initial Inspection - Front View", uploadedBy: "Rajesh V", timestamp: "2026-09-14 09:15 AM" },
      { id: "PH-02", stage: "During", url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400", caption: "Engine Dismantling & Mount Removal", uploadedBy: "Ajmal K", timestamp: "2026-09-14 11:30 AM" }
    ],
    services: [
      { id: "SRV-01", serviceCategory: "Mechanical Works", serviceName: "Engine Overhaul & Mount Replacement", qty: 1, labourRate: 2500, assignedStaff: "Ajmal K", estimatedDuration: "4 Hours", status: "In Progress" },
      { id: "SRV-02", serviceCategory: "AC Services", serviceName: "AC Gas Top-Up & Filter Clean", qty: 1, labourRate: 1400, assignedStaff: "Niyas P", estimatedDuration: "1.5 Hours", status: "Completed" }
    ],
    partsUsed: [
      { id: "P-01", partId: "STK-0002", name: "Engine Synthetic Oil 5W-30", sku: "OIL-5W30-4L", qty: 4, unitPrice: 850, total: 3400, status: "Issued", source: "Inventory" },
      { id: "P-02", partId: "STK-0005", name: "Oil Filter Cartridge", sku: "FLT-OIL-02", qty: 1, unitPrice: 450, total: 450, status: "Issued", source: "Inventory" }
    ],
    outsidePurchases: [
      { id: "OP-01", date: "2026-09-14", supplier: "ABC Auto Parts", partName: "Toyota Innova Left Engine Mount", partNumber: "ENG-MNT-TYT-09", qty: 1, purchasePrice: 3200, sellingPrice: 4500, markup: "40%", billNo: "BILL-9081", paymentStatus: "Paid", status: "Purchased" }
    ],
    labourRecords: [
      { id: "LAB-01", mechanicName: "Ajmal K", service: "Engine Overhaul Work", hours: 4.0, internalCost: 1200, customerCharge: 2500, commissionRate: "30%", commissionAmount: 750, status: "Approved" },
      { id: "LAB-02", mechanicName: "Niyas P", service: "AC Gas Top-Up", hours: 1.5, internalCost: 500, customerCharge: 1400, commissionRate: "₹300 / Service", commissionAmount: 300, status: "Approved" }
    ],
    estimates: [
      {
        version: "Estimate V1",
        date: "2026-09-14 10:30 AM",
        servicesTotal: 3900,
        partsTotal: 3850,
        outsidePurchasesTotal: 4500,
        otherCharges: 250,
        discount: 0,
        grandTotal: 12500,
        approvalStatus: "Approved",
        approvedBy: "Rahul Kumar (Customer via WhatsApp)",
        approvedAt: "2026-09-14 10:50 AM"
      }
    ],
    workUpdates: [
      { id: "UPD-01", staff: "Rajesh V", time: "09:10 AM", type: "Check-In", note: "Vehicle checked in and complaints logged.", status: "Checked In" },
      { id: "UPD-02", staff: "Ajmal K", time: "10:15 AM", type: "Inspection", note: "Engine mount rubber severely cracked. Quotation updated.", status: "Inspection" },
      { id: "UPD-03", staff: "Rajesh V", time: "10:50 AM", type: "Approval", note: "Estimate V1 approved by customer via phone.", status: "In Progress" },
      { id: "UPD-04", staff: "Ajmal K", time: "11:20 AM", type: "Parts Issued", note: "Outside engine mount delivered by ABC Auto Parts.", status: "In Progress" }
    ],
    qualityCheck: {
      inspector: "Rajesh V",
      checkDate: "2026-09-14",
      status: "Pending", // Pending | Pass | Rework Required
      checklist: [
        { item: "Engine Idle Stability", status: "Pass", remark: "Vibration completely eliminated" },
        { item: "AC Cooling Temperature", status: "Pass", remark: "Cooled to 6°C at vent" },
        { item: "Brake Squeal Test", status: "Pending", remark: "Road test required" },
        { item: "Fluid Levels Check", status: "Pass", remark: "All topped up" },
        { item: "Cabin Wash & Vacuum", status: "Pending", remark: "Scheduled before delivery" }
      ],
      testDriveNotes: "Smooth gear acceleration observed.",
      remarks: ""
    },
    billing: {
      advancePaid: 3000,
      invoiceNumber: "INV-2026-092",
      invoiceDate: "2026-09-14",
      invoiceTotal: 12500,
      paidAmount: 3000,
      outstandingBalance: 9500
    },
    delivery: {
      readyStatus: "In Progress",
      finalKm: "1,24,512 km",
      deliveryTime: "2026-09-14 05:30 PM",
      acknowledgedBy: "Rahul Kumar",
      creditDeliveryAllowed: false,
      notes: "Gate pass generated."
    },
    timeline: [
      { time: "09:10 AM", title: "Vehicle Checked In", desc: "Odometer: 1,24,500 km • Checked in by Service Advisor Rajesh V" },
      { time: "09:30 AM", title: "Inspection Started", desc: "Ajmal K assigned to diagnose engine vibration" },
      { time: "10:15 AM", title: "Inspection Completed", desc: "Left engine mount cracked. Added to estimate." },
      { time: "10:30 AM", title: "Estimate V1 Created", desc: "Total Estimate: ₹12,500 sent for customer confirmation" },
      { time: "10:50 AM", title: "Customer Approved", desc: "Estimate approved by Rahul Kumar via phone call" },
      { time: "11:20 AM", title: "Outside Purchase Received", desc: "Engine Mount purchased from ABC Auto Parts (Bill #BILL-9081)" },
      { time: "12:00 PM", title: "Work Commenced", desc: "Ajmal K started dismantling engine mount assembly" }
    ]
  },
  {
    id: "JOB-00252",
    jobNumber: "JOB-00252",
    customerId: "CUS-0002",
    customerName: "Siddharth P",
    customerPhone: "+91 98470 11223",
    customerEmail: "siddharth.p@gmail.com",
    vehicleId: "VEH-0002",
    vehicleInfo: "Honda City 1.5 i-VTEC",
    vehicleReg: "KL 07 BY 1234",
    kilometre: "88,200 km",
    fuelLevel: "30%",
    accessories: ["Jack", "Spare Wheel"],
    existingDamage: ["Scuff mark on front left fender"],
    branch: "Main Garage Branch",
    assignedEmployeeId: "EMP-0013",
    assignedEmployeeName: "Niyas P",
    serviceAdvisor: "Rajesh V",
    priority: "Medium",
    status: "Waiting for Parts",
    paymentStatus: "Unpaid",
    approvalStatus: "Approved",
    createdDate: "2026-09-13",
    expectedDeliveryDate: "2026-09-15 02:00 PM",
    checkInTime: "2026-09-13 03:00 PM",
    complaints: [
      { id: "CMP-10", description: "Clutch slipping on 3rd gear", wording: "High RPM engine revving but vehicle speed doesn't pickup", status: "Waiting for Parts", relatedService: "Clutch Assembly Replacement" }
    ],
    inspectionFindings: [
      { id: "FND-10", description: "Worn Out Clutch Disc & Pressure Plate", severity: "High", photo: null, recommendedAction: "Replace Full Clutch Kit Assembly", estimatedCost: 9500, addedToEstimate: true }
    ],
    photos: [],
    services: [
      { id: "SRV-10", serviceCategory: "Mechanical Works", serviceName: "Clutch Assembly Replacement", qty: 1, labourRate: 3500, assignedStaff: "Niyas P", estimatedDuration: "5 Hours", status: "Waiting" }
    ],
    partsUsed: [],
    partsWorkflow: {
      lines: [
        {
          id: "JPL-00252-01",
          partId: "STK-0007",
          partName: "Honda City Clutch Kit Assembly",
          partNo: "CLT-HON-CITY-15",
          barcode: "",
          brand: "Honda Genuine Parts",
          requestedQty: 1,
          sellingPrice: 9500,
          issuedTo: "Niyas P",
          lineStatus: "Open",
          issues: [],
          returns: []
        }
      ],
      transactions: [
        {
          id: "REQ-00252-01",
          type: "Required",
          partName: "Honda City Clutch Kit Assembly",
          qty: 1,
          createdAt: "2026-09-13T16:45:00.000Z",
          createdBy: "Rajesh V"
        }
      ],
      purchaseOrders: []
    },
    outsidePurchases: [],
    labourRecords: [],
    estimates: [
      { version: "Estimate V1", date: "2026-09-13 04:00 PM", servicesTotal: 3500, partsTotal: 9500, outsidePurchasesTotal: 0, otherCharges: 0, discount: 0, grandTotal: 13000, approvalStatus: "Approved", approvedBy: "Siddharth P", approvedAt: "2026-09-13 04:30 PM" }
    ],
    workUpdates: [
      { id: "UPD-10", staff: "Niyas P", time: "04:45 PM", type: "Part Alert", note: "Clutch kit out of stock in main inventory. Ordered from Honda Authorized distributor.", status: "Waiting for Parts" }
    ],
    qualityCheck: { inspector: "Rajesh V", checkDate: "2026-09-15", status: "Pending", checklist: [], testDriveNotes: "", remarks: "" },
    billing: { advancePaid: 0, invoiceNumber: null, invoiceDate: null, invoiceTotal: 13000, paidAmount: 0, outstandingBalance: 13000 },
    delivery: { readyStatus: "Waiting for Parts", finalKm: "88,200 km", deliveryTime: "2026-09-15 02:00 PM", acknowledgedBy: null, creditDeliveryAllowed: false, notes: "" },
    timeline: [
      { time: "03:00 PM", title: "Vehicle Checked In", desc: "Checked in for clutch slipping complaint" },
      { time: "04:45 PM", title: "Placed on Hold", desc: "Waiting for genuine Honda Clutch Kit arrival" }
    ]
  },
  {
    id: "JOB-00253",
    jobNumber: "JOB-00253",
    customerId: "CUS-0003",
    customerName: "Meera Menon",
    customerPhone: "+91 97441 88990",
    customerEmail: "meera.m@gmail.com",
    vehicleId: "VEH-0003",
    vehicleInfo: "Hyundai i20 Asta",
    vehicleReg: "KL 07 CD 9090",
    kilometre: "42,100 km",
    fuelLevel: "75%",
    accessories: ["Tool Kit", "First Aid Kit"],
    existingDamage: [],
    branch: "Kochi South Branch",
    assignedEmployeeId: "EMP-0015",
    assignedEmployeeName: "Priya Nair",
    serviceAdvisor: "Rajesh V",
    priority: "Low",
    status: "Delivered",
    paymentStatus: "Paid",
    approvalStatus: "Approved",
    createdDate: "2026-09-12",
    expectedDeliveryDate: "2026-09-12 04:00 PM",
    checkInTime: "2026-09-12 09:00 AM",
    complaints: [
      { id: "CMP-20", description: "Periodic Maintenance Service", wording: "40,000 km routine service & oil change", status: "Completed", relatedService: "Routine Service" }
    ],
    inspectionFindings: [],
    photos: [],
    services: [
      { id: "SRV-20", serviceCategory: "Routine Service", serviceName: "Periodical Service & Inspection", qty: 1, labourRate: 1200, assignedStaff: "Priya Nair", estimatedDuration: "2 Hours", status: "Completed" }
    ],
    partsUsed: [
      { id: "P-20", partId: "STK-0002", name: "Engine Synthetic Oil 5W-30", sku: "OIL-5W30-4L", qty: 3.5, unitPrice: 800, total: 2800, status: "Issued", source: "Inventory" }
    ],
    outsidePurchases: [],
    labourRecords: [
      { id: "LAB-20", mechanicName: "Priya Nair", service: "Periodical Service", hours: 2.0, internalCost: 400, customerCharge: 1200, commissionRate: "₹250", commissionAmount: 250, status: "Paid" }
    ],
    estimates: [
      { version: "Estimate V1", date: "2026-09-12 09:30 AM", servicesTotal: 1200, partsTotal: 2800, outsidePurchasesTotal: 0, otherCharges: 0, discount: 0, grandTotal: 4000, approvalStatus: "Approved", approvedBy: "Meera Menon", approvedAt: "2026-09-12 09:40 AM" }
    ],
    workUpdates: [
      { id: "UPD-20", staff: "Priya Nair", time: "03:30 PM", type: "Completion", note: "Service completed, washed & cleaned.", status: "Delivered" }
    ],
    qualityCheck: { inspector: "Rajesh V", checkDate: "2026-09-12", status: "Pass", checklist: [], testDriveNotes: "Passed all tests", remarks: "Clean delivery" },
    billing: { advancePaid: 0, invoiceNumber: "INV-2026-088", invoiceDate: "2026-09-12", invoiceTotal: 4000, paidAmount: 4000, outstandingBalance: 0 },
    delivery: { readyStatus: "Delivered", finalKm: "42,105 km", deliveryTime: "2026-09-12 04:15 PM", acknowledgedBy: "Meera Menon", creditDeliveryAllowed: false, notes: "Delivered in person." },
    timeline: [
      { time: "09:00 AM", title: "Vehicle Checked In", desc: "Checked in for periodic service" },
      { time: "04:15 PM", title: "Vehicle Delivered", desc: "Handed over to customer Meera Menon" }
    ]
  }
];

export const getMockJobs = () => [...jobsMock];

export const getMockJobById = (id) => jobsMock.find((j) => j.id === id || j.jobNumber === id);

export const addMockJob = (data) => {
  const newNum = `JOB-${String(jobsMock.length + 254).padStart(5, '0')}`;
  const newJob = {
    id: newNum,
    jobNumber: newNum,
    status: "Checked In",
    paymentStatus: "Unpaid",
    approvalStatus: "Pending",
    createdDate: new Date().toISOString().split('T')[0],
    checkInTime: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    complaints: data.complaints || [],
    inspectionFindings: [],
    photos: [],
    services: data.services || [],
    partsUsed: [],
    outsidePurchases: [],
    labourRecords: [],
    estimates: [],
    workUpdates: [
      { id: `UPD-${Date.now()}`, staff: data.serviceAdvisor || "Admin", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: "Check-In", note: "New Job Card created.", status: "Checked In" }
    ],
    qualityCheck: { inspector: "Unassigned", checkDate: "-", status: "Pending", checklist: [], testDriveNotes: "", remarks: "" },
    billing: { advancePaid: Number(data.advancePaid || 0), invoiceNumber: null, invoiceDate: null, invoiceTotal: 0, paidAmount: Number(data.advancePaid || 0), outstandingBalance: 0 },
    delivery: { readyStatus: "Checked In", finalKm: data.kilometre || "-", deliveryTime: data.expectedDeliveryDate || "-", acknowledgedBy: null, creditDeliveryAllowed: false, notes: "" },
    timeline: [
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), title: "Vehicle Checked In", desc: `Job Card ${newNum} created.` }
    ],
    ...data
  };
  jobsMock.unshift(newJob);
  return newJob;
};

export const updateMockJobStatus = (id, status) => {
  const job = jobsMock.find((j) => j.id === id || j.jobNumber === id);
  if (job) {
    job.status = status;
    job.workUpdates.unshift({
      id: `UPD-${Date.now()}`,
      staff: "Current Manager",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "Status Change",
      note: `Job status updated to ${status}.`,
      status
    });
    job.timeline.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Status Changed: ${status}`,
      desc: `Updated by manager`
    });
    return { ...job };
  }
  return null;
};

export const updateMockJob = (id, data) => {
  const idx = jobsMock.findIndex((j) => j.id === id || j.jobNumber === id);
  if (idx !== -1) {
    jobsMock[idx] = { ...jobsMock[idx], ...data };
    return jobsMock[idx];
  }
  return null;
};

export const deleteMockJob = (id) => {
  jobsMock = jobsMock.filter((j) => j.id !== id && j.jobNumber !== id);
  return true;
};

