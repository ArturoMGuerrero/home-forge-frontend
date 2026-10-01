import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Alert, Button, Input, LoadingState, Modal, SearchInput } from '../../../shared/ui';

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
        setLoading(false);
        return;
      }


      // Limpiar el contenedor por si acaso
      mapRef.current.innerHTML = '';

      const initialLat = parseCoordinate(latitude, 19.4326);
      const initialLng = parseCoordinate(longitude, -99.1332);


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
        toast.error('No se encontró la ubicación. Intenta con otra búsqueda.');
      }
    } catch (err) {
      console.error('Error en geocodificación:', err);
      toast.error('Error al buscar la ubicación. Intenta de nuevo.');
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
      toast.error('Tu navegador no soporta geolocalización');
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
      () => {
        toast.error('No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        setLoading(false);
      }
    );
  }

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} variant="tertiary">Cancelar</Button>
          <Button disabled={!!error} onClick={handleConfirm}>Confirmar ubicación</Button>
        </>
      }
      isOpen
      maxWidth="4xl"
      onClose={onClose}
      subtitle={error ? 'Ocurrió un error al cargar el mapa' : 'Arrastra el marcador o haz clic en el mapa'}
      title="Seleccionar ubicación"
    >
      {!error && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <SearchInput
            aria-label="Buscar dirección"
            containerClassName="flex-1"
            onChange={e => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Buscar: Av. Reforma 500, CDMX..."
            value={searchQuery}
          />
          <div className="flex gap-2">
            <Button className="min-h-11 flex-1" disabled={loading || !searchQuery.trim()} onClick={handleSearch}>Buscar</Button>
            <Button className="min-h-11 flex-1" onClick={useMyLocation} variant="tertiary">Mi ubicación</Button>
          </div>
        </div>
      )}

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-[1000] grid place-items-center rounded-xl bg-surface/90">
            <LoadingState message="Cargando mapa..." />
          </div>
        )}

        {error ? (
          <Alert title={error} variant="error">
            Verifica tu conexión a internet. También puedes escribir las coordenadas manualmente en el formulario.
          </Alert>
        ) : (
          <>
            <div className="h-[50vh] max-h-[500px] min-h-72 w-full overflow-hidden rounded-xl border border-border" ref={mapRef} />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                className="font-mono"
                label="Latitud"
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= -90 && val <= 90) {
                    const rounded = roundTo6Decimals(val);
                    setCurrentLat(rounded);
                    if (markerRef.current) markerRef.current.setLatLng([rounded, currentLng]);
                    if (mapInstanceRef.current) mapInstanceRef.current.setView([rounded, currentLng]);
                  }
                }}
                step="0.000001"
                type="number"
                value={currentLat.toFixed(6)}
              />
              <Input
                className="font-mono"
                label="Longitud"
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= -180 && val <= 180) {
                    const rounded = roundTo6Decimals(val);
                    setCurrentLng(rounded);
                    if (markerRef.current) markerRef.current.setLatLng([currentLat, rounded]);
                    if (mapInstanceRef.current) mapInstanceRef.current.setView([currentLat, rounded]);
                  }
                }}
                step="0.000001"
                type="number"
                value={currentLng.toFixed(6)}
              />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
