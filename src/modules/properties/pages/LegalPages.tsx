import { useEffect } from 'react';
import { Alert, Card } from '../../../shared/ui';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';

// TODO(legal): reemplazar por el texto definitivo revisado por un abogado antes de lanzar.
// El aviso de privacidad es obligatorio (LFPDPPP) porque el sitio recibe datos de contacto de interesados.
function LegalPage({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    document.title = `${title} | HomeForge`;
  }, [title]);

  return (
    <div className="min-h-screen bg-app">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-fg">{title}</h1>
        <Card className="mt-6 sm:p-8">
          <p className="text-base leading-7 text-fg-muted">{description}</p>
          <Alert className="mt-6" variant="info">Este documento se publicará aquí próximamente.</Alert>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}

export function PrivacyNoticePage() {
  return (
    <LegalPage
      description="En este aviso explicamos qué datos personales recabamos a través de HomeForge, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO)."
      title="Aviso de privacidad"
    />
  );
}

export function TermsPage() {
  return (
    <LegalPage
      description="Estas condiciones regulan el uso del sitio de propiedades de HomeForge y de la plataforma para inmobiliarias."
      title="Términos y condiciones"
    />
  );
}
