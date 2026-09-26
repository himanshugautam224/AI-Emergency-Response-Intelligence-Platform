import React, { useState } from 'react';
import {
  MessageSquare, Send, Radio, PhoneCall, Bell, ShieldAlert,
  CheckCircle2, Sparkles, Volume2, Clock, MapPin, RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/audioAlert';

const PRESETS = [
  {
    label: '🌊 Flash Flood Evacuation',
    target: 'Odisha Coastal Zone (Bhadrak & Kendrapara)',
    text: 'NDRF EMERGENCY ORDER: River Brahmani has crossed extreme danger mark. Immediate evacuation mandated for all residents within 2 km of embankment. Proceed to Cyclone Shelter #4.',
    channel: 'SMS & Cell Broadcast Gateway',
  },
  {
    label: '🌀 Cyclone Dana Red Alert',
    target: 'Coastal Odisha & West Bengal Enclaves',
    text: 'IMD RED ALERT: Severe Cyclonic Storm approaching coast with wind gusting to 120 km/h. Sea surge expected. Stay indoors. Emergency helpline: 1078.',
    channel: 'Satellite Emergency Uplink',
  },
  {
    label: '⛰️ Landslide NH-58 Closure',
    target: 'Wayanad Hill Basin (Chooralmala)',
    text: 'TRAFFIC DIVERSION: Massive rockfall blocking NH-58 between KM 42 and 46. All civilian vehicles prohibited. Heavy rescue machinery en route.',
    channel: 'VHF Tactical Radio Channel 4',
  },
  {
    label: '⚠️ Toxic Fume Evacuation',
    target: 'Mumbai Western Suburbs (Kurla & Andheri)',
    text: 'CHEMICAL HAZARD: Hazardous gas cloud detected in Sector 2 industrial zone. Wear wet cloth masks, close windows, move cross-wind towards north.',
    channel: 'Public Audio Siren Towers',
  },
];

export default function Communications() {
  const [targetPerimeter, setTargetPerimeter] = useState('Odisha Coastal Zone (Bhadrak & Kendrapara)');
  const [selectedChannel, setSelectedChannel] = useState('SMS & Cell Broadcast Gateway');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const [sentAlerts, setSentAlerts] = useState([
    { id: 1, channel: 'SMS Broadcast (Twilio)', target: 'Odisha Coastal District (Bhadrak)', text: 'IMD Alert: Severe Cyclone Dana approaching. Move to designated cyclone shelters immediately.', time: '10 min ago', status: 'Delivered (42,500 sent)', verified: true },
    { id: 2, channel: 'VHF Tactical Radio Channel 4', target: 'NDRF Battalion 8', text: 'Bridge water level approaching danger mark at KM 44. Divert all emergency supply trucks.', time: '28 min ago', status: 'Acknowledged', verified: true },
  ]);

  const handleApplyPreset = (preset) => {
    soundManager.playBeep(650, 0.04);
    setTargetPerimeter(preset.target);
    setBroadcastMessage(preset.text);
    setSelectedChannel(preset.channel);
    toast.success(`Loaded preset: ${preset.label}`);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsTransmitting(true);
    soundManager.playSiren(3);

    if (voiceEnabled) {
      soundManager.speakAlert(broadcastMessage.slice(0, 140));
    }

    const newId = Date.now();
    const newAlert = {
      id: newId,
      channel: selectedChannel,
      target: targetPerimeter,
      text: broadcastMessage,
      time: 'Just now',
      status: 'Transmitting to cellular towers...',
      verified: false,
    };

    setSentAlerts([newAlert, ...sentAlerts]);
    toast.loading('Encrypting broadcast packet and transmitting to telecom gateways...', { id: 'broadcast-tx' });

    setTimeout(() => {
      soundManager.playSuccess();
      setSentAlerts(prev => prev.map(a => a.id === newId ? { ...a, status: 'Broadcast Delivered (38,200 recipients)', verified: true } : a));
      toast.success(`Mass Emergency Broadcast Successfully Dispatched to ${targetPerimeter}!`, { id: 'broadcast-tx' });
      setIsTransmitting(false);
      setBroadcastMessage('');
    }, 2400);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
          Emergency Communications & Mass Broadcasts
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
          Transmit cell broadcast sirens, tactical VHF radio dispatches, and multi-channel SMS evacuation orders.
        </p>
      </div>

      {/* Quick Preset Buttons */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={14} color="#f97316" /> Quick Emergency Templates (Click to Auto-fill)
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleApplyPreset(p)}
              className="interactive-hover-glow"
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 24 }}>

        {/* Broadcast Sender Form */}
        <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: 'rgba(249,115,22,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Radio size={18} color="#f97316" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Dispatch Mass Emergency Alert
              </h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Authorized Central Disaster Cell Protocol</span>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Target Geographic Perimeter
              </label>
              <select
                className="input-control"
                value={targetPerimeter}
                onChange={e => setTargetPerimeter(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13,
                }}
              >
                <option value="Odisha Coastal Zone (Bhadrak & Kendrapara)">Odisha Coastal Zone (Bhadrak & Kendrapara)</option>
                <option value="Mumbai Western Suburbs (Kurla & Andheri)">Mumbai Western Suburbs (Kurla & Andheri)</option>
                <option value="Wayanad Hill Basin (Chooralmala)">Wayanad Hill Basin (Chooralmala)</option>
                <option value="Assam Brahmaputra River Basin">Assam Brahmaputra River Basin</option>
                <option value="Kullu Flash Flood Valley">Kullu Flash Flood Valley</option>
                <option value="All Disaster Enclaves (National Push)">All Disaster Enclaves (National Push)</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                Broadcast Channel Network
              </label>
              <select
                className="input-control"
                value={selectedChannel}
                onChange={e => setSelectedChannel(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13,
                }}
              >
                <option value="SMS & Cell Broadcast Gateway">📱 SMS & Cell Broadcast Gateway (National Telecom Towers)</option>
                <option value="VHF Tactical Radio Channel 4">📻 VHF Tactical Radio Channel 4 (Field Units & QRT)</option>
                <option value="Satellite Emergency Uplink">🛰️ Satellite Emergency Uplink (GSAT-29 Network)</option>
                <option value="Public Audio Siren Towers">📢 Public Audio Siren Towers (Outdoor Loudspeakers)</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Alert Text (SMS & Mobile App Push)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={e => setVoiceEnabled(e.target.checked)}
                    style={{ accentColor: '#f97316' }}
                  />
                  <span>Voice Synth Audio</span>
                </label>
              </div>
              <textarea
                className="input-control"
                rows={4}
                required
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Compose urgent citizen evacuation or safety instruction..."
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 8,
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isTransmitting || !broadcastMessage.trim()}
              className="interactive-hover-glow"
              style={{
                width: '100%', padding: '12px 18px', borderRadius: 8,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: isTransmitting ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
                opacity: (!broadcastMessage.trim() || isTransmitting) ? 0.6 : 1,
              }}
            >
              <Send size={15} />
              {isTransmitting ? 'Transmitting High-Priority Alert...' : 'Transmit Emergency Broadcast'}
            </button>
          </form>
        </div>

        {/* Live Broadcast Feed */}
        <div className="card" style={{ padding: 24, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Recent Emergency Transmissions
            </h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sentAlerts.length} logs recorded</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="interactive-hover-glow"
                style={{
                  background: 'var(--bg-elevated)', padding: 14, borderRadius: 10,
                  borderLeft: '4px solid #f97316', border: '1px solid var(--border)',
                  borderLeftWidth: 4, borderLeftColor: '#f97316',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: '#06b6d4' }}>{alert.channel}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {alert.time}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                  📍 Target: <strong style={{ color: 'var(--text-primary)' }}>{alert.target}</strong>
                </div>
                <p style={{ fontSize: 13, margin: '6px 0', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {alert.text}
                </p>
                <div style={{ fontSize: 11, color: alert.verified ? '#22c55e' : '#f97316', display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontWeight: 600 }}>
                  <CheckCircle2 size={13} /> {alert.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
