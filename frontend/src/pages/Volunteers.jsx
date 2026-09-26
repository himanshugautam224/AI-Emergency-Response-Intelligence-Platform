import React, { useState } from 'react';
import {
  Users, Award, MapPin, Phone, ShieldCheck, CheckCircle2,
  Plus, X, Send, Radio, PhoneCall, AlertCircle, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/audioAlert';

const INITIAL_VOLUNTEERS = [
  { id: 1, name: 'Dr. Ramesh Nair', role: 'Emergency Trauma Surgeon', location: 'Kozhikode, Kerala', status: 'deployed', assignedTo: 'Wayanad Landslide Camp', phone: '+919847012345' },
  { id: 2, name: 'Ananya Deshmukh', role: 'Flood Rescue Specialist', location: 'Thane, Maharashtra', status: 'active', assignedTo: 'Kurla Evacuation Taskforce', phone: '+919820098765' },
  { id: 3, name: 'Bikram Das', role: 'Civil Defense & Ham Radio Operator', location: 'Cuttack, Odisha', status: 'deployed', assignedTo: 'Bhadrak Coastal Comm Link', phone: '+919437887766' },
  { id: 4, name: 'Sahil Verma', role: 'Heavy Vehicle & Crane Driver', location: 'Mandi, Himachal Pradesh', status: 'standby', assignedTo: 'Unassigned', phone: '+919816554433' },
  { id: 5, name: 'Kavita Rao', role: 'Relief Food & Logistics Coordinator', location: 'Surat, Gujarat', status: 'standby', assignedTo: 'Unassigned', phone: '+919898112233' },
];

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState(INITIAL_VOLUNTEERS);
  const [filter, setFilter] = useState('all');

  // Contact Modal
  const [contactTarget, setContactTarget] = useState(null);
  const [smsText, setSmsText] = useState('');
  const [callingState, setCallingState] = useState(false);

  // Assign Task Modal
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedSector, setSelectedSector] = useState('Wayanad Landslide Camp - Sector 3');
  const [taskPriority, setTaskPriority] = useState('critical');

  // Register New Volunteer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVol, setNewVol] = useState({
    name: '', role: 'First Aid Responder', location: '', phone: '',
  });

  const filteredVolunteers = volunteers.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const deployedCount = volunteers.filter(v => v.status === 'deployed').length;
  const standbyCount = volunteers.filter(v => v.status === 'standby').length;

  const handleOpenContact = (v) => {
    soundManager.playBeep(650, 0.05);
    setContactTarget(v);
    setSmsText(`ALERT from ERIP Command: Urgent mobilization update required at your post. Reply with status.`);
    setCallingState(false);
  };

  const handleSimulateCall = () => {
    setCallingState(true);
    soundManager.playSonarPing();
    toast.loading(`Dialing ${contactTarget.phone} (${contactTarget.name})...`, { id: 'call-toast' });
    setTimeout(() => {
      soundManager.playSuccess();
      toast.success(`Voice line connected to ${contactTarget.name} via NDRF VHF Satellite Gateway`, { id: 'call-toast' });
      setCallingState(false);
    }, 2000);
  };

  const handleSendSms = (e) => {
    e.preventDefault();
    soundManager.playBeep(880, 0.08);
    toast.success(`Tactical SMS dispatched to ${contactTarget.phone}!`);
    setContactTarget(null);
  };

  const handleOpenAssign = (v) => {
    soundManager.playBeep(650, 0.05);
    setAssignTarget(v);
    setSelectedSector(v.assignedTo !== 'Unassigned' ? v.assignedTo : 'Wayanad Landslide Camp - Sector 3');
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    setVolunteers(prev => prev.map(v => {
      if (v.id === assignTarget.id) {
        return { ...v, status: 'deployed', assignedTo: selectedSector };
      }
      return v;
    }));

    soundManager.playSuccess();
    toast.success(`Assigned ${assignTarget.name} to ${selectedSector}!`, {
      icon: '🎖️',
      style: { background: '#22c55e', color: '#fff', fontWeight: 700 },
    });
    setAssignTarget(null);
  };

  const handleRegisterVolunteer = (e) => {
    e.preventDefault();
    if (!newVol.name.trim() || !newVol.location.trim()) return;

    const created = {
      id: Date.now(),
      name: newVol.name.trim(),
      role: newVol.role,
      location: newVol.location.trim(),
      phone: newVol.phone.trim() || '+91 98000 00000',
      status: 'standby',
      assignedTo: 'Unassigned',
    };

    setVolunteers([created, ...volunteers]);
    soundManager.playSuccess();
    toast.success(`Registered responder ${created.name} into standby fleet!`);
    setShowAddModal(false);
    setNewVol({ name: '', role: 'First Aid Responder', location: '', phone: '' });
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header with Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
            Volunteer Fleet & First Responders
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            Coordinate field deployment, communication links, and skill task assignments across Indian disaster zones.
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playBeep(700, 0.05);
            setShowAddModal(true);
          }}
          className="interactive-hover-glow"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#fff', border: 'none', borderRadius: 8,
            padding: '9px 18px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
          }}
        >
          <Plus size={16} /> Register Volunteer
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Registered Volunteers</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
            {(1475 + volunteers.length).toLocaleString()}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deployed on Ground</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: '#f97316' }}>
            {310 + deployedCount}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Available on Standby</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: '#22c55e' }}>
            {1165 + standbyCount}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Medical Personnel</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: '#06b6d4' }}>
            184
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6, background: 'var(--bg-elevated)', padding: 4, borderRadius: 10 }}>
          {[
            { id: 'all', label: `All (${volunteers.length})` },
            { id: 'deployed', label: `Deployed (${deployedCount})` },
            { id: 'active', label: `Active (${volunteers.filter(v => v.status === 'active').length})` },
            { id: 'standby', label: `Standby (${standbyCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                soundManager.playBeep(600, 0.04);
              }}
              style={{
                border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
                background: filter === tab.id ? 'var(--primary)' : 'transparent',
                color: filter === tab.id ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {filteredVolunteers.length} verified responders
        </span>
      </div>

      {/* Volunteer Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {filteredVolunteers.map(v => (
          <div
            key={v.id}
            className="card interactive-hover-glow"
            style={{
              display: 'flex', flexDirection: 'column', gap: 12, padding: 20,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)' }}>
                  {v.name}
                </h4>
                <span style={{ fontSize: 12, color: '#f97316', fontWeight: 600 }}>{v.role}</span>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                background: v.status === 'deployed' ? 'rgba(249,115,22,0.15)' : v.status === 'active' ? 'rgba(6,182,212,0.15)' : 'rgba(34,197,94,0.15)',
                color: v.status === 'deployed' ? '#f97316' : v.status === 'active' ? '#06b6d4' : '#22c55e',
                border: `1px solid ${v.status === 'deployed' ? 'rgba(249,115,22,0.4)' : v.status === 'active' ? 'rgba(6,182,212,0.4)' : 'rgba(34,197,94,0.4)'}`,
                textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                {v.status}
              </span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={14} style={{ color: '#06b6d4', flexShrink: 0 }} />
                <span>{v.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} style={{ color: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontFamily: 'monospace' }}>{v.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <span>Assignment: <strong style={{ color: 'var(--text-primary)' }}>{v.assignedTo}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => handleOpenContact(v)}
                className="interactive-hover-glow"
                style={{
                  flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: 600,
                  borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <PhoneCall size={13} color="#06b6d4" /> Contact
              </button>
              <button
                onClick={() => handleOpenAssign(v)}
                className="interactive-hover-glow"
                style={{
                  flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: 700,
                  borderRadius: 8, background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: 'none', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  boxShadow: '0 2px 10px rgba(249,115,22,0.3)',
                }}
              >
                <Award size={13} /> Assign Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── CONTACT MODAL ─── */}
      {contactTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 480, padding: 24,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <PhoneCall size={20} color="#06b6d4" />
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Contact Responder: {contactTarget.name}
                </h3>
              </div>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setContactTarget(null)} />
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-elevated)', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
              <div>Role: <strong>{contactTarget.role}</strong></div>
              <div>Station: <strong>{contactTarget.location}</strong></div>
              <div>Secure Line: <strong style={{ color: '#22c55e' }}>{contactTarget.phone}</strong></div>
            </div>

            {/* Tactical Call Button */}
            <button
              onClick={handleSimulateCall}
              disabled={callingState}
              className="interactive-hover-glow"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
                color: '#22c55e', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <Radio size={15} />
              {callingState ? 'Connecting Encrypted Satellite Voice...' : 'Initiate Secure Voice Call'}
            </button>

            {/* SMS Form */}
            <form onSubmit={handleSendSms}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Transmit Tactical SMS Dispatch
              </label>
              <textarea
                rows={3}
                value={smsText}
                onChange={e => setSmsText(e.target.value)}
                style={{
                  width: '100%', padding: '10px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 12, resize: 'vertical', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setContactTarget(null)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Send size={13} /> Send Dispatch SMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ASSIGN TASK MODAL ─── */}
      {assignTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 480, padding: 24,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={20} color="#f97316" />
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Assign Sector: {assignTarget.name}
                </h3>
              </div>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setAssignTarget(null)} />
            </div>

            <form onSubmit={handleConfirmAssign}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Target Disaster Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13,
                  }}
                >
                  <option value="Wayanad Landslide Camp - Sector 3">Wayanad Landslide Camp - Sector 3</option>
                  <option value="Bhadrak Coastal Comm Base - Sector 1">Bhadrak Coastal Comm Base - Sector 1</option>
                  <option value="Kurla Flood Evacuation Taskforce">Kurla Flood Evacuation Taskforce</option>
                  <option value="Kullu Flash Flood Emergency Relief Base">Kullu Flash Flood Emergency Relief Base</option>
                  <option value="Guwahati Brahmaputra River Outpost">Guwahati Brahmaputra River Outpost</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Priority Level
                </label>
                <select
                  value={taskPriority}
                  onChange={e => setTaskPriority(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13,
                  }}
                >
                  <option value="critical">🚨 Critical / Life Saving (Immediate)</option>
                  <option value="urgent">⚡ Urgent / Logistics Support</option>
                  <option value="standard">Standard Field Patrol</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setAssignTarget(null)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                  }}
                >
                  <CheckCircle2 size={14} /> Deploy to Sector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REGISTER VOLUNTEER MODAL ─── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 480, padding: 24,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Plus size={20} color="#f97316" />
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Register New First Responder
                </h3>
              </div>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleRegisterVolunteer}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  required
                  placeholder="e.g. Priya Sharma"
                  value={newVol.name}
                  onChange={e => setNewVol({ ...newVol, name: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Skill / Specialization
                </label>
                <select
                  value={newVol.role}
                  onChange={e => setNewVol({ ...newVol, role: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                >
                  <option value="First Aid Responder">First Aid Responder</option>
                  <option value="Emergency Trauma Surgeon">Emergency Trauma Surgeon</option>
                  <option value="Flood Rescue Boat Navigator">Flood Rescue Boat Navigator</option>
                  <option value="Civil Defense Ham Radio Operator">Civil Defense Ham Radio Operator</option>
                  <option value="Heavy Equipment Operator">Heavy Equipment Operator</option>
                  <option value="Relief Supply Logistics Lead">Relief Supply Logistics Lead</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Base District & State
                </label>
                <input
                  required
                  placeholder="e.g. Pune, Maharashtra"
                  value={newVol.location}
                  onChange={e => setNewVol({ ...newVol, location: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Emergency Phone Contact
                </label>
                <input
                  placeholder="e.g. +91 9876543210"
                  value={newVol.phone}
                  onChange={e => setNewVol({ ...newVol, phone: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)', color: 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
