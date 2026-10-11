/**
 * Fondo del encabezado del sitio público: degradado de marca, una retícula tenue y un perfil de casas
 * en línea. Es fijo a propósito: no usa fotos de propiedades publicadas (calidad variable, marcas de
 * agua, fachadas de clientes) y no cambia según lo último que se publicó.
 */
export function PublicHeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(79_70_229/0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(16_185_129/0.16),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
      <svg
        className="absolute -right-10 bottom-0 hidden h-[78%] text-white/[0.09] md:block lg:right-0"
        fill="none"
        preserveAspectRatio="xMaxYMax meet"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.5"
        viewBox="0 0 640 320"
      >
        {/* Edificio de departamentos */}
        <path d="M20 320V120h110v200" />
        <path d="M45 145h20v20H45zM85 145h20v20H85zM45 185h20v20H45zM85 185h20v20H85zM45 225h20v20H45zM85 225h20v20H85zM62 280h26v40H62z" />
        {/* Casa de dos aguas */}
        <path d="M150 320V200l75-60 75 60v120" />
        <path d="M135 212l90-72 90 72" />
        <path d="M205 320v-55h40v55M170 225h28v28h-28zM252 225h28v28h-28z" />
        {/* Casa de dos pisos con cochera */}
        <path d="M330 320V150h130v170" />
        <path d="M318 160l77-55 77 55" />
        <path d="M352 175h30v28h-30zM408 175h30v28h-30zM352 230h30v28h-30zM405 270h36v50" />
        <path d="M460 320v-90h80v90M460 250h80M470 230l35-28 35 28" />
        {/* Torre */}
        <path d="M560 320V70h60v250" />
        <path d="M575 90h12v14h-12zM595 90h12v14h-12zM575 125h12v14h-12zM595 125h12v14h-12zM575 160h12v14h-12zM595 160h12v14h-12zM575 195h12v14h-12zM595 195h12v14h-12zM575 230h12v14h-12zM595 230h12v14h-12z" />
        <path d="M0 320h640" />
      </svg>
    </div>
  );
}
