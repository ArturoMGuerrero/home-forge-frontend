import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type LocationPickerProps = {
  latitude?: string;
  longitude?: string;
  onLocationChange: (lat: number, lng: number) => void;
  onClose: () => void;
};

export function LocationPicker({ latitude, longitude, onLocationChange, onClose }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Validar y parsear coordenadas
  const parseCoordinate = (value: string | undefined, defaultValue: number): number => {
    if (!value || value.trim() === '') return defaultValue;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const [currentLat, setCurrentLat] = useState(parseCoordinate(latitude, 19.4326));
  const [currentLng, setCurrentLng] = useState(parseCoordinate(longitude, -99.1332));

  // Redondear a 6 decimales
  const roundTo6Decimals = (value: number): number => {
    return Math.round(value * 1000000) / 1000000;
  };

  useEffect(() => {
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';

    initMap();

    return () => {
      document.body.style.overflow = 'auto';
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.log('Error cleaning up map:', e);
        }
      }
    };
  }, []);

  const initMap = () => {
    try {
      if (!mapRef.current) {
        setError('Contenedor del mapa no disponible');
        setLoading(false);
        return;
      }

      // Evitar reinicialización si el mapa ya existe
      if (mapInstanceRef.current) {
        console.log('Mapa ya inicializado, omitiendo...');
        setLoading(false);
        return;
      }

      console.log('Inicializando mapa...');

      // Limpiar el contenedor por si acaso
      mapRef.current.innerHTML = '';

      const initialLat = parseCoordinate(latitude, 19.4326);
      const initialLng = parseCoordinate(longitude, -99.1332);

      console.log('Coordenadas iniciales:', initialLat, initialLng);

      // Crear mapa
      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true
      });

      mapInstanceRef.current = map;

      // Agregar capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Crear icono personalizado
      const customIcon = L.divIcon({
        className: 'custom-location-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            border: 4px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: move;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              font-size: 20px;
            ">
              📍
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      // Crear marcador arrastrable
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      markerRef.current = marker;

      // Evento al arrastrar
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCurrentLat(roundTo6Decimals(pos.lat));
        setCurrentLng(roundTo6Decimals(pos.lng));
      });

      // Click en el mapa
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setCurrentLat(roundTo6Decimals(e.latlng.lat));
        setCurrentLng(roundTo6Decimals(e.latlng.lng));
      });

      setLoading(false);
      console.log('Mapa inicializado correctamente');

    } catch (err) {
      console.error('Error al inicializar mapa:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el mapa');
      setLoading(false);
    }
  };

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'HomeForge/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Error en la búsqueda');

      const results = await response.json();

      if (results.length > 0) {
        const { lat, lon } = results[0];
        const latNum = roundTo6Decimals(parseFloat(lat));
        const lngNum = roundTo6Decimals(parseFloat(lon));

        setCurrentLat(latNum);
        setCurrentLng(lngNum);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latNum, lngNum], 15);
          markerRef.current.setLatLng([latNum, lngNum]);
        }
      } else {
        alert('No se encontró la ubicación. Intenta con otra búsqueda.');
      }
    } catch (err) {
      console.error('Error en geocodificación:', err);
      alert('Error al buscar la ubicación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    onLocationChange(currentLat, currentLng);
    onClose();
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = roundTo6Decimals(position.coords.latitude);
        const lng = roundTo6Decimals(position.coords.longitude);

        setCurrentLat(lat);
        setCurrentLng(lng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }

        setLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        setLoading(false);
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Seleccionar Ubicación</h2>
              <p className="mt-1 text-sm text-slate-500">
                {error ? 'Ocurrió un error al cargar el mapa' : 'Arrastra el marcador o haz click en el mapa'}
              </p>
            </div>
            <button
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              onClick={onClose}
              type="button"
            >
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Búsqueda */}
          {!error && (
            <div className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <svg className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Buscar: Av. Reforma 500, CDMX..."
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                disabled={loading || !searchQuery.trim()}
                onClick={handleSearch}
                type="button"
              >
                Buscar
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={useMyLocation}
                type="button"
              >
                📍 Mi ubicación
              </button>
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="relative p-6">
          {loading && (
            <div className="absolute inset-6 z-10 flex items-center justify-center rounded-xl bg-white">
              <div className="text-center">
                <div className="mb-3 inline-block size-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="text-sm font-medium text-slate-600">Cargando mapa...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-8 text-center">
              <svg className="mx-auto mb-3 size-12 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-semibold text-rose-700">{error}</p>
              <p className="mt-2 text-xs text-rose-600">Verifica tu conexión a internet</p>
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-800">
                  💡 Puedes escribir las coordenadas manualmente en el formulario
                </p>
              </div>
            </div>
          )}

          {!error && (
            <>
              <div ref={mapRef} className="h-[500px] w-full rounded-xl border border-slate-200" />

              {/* Coordenadas */}
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-900">Latitud</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-mono font-medium"
                      type="number"
                      step="0.000001"
                      value={currentLat.toFixed(6)}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= -90 && val <= 90) {
                          const rounded = roundTo6Decimals(val);
                          setCurrentLat(rounded);
                          if (markerRef.current) markerRef.current.setLatLng([rounded, currentLng]);
                          if (mapInstanceRef.current) mapInstanceRef.current.setView([rounded, currentLng]);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-900">Longitud</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-mono font-medium"
                      type="number"
                      step="0.000001"
                      value={currentLng.toFixed(6)}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= -180 && val <= 180) {
                          const rounded = roundTo6Decimals(val);
                          setCurrentLng(rounded);
                          if (markerRef.current) markerRef.current.setLatLng([currentLat, rounded]);
                          if (mapInstanceRef.current) mapInstanceRef.current.setView([currentLat, rounded]);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-6">
          <p className="text-xs text-slate-500">
            💡 Arrastra el marcador 📍 o haz click en el mapa
          </p>
          <div className="flex gap-3">
            <button
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              disabled={!!error}
              onClick={handleConfirm}
              type="button"
            >
              ✓ Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
