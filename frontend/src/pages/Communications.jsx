import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { MessageSquare, Send, Radio, PhoneCall, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function Communications() {
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sentAlerts, setSentAlerts] = useState([
    { id: 1, channel: 'SMS Broadcast (Twilio)', target: 'Odisha Coastal District (Bhadrak)', text: 'IMD Alert: Severe Cyclone Dana approaching. Move to designated cyclone shelters immediately.', time: '10 min ago', status: 'Delivered (42,500 sent)' },
    { id: 2, channel: 'VHF Tactical Radio Channel 4', target: 'NDRF Battalion 8', text: 'Bridge water level approaching danger mark at KM 44. Divert all emergency supply trucks.', time: '28 min ago', status: 'Acknowledged' },
  ]);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setSentAlerts([
      {
        id: Date.now(),
        channel: 'SMS Emergency Broadcast',
        target: 'All Registered Citizens in Risk Radius',
        text: broadcastMessage,
        time: 'Just now',
        status: 'Broadcasting...',
      },
      ...sentAlerts,
    ]);
    setBroadcastMessage('');
  };

  return (
    <div className="page-wrapper">
      <Topbar title="Multi-Agency Emergency Communications" breadcrumb="Management / Communications" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Broadcast Sender */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Radio size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Dispatch Mass Emergency Alert</h3>
          </div>
          <form onSubmit={handleSendBroadcast}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Target Geographic Perimeter
              </label>
              <select className="input-control" style={{ width: '100%' }}>
                <option>Odisha Coastal Zone (Bhadrak & Kendrapara)</option>
                <option>Mumbai Western Suburbs (Kurla & Andheri)</option>
                <option>Wayanad Hill Basin (Chooralmala)</option>
                <option>All Disaster Enclaves (National Push)</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Alert Text (SMS & Mobile App Push)
              </label>
              <textarea
                className="input-control"
                rows={4}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Compose urgent citizen evacuation or safety instruction..."
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <Send size={15} /> Transmit Emergency Broadcast
            </button>
          </form>
        </div>

        {/* Live Broadcast Feed */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Recent Emergency Transmissions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sentAlerts.map((alert) => (
              <div key={alert.id} style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{alert.channel}</span>
                  <span>{alert.time}</span>
                </div>
                <p style={{ fontSize: 13, margin: '6px 0', color: 'var(--text-bright)' }}>{alert.text}</p>
                <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> {alert.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
