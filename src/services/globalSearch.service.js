import { searchMockData } from '../mock/globalSearch.mock';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

/**
 * Global Search Service
 * Searches across Customers, Vehicles, Bookings, Job Cards, Invoices, Payments,
 * Stock Items, Services, Employees, Suppliers, and Notifications.
 *
 * Currently uses mock data; API endpoint ready for production backend.
 */
export const searchWorkspace = async (query, userRole = 'Admin') => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  if (USE_MOCK) {
    // Simulate short network delay for realistic experience
    await new Promise((resolve) => setTimeout(resolve, 150));
    const allResults = searchMockData(query);

    // Permission Filtering
    return allResults.filter((item) => {
      // Mechanics do not see financial invoices/payments or staff details
      if (userRole === 'Mechanic' || userRole === 'Technician') {
        if (['Invoices', 'Payments', 'Employees', 'Suppliers'].includes(item.group)) {
          return false;
        }
      }
      // Storekeepers focus on inventory, stock, suppliers, jobs
      if (userRole === 'Storekeeper') {
        if (['Employees', 'Payments'].includes(item.group)) {
          return false;
        }
      }
      return true;
    });
  }

  // Future API Client Integration:
  // const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}`);
  // return response.data;
  return [];
};
