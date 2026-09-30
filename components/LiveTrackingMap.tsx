
import React, { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import { Location, Grievance, IssueStatus } from '../types';
import { Crosshair, Loader2, Navigation, AlertCircle, RefreshCw, SignalHigh, X, Info } from 'lucide-react';

interface LiveTrackingMapProps {
  mode: 'picker' | 'viewer';
  initialLocation?: Location | null;
  onLocationSelect?: (loc: Location) => void;
  grievances?: Grievance[];
  onGrievanceClick?: (g: Grievance) => void;
  className?: string;
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ 
  mode, 
  initialLocation, 
  onLocationSelect, 
  grievances, 
  onGrievanceClick, 
  className = "h-[400px]"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [gpsSyncing, setGpsSyncing] = useState(false);
  const [gpsError, setGpsError] = useState<'PERMISSION_DENIED' | 'TIMEOUT' | 'POSITION_UNAVAILABLE' | null>(null);

  // Helper to resolve human-readable address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      
      const displayAddr = data.display_name || 'Specific address not found';
      const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city || 'Municipal Grid';
      
      setAddress(displayAddr);
      onLocationSelect?.({
        latitude: lat,
        longitude: lng,
        address: displayAddr,
        area: area
      });
    } catch (err) {
      console.error('Reverse geocoding failed', err);
      setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      onLocationSelect?.({
        latitude: lat,
        longitude: lng,
        address: 'Coordinate Lock',
        area: 'Manual Sector'
      });
    } finally {
      setLoading(false);
    }
  }, [onLocationSelect]);

  // Unified function to update marker and map view
  const updatePickerMarker = useCallback((lat: number, lng: number, moveMap: boolean = false) => {
    if (!mapRef.current) return;

    const coords: L.LatLngExpression = [lat, lng];

    if (markerRef.current) {
      markerRef.current.setLatLng(coords);
    } else {
      const icon = L.divIcon({
        className: 'picker-icon',
        html: `<div class="bg-blue-600 p-2 rounded-full border-2 border-white shadow-xl text-white flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                   <circle cx="12" cy="10" r="3"/>
                 </svg>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      markerRef.current = L.marker(coords, { draggable: true, icon })
        .addTo(mapRef.current)
        .on('dragend', (e: L.LeafletEvent) => {
          const target = e.target as L.Marker;
          const { lat, lng } = target.getLatLng();
          reverseGeocode(lat, lng);
        });
    }

    if (moveMap) {
      mapRef.current.flyTo(coords, 17, {
        duration: 1.8,
        easeLinearity: 0.15
      });
    }

    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  // High-Speed GPS Syncing (5s Timeout)
  const locateMe = useCallback((isManual: boolean = false) => {
    if (!navigator.geolocation) {
      if (isManual) alert("Geolocation not supported on this device.");
      return;
    }

    // MANDATORY: Clear UI state before starting fresh request
    setGpsError(null);
    setGpsSyncing(true);
    
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000, // FAST SYNC: 5 Seconds limit
      maximumAge: 0 // Do not use old cached positions
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsError(null);
        
        if (mode === 'picker') {
          updatePickerMarker(latitude, longitude, true);
        } else {
          mapRef.current?.flyTo([latitude, longitude], 15, { duration: 1.5 });
        }

        if (mapRef.current) {
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-location-pulsator',
              html: `<div class="relative flex items-center justify-center w-6 h-6">
                       <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-20"></div>
                       <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
                     </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon, zIndexOffset: 1000 }).addTo(mapRef.current);
          }
        }
        setGpsSyncing(false);
      },
      (err) => {
        // Silently fail on background attempts to avoid false 'Blocked' UI
        if (!isManual && err.code === 1) {
          setGpsSyncing(false);
          return;
        }

        if (err.code === 1) {
          setGpsError("PERMISSION_DENIED");
        } else if (err.code === 2) {
          setGpsError("POSITION_UNAVAILABLE");
        } else if (err.code === 3) {
          setGpsError("TIMEOUT");
        }
        
        console.warn(`GPS Signal Issue (${err.code}): ${err.message}`);
        setGpsSyncing(false);
      },
      options
    );
  }, [mode, updatePickerMarker]);

  // Initial Map Mount
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression = initialLocation 
      ? [initialLocation.latitude, initialLocation.longitude] 
      : [9.9252, 78.1198]; // Set default to Madurai

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(defaultCenter, mode === 'picker' ? 15 : 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);

    if (mode === 'picker') {
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updatePickerMarker(lat, lng);
      });
      
      if (initialLocation) {
        updatePickerMarker(initialLocation.latitude, initialLocation.longitude);
      } else {
        locateMe(false); // Fast background check
      }
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      userLocationMarkerRef.current = null;
    };
  }, []);

  // Sync Markers for Viewer/Admin modes
  useEffect(() => {
    if (mode === 'viewer' && markersGroupRef.current && grievances) {
      markersGroupRef.current.clearLayers();
      grievances.forEach(g => {
        const color = g.status === IssueStatus.RESOLVED ? '#10b981' : '#2563eb';
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        L.marker([g.location.latitude, g.location.longitude], { icon })
          .on('click', () => onGrievanceClick?.(g))
          .addTo(markersGroupRef.current!);
      });
    }
  }, [grievances, mode, onGrievanceClick]);

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-inner group ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      
      {/* Control Overlay */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-3 max-w-[85%]">
        <button 
          type="button"
          onClick={() => locateMe(true)}
          disabled={gpsSyncing}
          className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 transition-all active:scale-95 border border-white/20 ${
            gpsSyncing 
            ? 'bg-blue-600 text-white cursor-wait animate-pulse' 
            : gpsError === 'PERMISSION_DENIED'
            ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
            : gpsError 
            ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'
            : 'bg-white text-slate-900 hover:bg-blue-600 hover:text-white'
          }`}
        >
          {gpsSyncing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Signal Search...
            </>
          ) : gpsError === 'PERMISSION_DENIED' ? (
            <>
              <RefreshCw size={14} />
              GPS Blocked • Tap to Retry
            </>
          ) : gpsError ? (
            <>
              <SignalHigh size={14} />
              Signal Weak • Try Again
            </>
          ) : (
            <>
              <Navigation size={14} className={mode === 'viewer' ? 'rotate-45' : ''} />
              {mode === 'picker' ? 'Sync GPS Position' : 'Find My Location'}
            </>
          )}
        </button>
        
        {/* Active Geocode Label */}
        {mode === 'picker' && (address || loading) && !gpsError && (
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white text-[10px] font-bold text-slate-600 animate-slideUp">
            <span className="text-blue-600 font-black block mb-1 tracking-[0.1em]">DETECTED LOCATION</span>
            {loading ? (
              <div className="flex items-center gap-2 opacity-50">
                <Loader2 size={10} className="animate-spin" />
                Refining Grid...
              </div>
            ) : (
              <div className="line-clamp-2 leading-relaxed">{address}</div>
            )}
          </div>
        )}

        {/* Detailed Error & Instruction Panel */}
        {gpsError && (
          <div className={`bg-white/95 backdrop-blur-md p-5 rounded-[2rem] border-2 shadow-2xl animate-fadeIn flex items-start gap-4 ${
            gpsError === 'PERMISSION_DENIED' ? 'border-red-100' : 'border-orange-100'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${gpsError === 'PERMISSION_DENIED' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
               {gpsError === 'PERMISSION_DENIED' ? <AlertCircle size={20} /> : <SignalHigh size={20} />}
            </div>
            <div className="flex-grow">
              <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${
                gpsError === 'PERMISSION_DENIED' ? 'text-red-600' : 'text-orange-600'
              }`}>
                {gpsError === 'PERMISSION_DENIED' ? 'Location Access Blocked' : 
                 gpsError === 'TIMEOUT' ? 'GPS Signal Timeout' : 'Position Unavailable'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed pr-2">
                {gpsError === 'PERMISSION_DENIED' && "Browser access is denied. Click the lock icon 🔒 in your address bar, enable 'Location', then refresh."}
                {gpsError === 'TIMEOUT' && "Unable to get a lock within 5 seconds. Ensure you are outdoors or near a window for a clearer signal."}
                {gpsError === 'POSITION_UNAVAILABLE' && "Device GPS failed to resolve. Check if 'Location Services' are enabled in your device settings."}
              </p>
            </div>
            <button 
              onClick={() => setGpsError(null)} 
              className="text-slate-300 hover:text-slate-600 transition-colors shrink-0 pt-1"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Decorative inner border */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/40 rounded-[2.5rem] z-20"></div>
    </div>
  );
};

export default LiveTrackingMap;
