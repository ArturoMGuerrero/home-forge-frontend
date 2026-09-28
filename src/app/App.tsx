import '../shared/i18n/i18n';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers/AppProviders';
import { ThemedToaster } from './providers/ThemedToaster';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <ThemedToaster />
        <AppRouter />
      </BrowserRouter>
    </AppProviders>
  );
}
