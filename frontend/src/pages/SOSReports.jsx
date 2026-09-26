import React, { useState, useEffect, useCallback } from 'react';
import { incidentsAPI } from '../api/client';
import {
  Bell, Phone, MapPin, AlertOctagon, CheckCircle2, Clock,
  Users, ShieldAlert, RefreshCw, Info, Loader, Plus, X, Send, Radio
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/audioAlert';

export default function SOSReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [dispatchedMap, setDispatchedMap] = useState({});

  // New SOS Modal
  const [showNewSosModal, setShowNewSosModal] = useState(false);
  const [newSos, setNewSos] = useState({
    description: '', people_trapped: 4, caller: 'Anil Sen', phone: '+91 94370 11223', location: 'Cuttack River Embankment', severity: 5,
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await incidentsAPI.sos();
      const data = res.data;
      const items = Array.isArray(data) ? data : data?.results || data?.items || [];
      setReports(items);
      setLastFetch(new Date());
    } catch (err) {
      setError(
        err?.response
          ? `Backend error ${err.response.status}: ${err.response.statusText}`
          : 'Cannot reach backend. Run: python -m uvicorn api.main:app --reload'
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, [fetchReports]);

  const handleDispatch = (id) => {
    setDispatchedMap(prev => ({ ...prev, [id]: true }));
    soundManager.playSiren(2.5);
    toast.success(`NDRF Quick Response Team dispatched for SOS #${id}! En route.`, {
      icon: '🚨',
      style: { background: '#22c55e', color: '#fff', fontWeight: 700 },
    });
  };

  const handleBatchDeploy = () => {
    const criticalList = reports.filter(r => r.severity === 5);
    if (criticalList.length === 0) {
      toast('No Level-5 critical reports found.', { icon: 'ℹ️' });
      return;
    }
    const newDispatched = { ...dispatchedMap };
    criticalList.forEach(r => { newDispatched[r.id] = true; });
    setDispatchedMap(newDispatched);

    soundManager.playSiren(3.5);
    toast.success(`Batch NDRF QRT dispatch initiated for ${criticalList.length} critical SOS emergencies!`, {
      icon: '🚨',
      style: { background: '#ef4444', color: '#fff', fontWeight: 700 },
    });
  };

  const handleCreateSos = (e) => {
    e.preventDefault();
    if (!newSos.description.trim()) return;

    const created = {
      id: Date.now(),
      description: newSos.description.trim(),
      people_trapped: parseInt(newSos.people_trapped) || 1,
      reporter_name: newSos.caller,
      reporter_phone: newSos.phone,
      location_name: newSos.location,
      severity: parseInt(newSos.severity) || 5,
      is_verified: true,
      category: 'Citizen Mobile Broadcast',
      created_at: 'Just now',
    };

    setReports([created, ...reports]);
    soundManager.playSiren(2);
    toast.success(`New Citizen SOS Distress Alert Registered!`, {
      icon: '🆘',
      style: { background: '#ef4444', color: '#fff', fontWeight: 700 },
    });

    setShowNewSosModal(false);
    setNewSos({ description: '', people_trapped: 4, caller: 'Anil Sen', phone: '+91 94370 11223', location: 'Cuttack River Embankment', severity: 5 });
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
          <Loader size={36} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading live SOS reports…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div style={{
          margin: 24, padding: '20px 24px', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#f87171' }}>
            <AlertOctagon size={16} /> Backend Unavailable
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{error}</div>
          <button
            onClick={fetchReports}
            style={{
              alignSelf: 'flex-start', marginTop: 8, padding: '8px 16px',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 8, color: '#f87171', cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const criticalCount = reports.filter(r => r.severity === 5).length;
  const totalTrapped = reports.reduce((sum, r) => sum + (r.people_trapped || 0), 0);

  return (
    <div className="page-wrapper" style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
            Citizen SOS Emergency Broadcasts
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Clock size={12} />
            {lastFetch ? `Last updated ${lastFetch.toLocaleTimeString()}` : 'Fetching…'} · auto-refresh every 30s
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              soundManager.playBeep(700, 0.05);
              setShowNewSosModal(true);
            }}
            className="interactive-hover-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
            }}
          >
            <Plus size={15} /> Simulate SOS Broadcast
          </button>

          <button
            onClick={fetchReports}
            className="interactive-hover-glow"
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13,
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Triage Banner */}
      {reports.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))',
          border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-lg)',
          padding: '16px 20px', marginBottom: 20, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#ef4444', borderRadius: '50%', padding: 8, color: 'white', display: 'flex' }}>
              <AlertOctagon size={24} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {criticalCount > 0
                  ? `${criticalCount} Critical Report${criticalCount > 1 ? 's' : ''} — Immediate Deployment Required`
                  : `${reports.length} Active SOS Report${reports.length > 1 ? 's' : ''}`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {totalTrapped > 0 ? `${totalTrapped} citizens trapped requiring immediate deployment` : 'Awaiting field team response'}
                {' · '}{reports.filter(r => r.is_verified).length} AI-verified
              </div>
            </div>
          </div>

          <button
            onClick={handleBatchDeploy}
            className="interactive-hover-glow"
            style={{
              padding: '10px 18px', background: '#ef4444', color: 'white',
              border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
            }}
          >
            <ShieldAlert size={15} /> Batch Deploy Level-5 QRT
          </button>
        </div>
      )}

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reports.map((sos) => {
          const isDispatched = dispatchedMap[sos.id];
          return (
            <div
              key={sos.id}
              className="card interactive-hover-glow"
              style={{
                borderLeft: `4px solid ${isDispatched ? '#22c55e' : (sos.severity === 5 ? '#ef4444' : '#f97316')}`,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge ${sos.severity === 5 ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 12 }}>
                    LEVEL {sos.severity} DISTRESS
                  </span>
                  {isDispatched ? (
                    <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} color="#22c55e" /> NDRF QRT DISPATCHED & EN ROUTE
                    </span>
                  ) : sos.is_verified ? (
                    <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Verified
                    </span>
                  ) : null}
                  {sos.category && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 6 }}>
                      {sos.category}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {sos.created_at || 'Recently'}
                </div>
              </div>

              <p style={{ fontSize: 15, fontWeight: 600, margin: '14px 0 10px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                "{sos.description}"
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                {sos.people_trapped > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={15} style={{ color: '#f97316' }} />
                    <span>Trapped: <strong style={{ color: 'var(--text-primary)' }}>{sos.people_trapped} citizens</strong></span>
                  </div>
                )}
                {sos.reporter_name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={15} style={{ color: '#06b6d4' }} />
                    <span>Caller: <strong style={{ color: 'var(--text-primary)' }}>{sos.reporter_name}{sos.reporter_phone ? ` (${sos.reporter_phone})` : ''}</strong></span>
                  </div>
                )}
                {(sos.address || sos.location_name) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: 'span 2' }}>
                    <MapPin size={15} style={{ color: '#ef4444' }} />
                    <span>Location: <strong style={{ color: 'var(--text-primary)' }}>{sos.address || sos.location_name}</strong></span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                {sos.reporter_phone && (
                  <button
                    onClick={() => {
                      soundManager.playSonarPing();
                      toast.success(`Dialing reporter ${sos.reporter_phone}...`);
                    }}
                    className="interactive-hover-glow"
                    style={{
                      padding: '8px 16px', fontSize: 13, borderRadius: 8,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <Phone size={13} color="#22c55e" /> Call Reporter
                  </button>
                )}

                <button
                  className="interactive-hover-glow"
                  disabled={isDispatched}
                  style={{
                    padding: '8px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                    background: isDispatched ? 'rgba(34,197,94,0.15)' : '#ef4444',
                    border: isDispatched ? '1px solid #22c55e' : 'none',
                    color: isDispatched ? '#22c55e' : '#fff',
                    cursor: isDispatched ? 'default' : 'pointer',
                    boxShadow: isDispatched ? 'none' : '0 4px 16px rgba(239,68,68,0.4)',
                  }}
                  onClick={() => !isDispatched && handleDispatch(sos.id)}
                >
                  {isDispatched ? '✓ QRT Team En Route' : 'Dispatch Rescue Team'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── SIMULATE SOS MODAL ─── */}
      {showNewSosModal && (
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
                <AlertOctagon size={20} color="#ef4444" />
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Simulate Citizen SOS Distress Signal
                </h3>
              </div>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setShowNewSosModal(false)} />
            </div>

            <form onSubmit={handleCreateSos}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Emergency Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. 5 families trapped on 2nd floor, water rising 1 foot every 30 mins, elderly person needs dialysis"
                  value={newSos.description}
                  onChange={e => setNewSos({ ...newSos, description: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Trapped Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSos.people_trapped}
                    onChange={e => setNewSos({ ...newSos, people_trapped: e.target.value })}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Severity Level
                  </label>
                  <select
                    value={newSos.severity}
                    onChange={e => setNewSos({ ...newSos, severity: e.target.value })}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 8,
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                    }}
                  >
                    <option value="5">Level 5 (Life-Threatening)</option>
                    <option value="4">Level 4 (Severe Danger)</option>
                    <option value="3">Level 3 (Urgent Supplies)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Pinpoint Location / Landmark
                </label>
                <input
                  required
                  placeholder="e.g. Near Old Kali Temple, Ward 7, Kendrapara"
                  value={newSos.location}
                  onChange={e => setNewSos({ ...newSos, location: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowNewSosModal(false)}
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
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none', color: '#fff', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Broadcast SOS Signal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
