import './shared/i18n/i18n';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PrivateLayout } from './layout/PrivateLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { LoginPage } from './pages/LoginPage';
import { NewPropertyPage } from './pages/NewPropertyPage';
import { PlansPage } from './pages/PlansPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PublicPropertiesPage } from './pages/PublicPropertiesPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';
import { CatalogPage } from './pages/CatalogPage';
import { CompanyProfileSettingsPage } from './pages/CompanyProfileSettingsPage';
import { PublicCompanyPage } from './pages/PublicCompanyPage';
import { PublicPropertyDetailPage } from './pages/PublicPropertyDetailPage';
import { LeadDetailPage } from './pages/LeadDetailPage';
import LeadsPipelinePage from './pages/LeadsPipelinePage';
import FollowUpTasksPage from './pages/FollowUpTasksPage';
import { UsersPage } from './pages/UsersPage';
import { UsersManagementPage } from './pages/UsersManagementPage';
import { isAuthenticated } from './shared/auth';
import { AgendaPage } from './pages/AgendaPage';
import { MatchesPage } from './pages/MatchesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import ContractsPage from './pages/ContractsPage';
import TemplatesPage from './pages/TemplatesPage';
import NotificationsPage from './pages/NotificationsPage';
import MessageTemplatesPage from './pages/MessageTemplatesPage';
import TemplateEditorPage from './pages/TemplateEditorPage';
import { ReportsPage } from './pages/ReportsPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentFailurePage } from './pages/PaymentFailurePage';
import { PaymentPendingPage } from './pages/PaymentPendingPage';

function ProtectedApp() {
  return isAuthenticated() ? <PrivateLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/propiedades" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-contraseña" element={<ForgotPasswordPage />} />
        <Route path="/propiedades" element={<PublicPropertiesPage />} />
        <Route path="/propiedades/:propertyId" element={<PublicPropertyDetailPage />} />
        <Route path="/empresas/:companyId" element={<PublicCompanyPage />} />
        <Route path="/app" element={<ProtectedApp />}>
          <Route index element={<DashboardPage />} />
          <Route path="prospectos" element={<LeadsPage />} />
          <Route path="prospectos/pipeline" element={<LeadsPipelinePage />} />
          <Route path="prospectos/tareas" element={<FollowUpTasksPage />} />
          <Route path="prospectos/:leadId" element={<LeadDetailPage />} />
          <Route path="propiedades" element={<PropertiesPage />} />
          <Route path="propiedades/nueva" element={<NewPropertyPage />} />
          <Route path="propiedades/:propertyId/editar" element={<NewPropertyPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="asignaciones" element={<MatchesPage />} />
          <Route path="documentos" element={<DocumentsPage />} />
          <Route path="contratos" element={<ContractsPage />} />
          <Route path="contratos/plantillas" element={<TemplatesPage />} />
          <Route path="notificaciones" element={<NotificationsPage />} />
          <Route path="notificaciones/plantillas" element={<MessageTemplatesPage />} />
          <Route path="notificaciones/plantillas/nueva" element={<TemplateEditorPage />} />
          <Route path="notificaciones/plantillas/:templateId" element={<TemplateEditorPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="usuarios" element={<UsersManagementPage />} />
          <Route path="planes" element={<PlansPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="configuracion/empresa" element={<CompanyProfileSettingsPage />} />
          <Route path="configuracion/catalogos/:catalogName" element={<CatalogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
