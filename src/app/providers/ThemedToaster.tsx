import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../shared/contexts/ThemeContext';

const palettes = {
  light: { background: '#ffffff', color: '#0f172a', border: '#e2e8f0', shadow: '0 18px 45px -18px rgba(15, 23, 42, .35)' },
  dark: { background: '#1e293b', color: '#f8fafc', border: '#475569', shadow: '0 18px 45px -18px rgba(0, 0, 0, .7)' },
  obsidian: { background: '#1b1c26', color: '#f5f5fa', border: '#353544', shadow: '0 18px 48px -16px rgba(0, 0, 0, .85)' },
} as const;

export function ThemedToaster() {
  const { theme } = useTheme();
  const palette = palettes[theme];

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: { background: palette.background, border: `1px solid ${palette.border}`, boxShadow: palette.shadow, color: palette.color },
        success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: palette.background } },
        error: { duration: 5000, iconTheme: { primary: '#ef4444', secondary: palette.background } },
      }}
    />
  );
}
