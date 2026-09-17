import React from 'react';
import Topbar from '../components/Topbar';
import { Globe, Activity, Wind, CloudRain, ShieldCheck, RefreshCw } from 'lucide-react';

const FEEDS = [
  { name: 'IMD India Meteorological Dept', type: 'Weather Radar', status: 'Live 100%', latency: '42ms', updates: 'Cyclone Dana landfall tracking active' },
  { name: 'USGS Global Earthquake Feed', type: 'Seismology', status: 'Live 100%', latency: '88ms', updates: 'No M4.5+ events in Indian tectonic plate past 6h' },
  { name: 'GDACS Global Disaster Alert', type: 'Multihazard', status: 'Live 100%', latency: '110ms', updates: 'South Asia Flood Alert issued' },
  { name: 'Central Water Commission (CWC)', type: 'River Gauges', status: 'Live 98%', latency: '145ms', updates: 'Yamuna & Beas rivers near alert thresholds' },
];

export default function ExternalFeeds() {
  return (
    <div className="page-wrapper">
      <Topbar title="External Sensor & Intelligence Feeds" breadcrumb="Intelligence / Live Data Feeds" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {FEEDS.map((feed, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-green">{feed.status}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ping: {feed.latency}</span>
            </div>

            <h4 style={{ fontSize: 15, fontWeight: 700 }}>{feed.name}</h4>
            <span style={{ fontSize: 12, color: 'var(--primary)' }}>Feed Type: {feed.type}</span>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <strong>Latest Telemetry:</strong> {feed.updates}
            </div>

            <button className="btn btn-secondary" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12 }}>
              <RefreshCw size={12} /> Force Sync Telemetry
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
