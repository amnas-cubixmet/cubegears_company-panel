
import { FinancePanel } from './FinancePanel';
import { QuickActionsPanel } from './QuickActionsPanel';
import { WorkshopStaffPanel } from './WorkshopStaffPanel';
import { useFeatureAccess } from '../../context/FeatureAccessContext';

export const DashboardBottomGrid = ({ data, user, onNavigate }) => {
  const { can } = useFeatureAccess();
  return (
  <section className="dashboard-bottom-grid">
    {(can('payments.view') || can('invoices.view')) && <FinancePanel payments={data?.payments} />}
    {can('staff.view') && <WorkshopStaffPanel staff={data?.staffAvailability} />}
    <QuickActionsPanel user={user} onNavigate={onNavigate} />
  </section>
  );
};
