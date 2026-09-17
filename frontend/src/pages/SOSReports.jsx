import React, { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { incidentsAPI } from '../api/client';
import { Bell, Phone, MapPin, AlertOctagon, CheckCircle2, Clock, Users, ShieldAlert } from 'lucide-react';

const MOCK_SOS = [
  {
    id: 1,
    reporter_name: 'Sunil Mohapatra',
    reporter_phone: '+919437123456',
    severity: 5,
    description: 'Water level rising rapidly past 6 feet on Ground floor. 4 elders and 2 infants trapped on terrace. Urgent rescue boat needed!',
    people_trapped: 6,
    address: 'Ward 4, Near Jagannath Temple, Dhamra, Bhadrak, Odisha',
    is_verified: true,
    created_at: '12 min ago',
    category: 'Water Evacuation',
  },
  {
    id: 2,
    reporter_name: 'Pooja Kulkarni',
    reporter_phone: '+919820123987',
    severity: 4,
    description: 'Severe waterlogging inside society compound. Electric transformer spark reported. Ground floor residents evacuated to club house.',
    people_trapped: 0,
    address: 'Bldg 3, Kamani Junction, Kurla West, Mumbai',
    is_verified: true,
    created_at: '25 min ago',
    category: 'Electrical Hazard',
  },
  {
    id: 3,
    reporter_name: 'Jitin Mathew',
    reporter_phone: '+919447556677',
    severity: 5,
    description: 'Road completely washed out by mudslide. Three plantation worker quarters submerged in mud. Immediate earthmover and medical team needed.',
    people_trapped: 8,
    address: 'Mundakkai tea estate line 2, Chooralmala, Wayanad, Kerala',
    is_verified: true,
    created_at: '42 min ago',
    category: 'Landslide Entrapment',
  },
];

export default function SOSReports() {
  const [reports, setReports] = useState(MOCK_SOS);

  useEffect(() => {
    incidentsAPI.sosList()
      .then(res => {
        if (res.data?.results && res.data.results.length > 0) {
          setReports(res.data.results);
        }
      })
      .catch(err => console.warn('Using seeded SOS', err));
  }, []);

  const handleDispatch = (id) => {
    alert(`Rescue team dispatched to SOS #${id}! SMS dispatched to reporter.`);
  };

  return (
    <div className="page-wrapper">
      <Topbar title="Citizen SOS Emergency Broadcasts" breadcrumb="Operations / SOS Reports" />

      {/* Triage Banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(249,115,22,0.1))',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#ef4444', borderRadius: '50%', padding: 8, color: 'white', display: 'flex' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)' }}>
              High-Priority Citizen Distress Queue Active
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              3 reports verified by AI emergency triage. 14 citizens trapped requiring immediate deployment.
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>
          Batch Deploy NDRF QRT
        </button>
      </div>

      {/* SOS Cards Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reports.map((sos) => (
          <div key={sos.id} className="card" style={{ borderLeft: sos.severity === 5 ? '4px solid #ef4444' : '4px solid #f97316' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={`badge ${sos.severity === 5 ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 12 }}>
                  LEVEL {sos.severity} DISTRESS
                </span>
                {sos.is_verified && (
                  <span style={{ fontSize: 12, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Verified Citizen Call
                  </span>
                )}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> {sos.created_at || 'Just now'}
              </div>
            </div>

            <p style={{ fontSize: 15, fontWeight: 600, margin: '14px 0 10px', color: 'var(--text-bright)', lineHeight: 1.5 }}>
              "{sos.description}"
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={15} style={{ color: 'var(--primary)' }} />
                <span>Trapped: <strong style={{ color: 'var(--text-bright)' }}>{sos.people_trapped} people</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={15} style={{ color: 'var(--secondary)' }} />
                <span>Caller: <strong style={{ color: 'var(--text-bright)' }}>{sos.reporter_name} ({sos.reporter_phone})</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: 'span 2' }}>
                <MapPin size={15} style={{ color: '#ef4444' }} />
                <span>Location: <strong style={{ color: 'var(--text-bright)' }}>{sos.address}</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-glass)' }}>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 13 }}>
                Call Reporter
              </button>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 13, background: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => handleDispatch(sos.id)}
              >
                Dispatch Rescue Team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
