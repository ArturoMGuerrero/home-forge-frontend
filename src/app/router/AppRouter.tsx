import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RouteFallback } from './RouteFallback';

const page = <T,>(loader: () => Promise<T>, name?: keyof T) => lazy(async () => {
  const module = await loader();
  return { default: name ? module[name] as ComponentType : (module as { default: ComponentType }).default };
});

const DashboardPage = page(() => import('../../modules/dashboard/pages/DashboardPage'), 'DashboardPage');
const LeadsPage = page(() => import('../../modules/leads/pages/LeadsPage'), 'LeadsPage');
const LoginPage = page(() => import('../../modules/auth/pages/LoginPage'), 'LoginPage');
const NewPropertyPage = page(() => import('../../modules/properties/pages/NewPropertyPage'), 'NewPropertyPage');
const PlansPage = page(() => import('../../modules/settings/pages/PlansPage'), 'PlansPage');
const PropertiesPage = page(() => import('../../modules/properties/pages/PropertiesPage'), 'PropertiesPage');
const PublicPropertiesPage = page(() => import('../../modules/properties/pages/PublicPropertiesPage'), 'PublicPropertiesPage');
const RegisterPage = page(() => import('../../modules/auth/pages/RegisterPage'), 'RegisterPage');
const SettingsPage = page(() => import('../../modules/settings/pages/SettingsPage'), 'SettingsPage');
const CatalogPage = page(() => import('../../modules/settings/pages/CatalogPage'), 'CatalogPage');
const CompanyProfileSettingsPage = page(() => import('../../modules/settings/pages/CompanyProfileSettingsPage'), 'CompanyProfileSettingsPage');
const PublicCompanyPage = page(() => import('../../modules/companies/pages/PublicCompanyPage'), 'PublicCompanyPage');
const PublicPropertyDetailPage = page(() => import('../../modules/properties/pages/PublicPropertyDetailPage'), 'PublicPropertyDetailPage');
const LeadDetailPage = page(() => import('../../modules/leads/pages/LeadDetailPage'), 'LeadDetailPage');
const LeadsPipelinePage = page(() => import('../../modules/leads/pages/LeadsPipelinePage'));
const FollowUpTasksPage = page(() => import('../../modules/leads/pages/FollowUpTasksPage'));
const UsersManagementPage = page(() => import('../../modules/users/pages/UsersManagementPage'), 'UsersManagementPage');
const AgendaPage = page(() => import('../../modules/appointments/pages/AgendaPage'), 'AgendaPage');
const MatchesPage = page(() => import('../../modules/leads/pages/MatchesPage'), 'MatchesPage');
const DocumentsPage = page(() => import('../../modules/documents/pages/DocumentsPage'), 'DocumentsPage');
const ContractsPage = page(() => import('../../modules/documents/pages/ContractsPage'));
const TemplatesPage = page(() => import('../../modules/documents/pages/TemplatesPage'));
const NotificationsPage = page(() => import('../../modules/notifications/pages/NotificationsPage'));
const MessageTemplatesPage = page(() => import('../../modules/notifications/pages/MessageTemplatesPage'));
const TemplateEditorPage = page(() => import('../../modules/notifications/pages/TemplateEditorPage'));
const CalendarPage = page(() => import('../../modules/appointments/pages/CalendarPage'));
const AgentAvailabilityPage = page(() => import('../../modules/appointments/pages/AgentAvailabilityPage'));
const ReportsPage = page(() => import('../../modules/reports/pages/ReportsPage'), 'ReportsPage');
const ForgotPasswordPage = page(() => import('../../modules/auth/pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const AccountSettingsPage = page(() => import('../../modules/settings/pages/AccountSettingsPage'), 'AccountSettingsPage');
const ResetPasswordPage = page(() => import('../../modules/auth/pages/ResetPasswordPage'), 'ResetPasswordPage');
const AssignmentRulesPage = page(() => import('../../modules/leads/pages/AssignmentRulesPage'), 'AssignmentRulesPage');
const PaymentSuccessPage = page(() => import('../../modules/payments/pages/PaymentSuccessPage'), 'PaymentSuccessPage');
const PaymentFailurePage = page(() => import('../../modules/payments/pages/PaymentFailurePage'), 'PaymentFailurePage');
const PaymentPendingPage = page(() => import('../../modules/payments/pages/PaymentPendingPage'), 'PaymentPendingPage');

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/propiedades" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-contraseña" element={<ForgotPasswordPage />} />
        <Route path="/restablecer-contraseña" element={<ResetPasswordPage />} />
        <Route path="/propiedades" element={<PublicPropertiesPage />} />
        <Route path="/propiedades/:propertyId" element={<PublicPropertyDetailPage />} />
        <Route path="/empresas/:companyId" element={<PublicCompanyPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/failure" element={<PaymentFailurePage />} />
        <Route path="/payment/pending" element={<PaymentPendingPage />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="prospectos" element={<LeadsPage />} />
          <Route path="prospectos/pipeline" element={<LeadsPipelinePage />} />
          <Route path="prospectos/tareas" element={<FollowUpTasksPage />} />
          <Route path="prospectos/:leadId" element={<LeadDetailPage />} />
          <Route path="propiedades" element={<PropertiesPage />} />
          <Route path="propiedades/nueva" element={<NewPropertyPage />} />
          <Route path="propiedades/:propertyId/editar" element={<NewPropertyPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="calendario" element={<CalendarPage />} />
          <Route path="calendario/disponibilidad" element={<AgentAvailabilityPage />} />
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
          <Route path="cuenta" element={<AccountSettingsPage />} />
          <Route path="configuracion" element={<SettingsPage />} />
          <Route path="configuracion/empresa" element={<CompanyProfileSettingsPage />} />
          <Route path="configuracion/asignacion" element={<AssignmentRulesPage />} />
          <Route path="configuracion/catalogos/:catalogName" element={<CatalogPage />} />
          {/* Rutas internas desconocidas regresan al panel en vez de salir al sitio público. */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
