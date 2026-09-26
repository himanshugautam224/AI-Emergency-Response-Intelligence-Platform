import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit3, Trash2, Eye, ChevronDown } from 'lucide-react';
import { incidentsAPI } from '../api/client';
import toast from 'react-hot-toast';

const ALERT_COLORS = {
  critical: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  high:     { bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', text: '#fb923c' },
  medium:   { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#fbbf24' },
  low:      { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#4ade80' },
};

function Badge({ label, color, bg, border }) {
  return (
    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
      background: bg, border: `1px solid ${border}`, color, textTransform: 'uppercase' }}>
      {label}
    </span>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', disaster_type: 'flood', alert_level: 'medium',
    latitude: '', longitude: '', location_name: '', district: '', state: 'India',
    affected_population: 0, casualties: 0, injured: 0,
    description: '', is_sos: false, source: 'manual',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onCreate({
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        affected_population: parseInt(form.affected_population) || 0,
        casualties: parseInt(form.casualties) || 0,
        injured: parseInt(form.injured) || 0,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, type = 'text', opts = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={opts.placeholder || ''}
        style={{
          padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
        }}
      />
    </div>
  );

  const select = (label, name, options) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</label>
      <select
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        style={{
          padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: 20 }}>
          Create New Incident
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('Title *', 'title', 'text', { placeholder: 'Describe the incident' })}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {select('Disaster Type', 'disaster_type', ['flood', 'earthquake', 'cyclone', 'drought', 'wildfire', 'landslide', 'storm', 'tsunami', 'unknown'])}
            {select('Alert Level', 'alert_level', ['low', 'medium', 'high', 'critical'])}
          </div>
          {field('Location Name', 'location_name', 'text', { placeholder: 'City, District' })}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {field('State', 'state')}
            {field('District', 'district')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {field('Latitude', 'latitude', 'number', { placeholder: '20.5937' })}
            {field('Longitude', 'longitude', 'number', { placeholder: '78.9629' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {field('Affected Population', 'affected_population', 'number')}
            {field('Casualties', 'casualties', 'number')}
            {field('Injured', 'injured', 'number')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              style={{
                padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', resize: 'vertical',
              }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={form.is_sos} onChange={e => setForm(f => ({ ...f, is_sos: e.target.checked }))} />
            This is an SOS / Emergency signal
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13,
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              padding: '8px 20px', background: 'var(--primary)', border: 'none',
              borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            }}>
              {saving ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const { data } = await incidentsAPI.list({
        status: filterStatus || undefined,
        alert_level: filterLevel || undefined,
        limit: 200,
      });
      setIncidents(data || []);
    } catch (e) {
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, [filterStatus, filterLevel]);

  const handleCreate = async (data) => {
    try {
      await incidentsAPI.create(data);
      toast.success('Incident created successfully');
      fetchIncidents();
    } catch (e) {
      toast.error('Failed to create incident');
      throw e;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this incident?')) return;
    try {
      await incidentsAPI.delete(id);
      toast.success('Incident deleted');
      setIncidents(prev => prev.filter(i => i.id !== id));
    } catch {
      toast.error('Failed to delete incident');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await incidentsAPI.update(id, { status });
      toast.success(`Status updated to ${status}`);
      setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = incidents.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
          Incidents Management
        </h1>
        <button onClick={() => setShowCreate(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: 'var(--primary)', border: 'none', borderRadius: 8,
          color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13,
        }}>
          <Plus size={15} /> New Incident
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search incidents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px',
              background: 'var(--surface-1)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
          padding: '8px 12px', background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, outline: 'none',
        }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="responding">Responding</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)} style={{
          padding: '8px 12px', background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, outline: 'none',
        }}>
          <option value="">All Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} incidents
        </div>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No incidents found</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Title', 'Type', 'Level', 'Status', 'Location', 'Affected', 'Risk Score', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => {
                  const colors = ALERT_COLORS[inc.alert_level] || ALERT_COLORS.low;
                  return (
                    <tr key={inc.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inc.is_sos && <span style={{ color: '#ef4444', marginRight: 4 }}>🆘</span>}
                          {inc.title}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{inc.disaster_type}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge label={inc.alert_level} {...colors} />
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <select
                          value={inc.status}
                          onChange={e => handleStatusChange(inc.id, e.target.value)}
                          style={{
                            padding: '3px 6px', background: 'var(--surface-2)', border: '1px solid var(--border)',
                            borderRadius: 6, color: 'var(--text-muted)', fontSize: 12, outline: 'none', cursor: 'pointer',
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="responding">Responding</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {inc.location_name || inc.district || inc.state}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {(inc.affected_population || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {inc.risk_score > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ height: 4, width: 60, background: 'var(--surface-2)', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${inc.risk_score * 100}%`,
                                background: inc.risk_score > 0.7 ? '#ef4444' : inc.risk_score > 0.4 ? '#f97316' : '#22c55e',
                                borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(inc.risk_score * 100).toFixed(0)}%</span>
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => handleDelete(inc.id)} style={{
                          padding: '4px', background: 'none', border: 'none', color: '#f87171',
                          cursor: 'pointer', borderRadius: 4,
                        }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
