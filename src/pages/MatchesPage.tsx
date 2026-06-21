import { FormEvent, useEffect, useState } from 'react';
import { LeadItem } from '../shared/leads';
import { ApiProperty, formatApiPrice } from '../shared/propertyApi';
import { createMatch, deleteMatch, listMatches, loadOperationsContext, PropertyMatch, updateMatch } from '../shared/operationsApi';

export function MatchesPage() {
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [form, setForm] = useState({ leadId: '', propertyId: '', notes: '' });
  const [error, setError] = useState('');
  const [searchLead, setSearchLead] = useState('');
  const [searchProperty, setSearchProperty] = useState('');

  useEffect(() => {
    Promise.all([listMatches(), loadOperationsContext()])
      .then(([items, [leadItems, propertyItems]]) => {
        setMatches(items);
        setLeads(leadItems);
        setProperties(propertyItems);
      })
      .catch(e => setError(e.message));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const created = await createMatch({ ...form, notes: form.notes || undefined });
      setMatches(current => [created, ...current]);
      setForm({ leadId: '', propertyId: '', notes: '' });
      setSearchLead('');
      setSearchProperty('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible asignar la propiedad.');
    }
  }

  async function changeStatus(item: PropertyMatch, status: PropertyMatch['status']) {
    const updated = await updateMatch({ ...item, status });
    setMatches(current => current.map(match => (match.id === item.id ? updated : match)));
  }

  async function remove(id: string) {
    await deleteMatch(id);
    setMatches(current => current.filter(item => item.id !== id));
  }

  const filteredLeads = leads.filter(lead => {
    if (!searchLead) return true;
    const query = searchLead.toLowerCase();
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return fullName.includes(query) || lead.email?.toLowerCase().includes(query);
  });

  const filteredProperties = properties.filter(property => {
    if (!searchProperty) return true;
    const query = searchProperty.toLowerCase();
    return (
      property.code?.toLowerCase().includes(query) ||
      property.title?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query)
    );
  });

  const selectedProperty = properties.find(property => property.id === form.propertyId);
  const selectedLead = leads.find(lead => lead.id === form.leadId);

  return (
    <>
      <header className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">Comercial</p>
        <h1 className="mt-1 text-3xl font-bold">Prospecto y propiedad</h1>
        <p className="mt-2 text-sm text-slate-500">Recomienda inmuebles y registra el nivel de interés de cada prospecto.</p>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <form className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}>
        <div className="grid gap-5 md:grid-cols-2">
          {/* Selector de Prospecto con búsqueda */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Prospecto</label>

            {/* Campo de búsqueda para prospecto */}
            <div className="relative mb-2">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-11 pr-9 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={e => setSearchLead(e.target.value)}
                placeholder="Buscar por nombre o email..."
                type="text"
                value={searchLead}
              />
              {searchLead && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setSearchLead('')}
                  type="button"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 pl-11 pr-10 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={e => {
                  setForm({ ...form, leadId: e.target.value });
                  setSearchLead('');
                }}
                required
                value={form.leadId}
              >
                <option value="">Seleccionar prospecto ({filteredLeads.length})</option>
                {filteredLeads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName} {lead.email ? `· ${lead.email}` : ''}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {selectedLead && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {selectedLead.firstName} {selectedLead.lastName} seleccionado
              </p>
            )}
            {searchLead && filteredLeads.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">No se encontraron prospectos con "{searchLead}"</p>
            )}
          </div>

          {/* Selector de Propiedad con búsqueda */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">Propiedad</label>

            {/* Campo de búsqueda para propiedad */}
            <div className="relative mb-2">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-11 pr-9 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={e => setSearchProperty(e.target.value)}
                placeholder="Buscar por código, título o ciudad..."
                type="text"
                value={searchProperty}
              />
              {searchProperty && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setSearchProperty('')}
                  type="button"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <select
                className="w-full appearance-none rounded-xl border border-slate-200 py-2.5 pl-11 pr-10 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={e => {
                  setForm({ ...form, propertyId: e.target.value });
                  setSearchProperty('');
                }}
                required
                value={form.propertyId}
              >
                <option value="">Seleccionar propiedad ({filteredProperties.length})</option>
                {filteredProperties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.code} · {property.title} · {property.city}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {selectedProperty && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatApiPrice(selectedProperty)}
              </p>
            )}
            {searchProperty && filteredProperties.length === 0 && (
              <p className="mt-2 text-xs text-amber-600">No se encontraron propiedades con "{searchProperty}"</p>
            )}
          </div>
        </div>

        {/* Campo de notas */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold text-slate-700">Nota de la recomendación (opcional)</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            maxLength={3000}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Ej: Propiedad ideal para su presupuesto, excelente ubicación cerca de escuelas..."
            rows={3}
            value={form.notes}
          />
          <p className="mt-1 text-xs text-slate-400">{form.notes.length}/3000 caracteres</p>
        </div>

        {/* Botón de submit */}
        <button
          className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!form.leadId || !form.propertyId}
          type="submit"
        >
          {selectedProperty ? `Asignar propiedad · ${formatApiPrice(selectedProperty)}` : 'Asignar propiedad'}
        </button>
      </form>

      {/* Lista de asignaciones */}
      <div className="grid gap-4 lg:grid-cols-2">
        {matches.map(item => (
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md" key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                  {item.propertyCode}
                </span>
                <h2 className="mt-2 truncate text-lg font-bold text-slate-900">{item.propertyTitle}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="truncate">Para {item.leadName}</span>
                </p>
              </div>
              <button
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                onClick={() => remove(item.id)}
                type="button"
              >
                Quitar
              </button>
            </div>

            {item.notes && (
              <div className="mt-4 rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-500">Nota:</p>
                <p className="mt-1 text-sm text-slate-700">{item.notes}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Estado de la recomendación</label>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={e => changeStatus(item, e.target.value as PropertyMatch['status'])}
                value={item.status}
              >
                <option value="SUGGESTED">💡 Sugerida</option>
                <option value="SENT">📤 Enviada</option>
                <option value="INTERESTED">⭐ Interesado</option>
                <option value="VISIT_SCHEDULED">📅 Visita agendada</option>
                <option value="REJECTED">❌ Descartada</option>
              </select>
            </div>
          </article>
        ))}

        {matches.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center lg:col-span-2">
            <svg className="mx-auto mb-3 size-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm font-medium text-slate-600">Todavía no hay propiedades asignadas</p>
            <p className="mt-1 text-xs text-slate-400">Comienza seleccionando un prospecto y una propiedad arriba</p>
          </div>
        )}
      </div>
    </>
  );
}
