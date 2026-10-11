import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendPropertyInquiry, toE164 } from '../api/inquiryApi';
import { Alert, Button, Checkbox, cn, Input, Textarea } from '../../../shared/ui';

const VISIT_OPTIONS = ['Entre semana, mañana', 'Entre semana, tarde', 'Fin de semana', 'Lo platico con el asesor'];

interface PropertyInquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  companyName: string;
}

/**
 * Formulario "Me interesa" de la página pública. El backend lo convierte en prospecto de la
 * inmobiliaria, lo asigna a un asesor y le crea la tarea de primer contacto.
 */
export function PropertyInquiryForm({ propertyId, propertyTitle, companyName }: PropertyInquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredVisit, setPreferredVisit] = useState('');
  const [message, setMessage] = useState(`Hola, me interesa «${propertyTitle}». ¿Sigue disponible?`);
  const [acceptsPrivacy, setAcceptsPrivacy] = useState(false);
  const [website, setWebsite] = useState('');
  const [phoneError, setPhoneError] = useState<string>();
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const phoneE164 = toE164(phone);
    if (!phoneE164) {
      setPhoneError('Escribe tu número a 10 dígitos, o con lada internacional si no es de México.');
      return;
    }
    setPhoneError(undefined);
    setError(undefined);
    setSending(true);
    try {
      await sendPropertyInquiry(propertyId, {
        fullName: fullName.trim(),
        phoneE164,
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        preferredVisit: preferredVisit || undefined,
        acceptsPrivacy,
        website
      });
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error && !reason.message.startsWith('API error')
        ? reason.message
        : 'No pudimos enviar tu solicitud. Intenta de nuevo o escribe por WhatsApp.');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-success-soft p-4 text-success-fg" role="status">
        <p className="font-semibold">¡Listo, {fullName.trim().split(' ')[0]}!</p>
        <p className="mt-1 text-sm">{companyName} recibió tu solicitud y un asesor te contactará pronto.</p>
      </div>
    );
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      <Input autoComplete="name" label="Nombre completo" maxLength={160} minLength={2} onChange={event => setFullName(event.target.value)} required value={fullName} />
      <Input
        autoComplete="tel"
        error={phoneError}
        inputMode="tel"
        label="Teléfono / WhatsApp"
        onChange={event => setPhone(event.target.value)}
        placeholder="442 123 4567"
        required
        type="tel"
        value={phone}
      />
      <Input autoComplete="email" label="Correo (opcional)" maxLength={180} onChange={event => setEmail(event.target.value)} type="email" value={email} />

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-fg">¿Cuándo te gustaría visitarla?</legend>
        <div className="flex flex-wrap gap-1.5">
          {VISIT_OPTIONS.map(option => (
            <button
              aria-pressed={preferredVisit === option}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                preferredVisit === option ? 'border-primary bg-primary-soft text-primary-fg' : 'border-border text-fg-muted hover:border-border-strong'
              )}
              key={option}
              onClick={() => setPreferredVisit(preferredVisit === option ? '' : option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <Textarea className="min-h-20" label="Mensaje" maxLength={1000} onChange={event => setMessage(event.target.value)} value={message} />

      {/* Trampa para robots: invisible para las personas y fuera del orden de tabulación. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Sitio web
          <input autoComplete="off" name="website" onChange={event => setWebsite(event.target.value)} tabIndex={-1} type="text" value={website} />
        </label>
      </div>

      <Checkbox
        checked={acceptsPrivacy}
        label={<>Acepto el <Link className="text-primary-fg underline" target="_blank" to="/aviso-de-privacidad">aviso de privacidad</Link> y que me contacten.</>}
        onChange={event => setAcceptsPrivacy(event.target.checked)}
        required
      />

      {error && <Alert variant="error">{error}</Alert>}

      <Button fullWidth loading={sending} type="submit">
        {sending ? 'Enviando...' : 'Quiero que me contacten'}
      </Button>
    </form>
  );
}
