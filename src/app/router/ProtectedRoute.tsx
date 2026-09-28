import { Navigate } from 'react-router-dom';
import { PrivateLayout } from '../../layout/PrivateLayout';
import { isAuthenticated } from '../../modules/auth';

export function ProtectedRoute() {
  return isAuthenticated() ? <PrivateLayout /> : <Navigate to="/login" replace />;
}
