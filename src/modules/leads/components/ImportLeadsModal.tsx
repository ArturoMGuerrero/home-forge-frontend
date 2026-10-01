import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { createLead, CreateLeadPayload, LeadItem } from '../api/leadsApi';
import { Badge, Button, Modal, StatCard, TBody, TD, TH, TR } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';

type Props = {
  open: boolean;
  existingLeads: LeadItem[];
  onClose: () => void;
  onImported: (leads: LeadItem[]) => void;
};

type ImportRow = CreateLeadPayload & {
  rowNumber: number;
  issue?: string;
  duplicate?: boolean;
};

const aliases: Record<string, string[]> = {
  firstName: ['nombre', 'nombres', 'firstname', 'first_name'],
  lastName: ['apellido', 'apellidos', 'lastname', 'last_name'],
  email: ['email', 'correo', 'correo_electronico'],
  phoneE164: ['telefono', 'phone', 'celular', 'whatsapp', 'phonee164'],
  listingType: ['operacion', 'busca', 'listingtype', 'tipo_operacion'],
  budgetMax: ['presupuesto', 'presupuesto_maximo', 'budget', 'budgetmax'],
  currencyCode: ['moneda', 'currency', 'currencycode'],
  city: ['ciudad', 'city']
};

function normalizedHeader(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function valueFrom(row: Record<string, unknown>, field: string) {
  const entries = Object.entries(row);
  const match = entries.find(([key]) => aliases[field]?.includes(normalizedHeader(key)));
  return match?.[1] == null ? '' : String(match[1]).trim();
}

function normalizePhone(value: string) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return `+52${digits}`;
  return digits ? `+${digits}` : '';
}

export function ImportLeadsModal({ existingLeads, onClose, onImported, open }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const readyRows = useMemo(() => rows.filter(row => !row.issue && !row.duplicate), [rows]);

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const existingEmails = new Set(existingLeads.map(lead => lead.email?.trim().toLowerCase()).filter(Boolean));
      const existingPhones = new Set(existingLeads.map(lead => lead.phoneE164?.replace(/\D/g, '')).filter(Boolean));
      const fileEmails = new Set<string>();
      const filePhones = new Set<string>();
      const parsed = rawRows.map((raw, index): ImportRow => {
        const firstName = valueFrom(raw, 'firstName');
        const lastName = valueFrom(raw, 'lastName');
        const email = valueFrom(raw, 'email').toLowerCase();
        const phoneE164 = normalizePhone(valueFrom(raw, 'phoneE164'));
        const operation = valueFrom(raw, 'listingType').toUpperCase();
        const budgetText = valueFrom(raw, 'budgetMax').replace(/[^0-9.,-]/g, '').replace(/,/g, '');
        const phoneDigits = phoneE164.replace(/\D/g, '');
        const duplicate = Boolean(
          (email && (existingEmails.has(email) || fileEmails.has(email))) ||
          (phoneDigits && (existingPhones.has(phoneDigits) || filePhones.has(phoneDigits)))
        );
        if (email) fileEmails.add(email);
        if (phoneDigits) filePhones.add(phoneDigits);
        let issue = '';
        if (!firstName || !lastName) issue = 'Falta nombre o apellido';
        else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issue = 'Correo inválido';
        else if (phoneE164 && !/^\+[1-9][0-9]{1,14}$/.test(phoneE164)) issue = 'Teléfono inválido';
        return {
          rowNumber: index + 2,
          firstName,
          lastName,
          email: email || undefined,
          phoneE164: phoneE164 || undefined,
          listingType: operation === 'RENTA' || operation === 'RENT' ? 'RENT' : operation ? 'SALE' : undefined,
          budgetMax: budgetText && Number.isFinite(Number(budgetText)) ? Number(budgetText) : undefined,
          currencyCode: valueFrom(raw, 'currencyCode').toUpperCase() || 'MXN',
          city: valueFrom(raw, 'city') || undefined,
          duplicate,
          issue: issue || undefined
        };
      });
      setFileName(file.name);
      setRows(parsed);
      setProgress(0);
      if (!parsed.length) toast.error('El archivo no contiene registros.');
    } catch {
      toast.error('No fue posible leer el archivo. Usa CSV, XLS o XLSX.');
    } finally {
      event.target.value = '';
    }
  }

  async function importRows() {
    if (!readyRows.length) return;
    setImporting(true);
    setProgress(0);
    const created: LeadItem[] = [];
    let failed = 0;
    for (let index = 0; index < readyRows.length; index += 1) {
      const { rowNumber: _rowNumber, issue: _issue, duplicate: _duplicate, ...payload } = readyRows[index];
      try {
        created.push(await createLead(payload));
      } catch {
        failed += 1;
      }
      setProgress(index + 1);
    }
    setImporting(false);
    onImported(created);
    if (created.length) toast.success(`${created.length} prospectos importados correctamente.`);
    if (failed) toast.error(`${failed} registros no pudieron importarse.`);
    if (!failed) handleClose();
  }

  function handleClose() {
    if (importing) return;
    setRows([]);
    setFileName('');
    setProgress(0);
    onClose();
  }

  return (
    <Modal
      footer={
        <>
          <Button disabled={importing} onClick={handleClose} variant="tertiary">Cancelar</Button>
          <Button disabled={!readyRows.length} loading={importing} onClick={importRows}>{importing ? `Importando ${progress} de ${readyRows.length}` : `Importar ${readyRows.length} prospectos`}</Button>
        </>
      }
      isOpen={open}
      maxWidth="5xl"
      onClose={handleClose}
      subtitle="CSV, XLS o XLSX · los duplicados no se importarán"
      title="Importar prospectos"
    >
      <div className="space-y-5">
        <input accept=".csv,.xls,.xlsx" className="hidden" onChange={selectFile} ref={inputRef} type="file" />
        <button className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-strong bg-surface-muted px-5 py-8 text-center transition hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => inputRef.current?.click()} type="button">
          <span className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary-fg"><Icon className="size-6" name="upload" /></span>
          <strong className="mt-3 font-semibold text-fg">{fileName || 'Seleccionar archivo'}</strong>
          <span className="mt-1 text-sm text-fg-subtle">Columnas: Nombre, Apellidos, Correo, Teléfono, Operación, Presupuesto, Moneda y Ciudad.</span>
        </button>

        {rows.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Listos" tone="success" value={readyRows.length} />
              <StatCard label="Duplicados" tone="warning" value={rows.filter(row => row.duplicate).length} />
              <StatCard label="Con errores" tone="danger" value={rows.filter(row => row.issue).length} />
            </div>
            <div className="max-h-80 overflow-auto rounded-xl border border-border">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-border bg-surface-muted">
                  <tr>{['Fila', 'Prospecto', 'Contacto', 'Operación', 'Ciudad', 'Estado'].map(label => <TH key={label}>{label}</TH>)}</tr>
                </thead>
                <TBody>
                  {rows.slice(0, 100).map(row => (
                    <TR key={row.rowNumber}>
                      <TD className="text-fg-subtle">{row.rowNumber}</TD>
                      <TD className="font-medium text-fg">{row.firstName} {row.lastName}</TD>
                      <TD><span className="block">{row.email || '—'}</span><span>{row.phoneE164 || '—'}</span></TD>
                      <TD>{row.listingType === 'RENT' ? 'Renta' : 'Venta'}</TD>
                      <TD>{row.city || '—'}</TD>
                      <TD>{row.issue ? <Badge variant="error">{row.issue}</Badge> : row.duplicate ? <Badge variant="warning">Duplicado</Badge> : <Badge variant="success">Listo</Badge>}</TD>
                    </TR>
                  ))}
                </TBody>
              </table>
            </div>
          </>
        )}

      </div>
    </Modal>
  );
}

