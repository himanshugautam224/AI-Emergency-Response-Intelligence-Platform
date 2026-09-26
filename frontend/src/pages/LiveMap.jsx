import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayerGroup, ZoomControl, useMap } from 'react-leaflet';
import { RefreshCw, AlertTriangle, Layers, MapPin, Navigation, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { incidentsAPI, riskAPI } from '../api/client';
import { useGeolocation } from '../hooks/useGeolocation';

// Fix Leaflet icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ALERT_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

function createMarkerIcon(color, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}80;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 12px #3b82f680;"></div>
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(59,130,246,0.2);animation:pulse 2s infinite;"></div>
    </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to fly to coordinates when they become available
function FlyToLocation({ lat, lon }) {
  const map = useMap();
  const hasFlewRef = useRef(false);
  useEffect(() => {
    if (lat && lon && !hasFlewRef.current) {
      map.flyTo([lat, lon], 10, { duration: 2 });
      hasFlewRef.current = true;
    }
  }, [lat, lon, map]);
  return null;
}

export default function LiveMap() {
  const geo = useGeolocation();
  const [incidents, setIncidents] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');
  const [mapStyle, setMapStyle] = useState('dark');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, heatRes] = await Promise.all([
        incidentsAPI.list({ limit: 500 }).catch(() => ({ data: [] })),
        riskAPI.heatmap().catch(() => ({ data: [] })),
      ]);
      setIncidents(incRes.data || []);
      setHeatmap(heatRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterLevel === 'all'
    ? incidents
    : incidents.filter(i => i.alert_level === filterLevel);

  const withCoords = filtered.filter(i => i.latitude && i.longitude);

  // Default center: India center (map loads here, then flies to user)
  const defaultCenter = [20.5937, 78.9629];

  return (
    <div style={{ height: 'calc(100vh - var(--topbar-h))', display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', overflow: 'hidden' }}>

      {/* Tactical Map Toolbar */}
      <div style={{
        padding: '10px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>

        {/* User location chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
          borderRadius: 6, fontSize: 11, fontWeight: 600,
          background: geo.loading ? 'rgba(59,130,246,0.1)' : geo.error ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          color: geo.loading ? '#60a5fa' : geo.error ? '#f87171' : '#4ade80',
          border: `1px solid ${geo.loading ? 'rgba(59,130,246,0.3)' : geo.error ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
        }}>
          {geo.loading ? (
            <><Navigation size={10} style={{ animation: 'spin 1.5s linear infinite' }} /> Detecting location…</>
          ) : geo.error ? (
            <><AlertTriangle size={10} /> Location unavailable</>
          ) : (
            <><Crosshair size={10} /> {geo.lat.toFixed(3)}°N, {geo.lon.toFixed(3)}°E</>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Map Style */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
          {[
            { id: 'dark', label: 'Dark' },
            { id: 'satellite', label: 'Satellite' },
            { id: 'street', label: 'Street' },
          ].map(style => (
            <button
              key={style.id}
              onClick={() => setMapStyle(style.id)}
              style={{
                padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: mapStyle === style.id ? 'var(--primary)' : 'transparent',
                color: mapStyle === style.id ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Alert filters */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'critical', 'high', 'medium', 'low'].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                cursor: 'pointer', border: '1px solid',
                background: filterLevel === level ? (ALERT_COLORS[level] || 'var(--primary)') + '20' : 'transparent',
                color: filterLevel === level ? (ALERT_COLORS[level] || 'var(--primary)') : 'var(--text-muted)',
                borderColor: filterLevel === level ? (ALERT_COLORS[level] || 'var(--primary)') + '50' : 'var(--border)',
                textTransform: 'capitalize',
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowHeatmap(h => !h)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
            background: showHeatmap ? 'rgba(139,92,246,0.15)' : 'var(--surface-2)',
            border: `1px solid ${showHeatmap ? 'rgba(139,92,246,0.4)' : 'var(--border)'}`,
            borderRadius: 6, color: showHeatmap ? '#a78bfa' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: 12,
          }}
        >
          <Layers size={12} /> Risk Zones
        </button>

        {!geo.error && geo.lat && (
          <button
            onClick={() => setShowUserLocation(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
              background: showUserLocation ? 'rgba(59,130,246,0.15)' : 'var(--surface-2)',
              border: `1px solid ${showUserLocation ? 'rgba(59,130,246,0.4)' : 'var(--border)'}`,
              borderRadius: 6, color: showUserLocation ? '#60a5fa' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 12,
            }}
          >
            <MapPin size={12} /> My Location
          </button>
        )}

        <button onClick={fetchData} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
        }}>
          <RefreshCw size={12} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          Refresh
        </button>

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {withCoords.length} incidents plotted
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={defaultCenter}
          zoom={5}
          style={{ height: '100%', width: '100%', background: '#0f1117' }}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />

          {/* Fly to user's real location when GPS is ready */}
          {!geo.loading && !geo.error && geo.lat && (
            <FlyToLocation lat={geo.lat} lon={geo.lon} />
          )}

          {mapStyle === 'dark' && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              maxZoom={16}
            />
          )}
          {mapStyle === 'satellite' && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
              maxZoom={18}
            />
          )}
          {mapStyle === 'street' && (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              maxZoom={18}
            />
          )}

          {/* User's real location marker */}
          {showUserLocation && !geo.loading && !geo.error && geo.lat && (
            <Marker position={[geo.lat, geo.lon]} icon={userLocationIcon}>
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#3b82f6' }}>📍 Your Location</div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {geo.lat.toFixed(5)}°N, {geo.lon.toFixed(5)}°E
                  </div>
                  {geo.accuracy && (
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      GPS accuracy: ±{Math.round(geo.accuracy)}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Accuracy radius around user */}
          {showUserLocation && !geo.loading && !geo.error && geo.lat && geo.accuracy && (
            <Circle
              center={[geo.lat, geo.lon]}
              radius={geo.accuracy}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 1 }}
            />
          )}

          {/* Risk heatmap circles */}
          {showHeatmap && (
            <LayerGroup>
              {heatmap.map((point, i) => (
                <Circle
                  key={i}
                  center={[point.lat, point.lon]}
                  radius={80000 * point.intensity}
                  pathOptions={{
                    color: 'transparent',
                    fillColor: `hsl(${Math.round((1 - point.intensity) * 120)}, 80%, 50%)`,
                    fillOpacity: 0.15,
                  }}
                >
                  <Popup>
                    <strong>{point.label}</strong><br />
                    Risk Index: {(point.intensity * 100).toFixed(0)}%
                  </Popup>
                </Circle>
              ))}
            </LayerGroup>
          )}

          {/* Incident markers */}
          <LayerGroup>
            {withCoords.map((inc) => (
              <Marker
                key={inc.id}
                position={[inc.latitude, inc.longitude]}
                icon={createMarkerIcon(ALERT_COLORS[inc.alert_level] || '#94a3b8')}
              >
                <Popup>
                  <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{inc.title}</div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                      📍 {inc.location_name} · {inc.state}
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                      Type: <strong>{inc.disaster_type}</strong>
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                      Affected: <strong>{inc.affected_population?.toLocaleString()}</strong>
                    </div>
                    <div style={{ fontSize: 12, marginBottom: 4 }}>
                      Casualties: <strong style={{ color: '#ef4444' }}>{inc.casualties}</strong>
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10,
                      fontWeight: 700, background: ALERT_COLORS[inc.alert_level] + '20',
                      color: ALERT_COLORS[inc.alert_level], textTransform: 'uppercase', marginTop: 4,
                    }}>
                      {inc.alert_level}
                    </div>
                    {inc.risk_score > 0 && (
                      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                        Risk Score: {(inc.risk_score * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        </MapContainer>

        {/* Map Canvas Legend */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20, zIndex: 450,
          background: 'var(--bg-glass)', backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border)', borderRadius: 10,
          padding: '10px 14px', fontSize: 11,
          boxShadow: 'var(--shadow-md)',
        }}>
          {Object.entries(ALERT_COLORS).map(([level, color]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{level}</span>
            </div>
          ))}
          {!geo.error && geo.lat && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
              <span style={{ color: '#60a5fa' }}>You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
