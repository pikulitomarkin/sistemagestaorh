import { ReportsPage as RHReportsPage } from '../rh/ReportsPage';

// Gerentes têm acesso aos mesmos relatórios que o RH
export function ManagerReportsPage() {
  return <RHReportsPage />;
}
