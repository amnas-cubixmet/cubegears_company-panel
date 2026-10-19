
import { Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

// Customer management now has one directory page. Old management subpages redirect to it.
export const CustomerManagementTabs = () => (
  <nav className="customer-management-tabs" aria-label="Customer Management navigation">
    <div className="customer-management-tabs__rail">
      <NavLink to="/customers" end className={({ isActive }) =>
        `customer-management-tab ${isActive ? 'active' : ''}`
      }>
        <Users size={15} />
        <span>All Customers</span>
      </NavLink>
    </div>
  </nav>
);
