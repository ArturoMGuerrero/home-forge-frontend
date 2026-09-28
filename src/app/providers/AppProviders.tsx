import type { PropsWithChildren } from 'react';
import { ThemeProvider } from '../../shared/contexts/ThemeContext';

export function AppProviders({ children }: PropsWithChildren) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
