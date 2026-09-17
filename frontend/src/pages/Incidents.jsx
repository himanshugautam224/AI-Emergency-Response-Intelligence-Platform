import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { incidentsAPI } from '../api/client';
import { AlertTriangle, Plus, Search, Filter, MapPin, Clock, Users, ArrowUpRight } from 'lucide-react';

const MOCK_INCIDENTS = [
  {
    id: 1,
    title: 'Severe Cyclone Dana - Coastal Surge & Inundation',
    disaster_type: 'cyclone',
    alert_level: 'red',
    state: 'Odisha',
    district: 'Bhadrak',
    affected_population: 185000,
    status: 'active',
    severity_score: 0.94,
    incident_time: '4 hours ago',
  },
  {
    id: 2,
    title: 'Flash Flooding & Mithi River Overspill',
    disaster_type: 'flood',
    alert_level: 'red',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    affected_population: 340000,
    status: 'responding',
    severity_score: 0.88,
    incident_time: '7 hours ago',
  },
  {
    id: 3,
    title: 'Major Landslide & Debris Flow - Meppadi Sector',
    disaster_type: 'landslide',
    alert_level: 'red',
    state: 'Kerala',
    district: 'Wayanad',
    affected_population: 1200,
    status: 'active',
    severity_score: 0.96,
    incident_time: '12 hours ago',
  },
  {
    id: 4,
    title: 'Beas River Spate & Highway Breach',
    disaster_type: 'flood',
    alert_level: 'orange',
    state: 'Himachal Pradesh',
    district: 'Kullu',
    affected_population: 6500,
    status: 'responding',
    severity_score: 0.76,
    incident_time: '18 hours ago',
  },
  {
    id: 5,
    title: 'Industrial Chemical Leak & Perimeter Fire',
    disaster_type: 'industrial',
    alert_level: 'orange',
    state: 'Gujarat',
    district: 'Bharuch',
    affected_population: 8500,
    status: 'controlled',
    severity_score: 0.72,
    incident_time: '22 hours ago',
  },
];

export default function Incidents() {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    incidentsAPI.list()
      .then(res => {
        if (res.data?.results && res.data.results.length > 0) {
          setIncidents(res.data.results);
        }
      })
      .catch(err => console.warn('Using seeded incidents', err));
  }, []);

  const filtered = incidents.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          i.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      <Topbar title="Active Disasters & Incidents" breadcrumb="Operations / Incidents" />

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, maxWidth: 600 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by state, district, or incident name..."
              className="input-control"
              style={{ paddingLeft: 36, width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 140 }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="responding">Responding</option>
            <option value="controlled">Controlled</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Log New Incident
        </button>
      </div>

      {/* Incident Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {filtered.map(inc => (
          <div key={inc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className={`badge badge-${inc.alert_level}`}>
                {inc.alert_level?.toUpperCase()} ALERT
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                Status: <strong style={{ color: 'var(--text-bright)' }}>{inc.status}</strong>
              </span>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>{inc.title}</h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <MapPin size={14} style={{ color: 'var(--secondary)' }} />
              {inc.district}, {inc.state}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Type</span>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{inc.disaster_type}</span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>Affected</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--secondary)' }}>
                  {(inc.affected_population || 0).toLocaleString()}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block' }}>AI Score</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                  {((inc.severity_score || 0.85) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {inc.incident_time || 'Just now'}
              </span>

              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                View Action Plan <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
