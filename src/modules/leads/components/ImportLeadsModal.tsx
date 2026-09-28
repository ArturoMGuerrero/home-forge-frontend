import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { createLead, CreateLeadPayload, LeadItem } from '../api/leadsApi';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
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
    <Modal isOpen={open} maxWidth="5xl" noPadding onClose={handleClose} subtitle="CSV, XLS o XLSX · los duplicados no se importarán" title="Importar prospectos">
      <div className="space-y-5 p-4 sm:p-6">
        <input accept=".csv,.xls,.xlsx" className="hidden" onChange={selectFile} ref={inputRef} type="file" />
        <button className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50" onClick={() => inputRef.current?.click()} type="button">
          <span className="grid size-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-700"><Icon className="size-6" name="upload" /></span>
          <strong className="mt-3 text-slate-900">{fileName || 'Seleccionar archivo'}</strong>
          <span className="mt-1 text-sm text-slate-500">Columnas: Nombre, Apellidos, Correo, Teléfono, Operación, Presupuesto, Moneda y Ciudad.</span>
        </button>

        {rows.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Summary label="Listos" tone="emerald" value={readyRows.length} />
              <Summary label="Duplicados" tone="amber" value={rows.filter(row => row.duplicate).length} />
              <Summary label="Con errores" tone="rose" value={rows.filter(row => row.issue).length} />
            </div>
            <div className="max-h-80 overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-600"><tr><th className="p-3">Fila</th><th className="p-3">Prospecto</th><th className="p-3">Contacto</th><th className="p-3">Operación</th><th className="p-3">Ciudad</th><th className="p-3">Estado</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.slice(0, 100).map(row => <tr key={row.rowNumber} className="bg-white"><td className="p-3 text-slate-500">{row.rowNumber}</td><td className="p-3 font-semibold">{row.firstName} {row.lastName}</td><td className="p-3 text-slate-600"><span className="block">{row.email || '—'}</span><span>{row.phoneE164 || '—'}</span></td><td className="p-3">{row.listingType === 'RENT' ? 'Renta' : 'Venta'}</td><td className="p-3">{row.city || '—'}</td><td className="p-3">{row.issue ? <span className="text-rose-600">{row.issue}</span> : row.duplicate ? <span className="text-amber-600">Duplicado</span> : <span className="text-emerald-600">Listo</span>}</td></tr>)}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <Button disabled={importing} onClick={handleClose} variant="ghost">Cancelar</Button>
          <Button disabled={!readyRows.length} loading={importing} onClick={importRows}>{importing ? `Importando ${progress} de ${readyRows.length}` : `Importar ${readyRows.length} prospectos`}</Button>
        </div>
      </div>
    </Modal>
  );
}

function Summary({ label, tone, value }: { label: string; tone: 'emerald' | 'amber' | 'rose'; value: number }) {
  const colors = { emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800', amber: 'border-amber-200 bg-amber-50 text-amber-800', rose: 'border-rose-200 bg-rose-50 text-rose-800' };
  return <div className={`rounded-xl border p-3 ${colors[tone]}`}><strong className="text-xl">{value}</strong><span className="ml-2 text-sm font-semibold">{label}</span></div>;
}
