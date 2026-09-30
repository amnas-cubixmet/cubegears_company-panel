export const reportsMock = {
  salesSummary: {
    totalRevenue: 45280.00,
    growthPercentage: 12.4,
    monthlyBreakdown: [
      { month: "Jan", revenue: 32000 },
      { month: "Feb", revenue: 38000 },
      { month: "Mar", revenue: 41200 },
      { month: "Apr", revenue: 45280 }
    ]
  },
  stockSummary: {
    totalSKUs: 142,
    totalValuation: 28500.00,
    lowStockAlerts: 3
  },
  employeeEfficiency: [
    { employee: "Alex Rivera", jobsCompleted: 18, efficiencyScore: "96%" },
    { employee: "Dan Miller", jobsCompleted: 14, efficiencyScore: "92%" }
  ]
};

export const getMockReports = () => ({ ...reportsMock });
