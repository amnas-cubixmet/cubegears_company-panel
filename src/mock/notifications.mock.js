export let notificationsMock = [
  {
    id: "NOT-0001",
    title: "Low Stock Alert: Oil Filters",
    message: "Bosch Heavy Duty Oil Filter Element (SKU: FLT-OIL-HD) is down to 4 units in stock.",
    time: "10 mins ago",
    read: false
  },
  {
    id: "NOT-0002",
    title: "Job Card Completed",
    message: "Job Card #JOB-0002 for BMW X5 (Michael Chang) has been marked as Completed.",
    time: "1 hour ago",
    read: true
  }
];

export const getMockNotifications = () => [...notificationsMock];
