import React from 'react';
import Topbar from '../components/Topbar';
import { Users, Award, MapPin, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

const VOLUNTEERS = [
  { id: 1, name: 'Dr. Ramesh Nair', role: 'Emergency Trauma Surgeon', location: 'Kozhikode, Kerala', status: 'deployed', assignedTo: 'Wayanad Landslide Camp', phone: '+919847012345' },
  { id: 2, name: 'Ananya Deshmukh', role: 'Flood Rescue Specialist', location: 'Thane, Maharashtra', status: 'active', assignedTo: 'Kurla Evacuation Taskforce', phone: '+919820098765' },
  { id: 3, name: 'Bikram Das', role: 'Civil Defense & Ham Radio Operator', location: 'Cuttack, Odisha', status: 'deployed', assignedTo: 'Bhadrak Coastal Comm Link', phone: '+919437887766' },
  { id: 4, name: 'Sahil Verma', role: 'Heavy Vehicle & Crane Driver', location: 'Mandi, Himachal Pradesh', status: 'standby', assignedTo: 'Unassigned', phone: '+919816554433' },
  { id: 5, name: 'Kavita Rao', role: 'Relief Food & Logistics Coordinator', location: 'Surat, Gujarat', status: 'standby', assignedTo: 'Unassigned', phone: '+919898112233' },
];

export default function Volunteers() {
  return (
    <div className="page-wrapper">
      <Topbar title="Volunteer Corps & First Responders" breadcrumb="Management / Volunteers" />

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Registered Volunteers</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>1,480</div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deployed on Ground</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--primary)' }}>312</div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Available on Standby</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: '#22c55e' }}>1,168</div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Medical Personnel</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--secondary)' }}>184</div>
        </div>
      </div>

      {/* Volunteer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {VOLUNTEERS.map(v => (
          <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700 }}>{v.name}</h4>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{v.role}</span>
              </div>
              <span className={`badge ${v.status === 'deployed' ? 'badge-orange' : 'badge-green'}`}>
                {v.status.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} style={{ color: 'var(--secondary)' }} /> {v.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} style={{ color: '#22c55e' }} /> {v.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={13} style={{ color: 'var(--text-muted)' }} /> Assignment: <strong style={{ color: 'var(--text-bright)' }}>{v.assignedTo}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-glass)' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: 12 }}>
                Contact
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: 12 }}>
                Assign Task
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
