import { LeadList } from '../modules/leads/LeadList';

export function LeadsPage() {
  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">CRM</p>
        <h1 className="text-3xl font-bold">Prospectos</h1>
        <p className="mt-2 text-sm text-slate-500">Consulta y registra personas interesadas en tus propiedades.</p>
      </header>
      <LeadList expanded />
    </>
  );
}
