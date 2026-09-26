import React, { useState } from 'react';
import { triageAPI } from '../api/client';
import {
  Cpu, Zap, CheckCircle2, AlertTriangle, Sparkles,
  Loader, Info, ServerOff,
} from 'lucide-react';

const SAMPLES = [
  {
    label: '🌊 Flood',
    text: 'Severe storm water breached the earthen dam, 20 houses washed away in low-lying village, villagers stranded on rooftops needing boat rescue',
  },
  {
    label: '⛰️ Landslide',
    text: 'Massive landslide triggered by torrential rain blocking NH-58 near Joshimath, multiple pilgrimage vehicles trapped under boulders',
  },
  {
    label: '🔥 Fire',
    text: 'Toxic gas cylinder blast in MIDC chemical plant, orange fumes spreading toward residential zone, workers trapped',
  },
  {
    label: '🌀 Cyclone',
    text: 'Severe cyclonic storm alert issued by IMD, wind speeds reaching 180 km/h, coastal villages being evacuated',
  },
];

export default function AIEngine() {
  const [text, setText] = useState(SAMPLES[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const runTriage = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setApiError(null);
    setResult(null);
    try {
      const res = await triageAPI.analyze(text.trim());
      setResult(res.data);
    } catch (err) {
      if (err?.response) {
        setApiError(`Backend error ${err.response.status}: ${err.response.statusText}`);
      } else {
        setApiError('Cannot reach backend. Run: python -m uvicorn api.main:app --reload');
      }
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s) => {
    if (s >= 5) return '#ef4444';
    if (s >= 4) return '#f97316';
    if (s >= 3) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="page-wrapper">

      {/* Model Status Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>NLP Triage Engine</span>
            <span className="badge badge-green">ACTIVE</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Keyword + Pattern Classifier</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            7 disaster type taxonomy · real-time keyword scoring
          </span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Risk Predictor</span>
            <span className="badge badge-green">ACTIVE</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>XGBoost Regressor v1.2</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Trained on 141MB Historical Dataset</span>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Resource Allocator</span>
            <span className="badge badge-green">ACTIVE</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Hungarian Algorithm + MIP</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Minimizes travel time by 34%</span>
        </div>
      </div>

      {/* Interactive Playground */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Input panel */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Real-Time Disaster NLP Triage</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Paste an emergency situation — citizen call, field report, or tweet. The backend NLP engine
            classifies disaster type, severity, and recommended response assets in real time.
          </p>

          <textarea
            className="input-control"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', resize: 'vertical', fontSize: 13, lineHeight: 1.6, boxSizing: 'border-box' }}
            placeholder="Type or paste emergency situation text..."
          />

          {/* Sample buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => setText(s.text)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button
              className="btn btn-primary"
              disabled={loading || !text.trim()}
              onClick={runTriage}
              style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: (!text.trim()) ? 0.5 : 1 }}
            >
              {loading
                ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Analyzing…</>
                : <><Zap size={14} /> Run AI Triage</>}
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Inference Engine Output</h3>
            {result && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: `${severityColor(result.severity)}20`,
                color: severityColor(result.severity),
                border: `1px solid ${severityColor(result.severity)}40`,
                textTransform: 'uppercase',
              }}>
                {result.priority_label}
              </span>
            )}
          </div>

          {/* Error state */}
          {apiError && (
            <div style={{
              padding: '14px 16px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 600, fontSize: 13 }}>
                <ServerOff size={15} /> Backend Unavailable
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{apiError}</div>
            </div>
          )}

          {/* Loading state */}
          {loading && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, gap: 12, color: 'var(--text-muted)' }}>
              <Loader size={32} style={{ color: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Running NLP triage on backend…</span>
            </div>
          )}

          {/* Idle state */}
          {!loading && !result && !apiError && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, gap: 10, color: 'var(--text-muted)' }}>
              <Cpu size={36} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: 13 }}>Submit a situation description to see AI analysis</span>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Predicted Disaster</span>
                  <strong style={{ fontSize: 14, color: 'var(--text-bright)' }}>{result.disaster_type}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Confidence Score</span>
                  <strong style={{ fontSize: 14, color: 'var(--secondary)' }}>{(result.confidence * 100).toFixed(1)}%</strong>
                </div>
                {result.people_affected_estimate && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>People Affected (est.)</span>
                    <strong style={{ fontSize: 14, color: '#f97316' }}>{result.people_affected_estimate}</strong>
                  </div>
                )}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Keyword Matches</span>
                  <strong style={{ fontSize: 14, color: 'var(--text-bright)' }}>{result.keyword_matches}</strong>
                </div>
              </div>

              {/* Urgency bar */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Urgency Index: <strong style={{ color: severityColor(result.severity) }}>{result.urgency_score} / 100</strong>
                </span>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    width: `${result.urgency_score}%`, height: '100%',
                    background: `linear-gradient(90deg, ${severityColor(result.severity)}99, ${severityColor(result.severity)})`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>

              {/* Recommended assets */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Recommended Response Assets:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {result.recommended_assets.map((asset, i) => (
                    <div key={i} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 size={13} style={{ color: '#22c55e', flexShrink: 0 }} /> {asset}
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol */}
              {result.protocol_summary && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 10, background: 'rgba(139,92,246,0.06)', borderRadius: 8, border: '1px solid rgba(139,92,246,0.2)', marginBottom: 10 }}>
                  <strong>Protocol:</strong> {result.protocol_summary}
                </div>
              )}

              {/* AI assessment */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 10, background: 'rgba(6,182,212,0.06)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <Info size={13} style={{ flexShrink: 0, marginTop: 1, color: '#06b6d4' }} />
                  <span><strong>AI Assessment:</strong> {result.ai_assessment}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 10, opacity: 0.6 }}>
                  Source: {result.source} · Severity {result.severity}/5
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
