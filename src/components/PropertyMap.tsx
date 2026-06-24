import { useEffect, useRef, useState } from 'react';
import { ApiProperty, formatApiPrice } from '../shared/propertyApi';

type PropertyMapProps = {
  properties: ApiProperty[];
  onPropertyClick?: (property: ApiProperty) => void;
  selectedPropertyId?: string;
};

export function PropertyMap({ properties, onPropertyClick, selectedPropertyId }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [error, setError] = useState('');
  const markersRef = useRef<any[]>([]);

  // Propiedades con coordenadas válidas
  const propertiesWithCoordinates = properties.filter(
    p => p.latitude != null && p.longitude != null && !isNaN(p.latitude) && !isNaN(p.longitude)
  );

  useEffect(() => {
    // Cargar Leaflet dinámicamente
    const loadLeaflet = async () => {
      try {
        // Cargar CSS de Leaflet
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Cargar script de Leaflet
        if (!(window as any).L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const L = (window as any).L;

        if (!mapRef.current) return;

        // Inicializar mapa
        const map = L.map(mapRef.current).setView([19.4326, -99.1332], 5); // Centro de México por defecto

        // Agregar capa de mapa (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        setMapInstance(map);

        // Ajustar vista si hay propiedades
        if (propertiesWithCoordinates.length > 0) {
          const bounds = L.latLngBounds(
            propertiesWithCoordinates.map(p => [p.latitude!, p.longitude!])
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        }

      } catch (err) {
        console.error('Error cargando Leaflet:', err);
        setError('No se pudo cargar el mapa. Verifica tu conexión a internet.');
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian las propiedades
  useEffect(() => {
    if (!mapInstance || !(window as any).L) return;

    const L = (window as any).L;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Crear iconos personalizados
    const createIcon = (isSelected: boolean, listingType: string) => {
      const color = listingType === 'SALE' ? '#0891b2' : '#7c3aed'; // cyan-600 o violet-600
      const borderColor = isSelected ? '#4f46e5' : color; // indigo-600 si está seleccionado
      const borderWidth = isSelected ? 4 : 2;

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: ${color};
            border: ${borderWidth}px solid ${borderColor};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
            ">
              ${listingType === 'SALE' ? '🏠' : '🏢'}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
    };

    // Agregar marcador para cada propiedad
    propertiesWithCoordinates.forEach(property => {
      const isSelected = property.id === selectedPropertyId;
      const icon = createIcon(isSelected, property.listingType);

      const marker = L.marker([property.latitude!, property.longitude!], { icon })
        .addTo(mapInstance);

      // Popup con información
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
          ${property.images?.[0] ? `
            <img
              src="${property.images[0].imageUrl.startsWith('http') ? property.images[0].imageUrl : 'http://localhost:8080' + property.images[0].imageUrl}"
              alt="${property.title}"
              style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
            />
          ` : ''}
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${property.title}</div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${property.code}</div>
          <div style="font-size: 14px; color: #4f46e5; font-weight: 700; margin-bottom: 8px;">${formatApiPrice(property)}</div>
          <div style="font-size: 11px; color: #64748b;">
            ${property.bedrooms ? `🛏️ ${property.bedrooms} rec` : ''}
            ${property.bathrooms ? `🚿 ${property.bathrooms} baños` : ''}
            ${property.constructionArea ? `📐 ${property.constructionArea} m²` : ''}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            📍 ${property.city}, ${property.stateCode}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Click en marcador
      marker.on('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property);
        }
      });

      // Abrir popup si está seleccionado
      if (isSelected) {
        marker.openPopup();
      }

      markersRef.current.push(marker);
    });

  }, [mapInstance, propertiesWithCoordinates, selectedPropertyId]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <svg className="mx-auto mb-3 size-12 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-sm font-medium text-rose-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[600px] w-full rounded-2xl border border-slate-200 shadow-sm" />

      {propertiesWithCoordinates.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/95">
          <div className="text-center">
            <svg className="mx-auto mb-3 size-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm font-medium text-slate-600">No hay propiedades con coordenadas</p>
            <p className="mt-1 text-xs text-slate-500">Agrega latitud y longitud a las propiedades para verlas en el mapa</p>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-cyan-600 border-2 border-cyan-600"></div>
            <span className="font-medium text-slate-700">Venta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-4 rounded-full bg-violet-600 border-2 border-violet-600"></div>
            <span className="font-medium text-slate-700">Renta</span>
          </div>
        </div>
      </div>

      {/* Contador */}
      {propertiesWithCoordinates.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-700">
            {propertiesWithCoordinates.length} {propertiesWithCoordinates.length === 1 ? 'propiedad' : 'propiedades'}
          </span>
        </div>
      )}
    </div>
  );
}
