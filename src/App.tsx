import './shared/i18n/i18n';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import { UsersPage } from './pages/UsersPage';
import { isAuthenticated } from './shared/auth';
import { AgendaPage } from './pages/AgendaPage';
import { MatchesPage } from './pages/MatchesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

function ProtectedApp() {
  return isAuthenticated() ? <PrivateLayout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="prospectos/:leadId" element={<LeadDetailPage />} />
          <Route path="propiedades" element={<PropertiesPage />} />
          <Route path="propiedades/nueva" element={<NewPropertyPage />} />
          <Route path="propiedades/:propertyId/editar" element={<NewPropertyPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="asignaciones" element={<MatchesPage />} />
          <Route path="documentos" element={<DocumentsPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
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
