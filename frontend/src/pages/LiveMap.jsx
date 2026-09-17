import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import Topbar from '../components/Topbar';
import { incidentsAPI } from '../api/client';
import { AlertTriangle, Filter, Layers, Navigation, Shield, Flame, Waves, Wind } from 'lucide-react';

// Fix Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom incident icons based on alert level
const createCustomIcon = (alertLevel) => {
  const color = alertLevel === 'red' ? '#ef4444' : alertLevel === 'orange' ? '#f97316' : '#22c55e';
  const pulseClass = alertLevel === 'red' ? 'animation: pulse 1.5s infinite;' : '';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 13px;
        font-weight: bold;
        ${pulseClass}
      ">
        !
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

const INITIAL_INCIDENTS = [
  {
    id: 1,
    title: 'Severe Cyclone Dana - Coastal Surge',
    disaster_type: 'cyclone',
    alert_level: 'red',
    latitude: 20.9517,
    longitude: 86.8530,
    state: 'Odisha',
    district: 'Bhadrak',
    affected_population: 185000,
    status: 'active',
    severity_score: 0.94,
  },
  {
    id: 2,
    title: 'Flash Flooding & Mithi River Overspill',
    disaster_type: 'flood',
    alert_level: 'red',
    latitude: 19.0760,
    longitude: 72.8777,
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    affected_population: 340000,
    status: 'responding',
    severity_score: 0.88,
  },
  {
    id: 3,
    title: 'Major Landslide & Debris Flow',
    disaster_type: 'landslide',
    alert_level: 'red',
    latitude: 11.5534,
    longitude: 76.1320,
    state: 'Kerala',
    district: 'Wayanad',
    affected_population: 1200,
    status: 'active',
    severity_score: 0.96,
  },
  {
    id: 4,
    title: 'Beas River Spate & Highway Breach',
    disaster_type: 'flood',
    alert_level: 'orange',
    latitude: 31.9579,
    longitude: 77.1095,
    state: 'Himachal Pradesh',
    district: 'Kullu',
    affected_population: 6500,
    status: 'responding',
    severity_score: 0.76,
  },
  {
    id: 5,
    title: 'Industrial Chemical Leak & Fire',
    disaster_type: 'industrial',
    alert_level: 'orange',
    latitude: 21.6264,
    longitude: 72.9990,
    state: 'Gujarat',
    district: 'Bharuch',
    affected_population: 8500,
    status: 'controlled',
    severity_score: 0.72,
  },
];

export default function LiveMap() {
  const [incidents, setIncidents] = useState(INITIAL_INCIDENTS);
  const [filterType, setFilterType] = useState('all');
  const [filterAlert, setFilterAlert] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    incidentsAPI.list()
      .then((res) => {
        if (res.data?.results && res.data.results.length > 0) {
          setIncidents(res.data.results);
        }
      })
      .catch((err) => {
        console.warn('Using seeded incidents for map display', err);
      });
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterType !== 'all' && inc.disaster_type !== filterType) return false;
    if (filterAlert !== 'all' && inc.alert_level !== filterAlert) return false;
    return true;
  });

  return (
    <div className="page-wrapper">
      <Topbar title="Tactical Operations Map" breadcrumb="Operations / Live Map" />

      {/* Map Controls Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={14} /> Filter Type:
          </span>
          <select
            className="input-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            <option value="all">All Disasters</option>
            <option value="cyclone">Cyclones</option>
            <option value="flood">Floods</option>
            <option value="landslide">Landslides</option>
            <option value="industrial">Industrial</option>
          </select>

          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 10 }}>Alert Level:</span>
          <select
            className="input-control"
            value={filterAlert}
            onChange={(e) => setFilterAlert(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13 }}
          >
            <option value="all">All Levels</option>
            <option value="red">Red Alert (Critical)</option>
            <option value="orange">Orange Alert (Severe)</option>
            <option value="green">Green Alert (Normal)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span> Red Alert ({incidents.filter(i => i.alert_level === 'red').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }}></span> Orange Alert ({incidents.filter(i => i.alert_level === 'orange').length})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }}></span> Responded
          </div>
        </div>
      </div>

      {/* Map Container and Info Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedIncident ? '1fr 360px' : '1fr', gap: 16, height: 'calc(100vh - 170px)' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', position: 'relative' }}>
          <MapContainer
            center={[21.7679, 78.8718]} // Center of India
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {filteredIncidents.map((incident) => (
              <React.Fragment key={incident.id}>
                <Marker
                  position={[incident.latitude, incident.longitude]}
                  icon={createCustomIcon(incident.alert_level)}
                  eventHandlers={{
                    click: () => setSelectedIncident(incident),
                  }}
                >
                  <Popup>
                    <div style={{ color: '#1e293b', padding: 4 }}>
                      <strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>{incident.title}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        📍 {incident.district}, {incident.state}<br/>
                        👥 Impact: {(incident.affected_population || 0).toLocaleString()} people<br/>
                        ⚡ Status: {incident.status.toUpperCase()}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {incident.alert_level === 'red' && (
                  <Circle
                    center={[incident.latitude, incident.longitude]}
                    radius={35000}
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1.5 }}
                  />
                )}
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {/* Selected Incident Drawer */}
        {selectedIncident && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className={`badge badge-${selectedIncident.alert_level}`}>
                  {selectedIncident.alert_level?.toUpperCase()} ALERT
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>{selectedIncident.title}</h3>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {selectedIncident.district}, {selectedIncident.state}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Type</span>
                <strong style={{ fontSize: 13, textTransform: 'capitalize' }}>{selectedIncident.disaster_type}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Status</span>
                <strong style={{ fontSize: 13, textTransform: 'capitalize' }}>{selectedIncident.status}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>AI Severity</span>
                <strong style={{ fontSize: 14, color: 'var(--primary)' }}>
                  {((selectedIncident.severity_score || 0.85) * 100).toFixed(0)}%
                </strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Affected</span>
                <strong style={{ fontSize: 14, color: 'var(--secondary)' }}>
                  {(selectedIncident.affected_population || 0).toLocaleString()}
                </strong>
              </div>
            </div>

            {selectedIncident.description && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {selectedIncident.description}
              </div>
            )}

            <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                Dispatch Relief
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                Coordinate Teams
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
