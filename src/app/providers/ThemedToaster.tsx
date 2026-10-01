import { Toaster } from 'react-hot-toast';

// Los colores salen de los tokens del tema activo (ver index.css), así que no dependen del ThemeContext.
export function ThemedToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--hf-surface)',
          border: '1px solid var(--hf-border)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--hf-shadow-pop)',
          color: 'var(--hf-fg)',
          fontSize: '0.875rem',
        },
        success: { duration: 3000, iconTheme: { primary: 'var(--hf-success)', secondary: 'var(--hf-surface)' } },
        error: { duration: 5000, iconTheme: { primary: 'var(--hf-danger)', secondary: 'var(--hf-surface)' } },
      }}
    />
  );
}
