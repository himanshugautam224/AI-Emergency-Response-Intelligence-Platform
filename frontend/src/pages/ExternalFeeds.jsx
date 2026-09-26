import React, { useEffect, useState, useCallback } from 'react';
import { weatherAPI } from '../api/client';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  RefreshCw, Zap, Globe, Wind, Droplets, Thermometer,
  AlertTriangle, MapPin, Navigation, Info,
} from 'lucide-react';

export default function ExternalFeeds() {
  const geo = useGeolocation();
  const [earthquakes, setEarthquakes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [nasaEvents, setNasaEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [apiError, setApiError] = useState(null);

  const fetchAll = useCallback(async (lat, lon) => {
    if (!lat || !lon) return;
    setLoading(true);
    setApiError(null);
    try {
      const [eqRes, wRes, nasaRes] = await Promise.all([
        weatherAPI.earthquakes(lat, lon, 'week', 3.0).catch(() => ({ data: [] })),
        weatherAPI.current(lat, lon).catch(() => ({ data: null })),
        weatherAPI.nasaEvents(lat, lon).catch(() => ({ data: [] })),
      ]);

      const eqData = eqRes.data;
      const wData = wRes.data;
      const nasaData = nasaRes.data;

      if (wData?.error) setApiError('Weather data unavailable — backend may be offline.');
      setEarthquakes(Array.isArray(eqData) ? eqData : eqData?.data || []);
      setWeather(wData?.error ? null : wData);
      setNasaEvents(Array.isArray(nasaData) ? nasaData : nasaData?.data || []);
      setLastFetch(new Date());
    } catch (err) {
      setApiError('Failed to fetch real-time data. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch once we have real GPS coords
  useEffect(() => {
    if (!geo.loading && !geo.error && geo.lat && geo.lon) {
      fetchAll(geo.lat, geo.lon);
    }
  }, [geo.loading, geo.error, geo.lat, geo.lon, fetchAll]);

  const getMagColor = (mag) => {
    if (mag >= 6) return '#ef4444';
    if (mag >= 5) return '#f97316';
    if (mag >= 4) return '#eab308';
    return '#94a3b8';
  };

  // ─── Location banner ────────────────────────────────────────────────────────
  const renderLocationBanner = () => {
    if (geo.loading) {
      return (
        <div style={bannerStyle('#06b6d4')}>
          <Navigation size={16} style={{ animation: 'spin 1.5s linear infinite' }} />
          <span>Detecting your exact location via GPS…</span>
        </div>
      );
    }
    if (geo.error) {
      return (
        <div style={bannerStyle('#ef4444')}>
          <AlertTriangle size={16} />
          <span>{geo.error} — enable location access and refresh the page.</span>
        </div>
      );
    }
    return (
      <div style={bannerStyle('#22c55e')}>
        <MapPin size={16} />
        <span>
          Showing real-time data for your location&nbsp;
          <strong>({geo.lat.toFixed(4)}°N, {geo.lon.toFixed(4)}°E)</strong>
          {geo.accuracy && ` · ±${Math.round(geo.accuracy)}m accuracy`}
        </span>
        {lastFetch && (
          <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.8 }}>
            Updated {lastFetch.toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Real-Time External Feeds
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Live data from USGS Earthquakes, NASA EONET &amp; Open-Meteo — all sourced for <em>your GPS location</em>
          </p>
        </div>
        <button
          onClick={() => fetchAll(geo.lat, geo.lon)}
          disabled={loading || !geo.lat}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: 'var(--primary)', border: 'none', borderRadius: 8,
            color: 'white', cursor: (loading || !geo.lat) ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, opacity: (!geo.lat) ? 0.5 : 1,
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
          {loading ? 'Fetching…' : 'Refresh All'}
        </button>
      </div>

      {/* Location banner */}
      {renderLocationBanner()}

      {/* Backend error */}
      {apiError && (
        <div style={{ ...bannerStyle('#f97316'), marginBottom: 16, marginTop: 0 }}>
          <Info size={15} /> {apiError}
        </div>
      )}

      {/* Waiting for location */}
      {geo.loading && (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 14 }}>
          <Navigation size={32} style={{ animation: 'spin 1.5s linear infinite', marginBottom: 12, color: '#06b6d4' }} />
          <div>Waiting for GPS location…</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Please allow location access in your browser</div>
        </div>
      )}

      {/* Permission denied */}
      {!geo.loading && geo.error && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
          <AlertTriangle size={32} style={{ color: '#ef4444', marginBottom: 12 }} />
          <div style={{ fontWeight: 600 }}>Location access required</div>
          <div style={{ fontSize: 12, marginTop: 6, maxWidth: 400, margin: '8px auto 0' }}>
            {geo.error} Real-time disaster feeds are location-specific — no fake data will be shown without a real GPS fix.
          </div>
        </div>
      )}

      {/* Data grids — only shown after real GPS coords */}
      {!geo.loading && !geo.error && geo.lat && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Earthquake Feed */}
          <div className="card" style={{ padding: 20, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={18} color="#ef4444" />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>USGS Earthquake Feed</h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                  M3.0+ events within 1,000 km of your location · past 7 days · {earthquakes.length} events
                </p>
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Loading earthquake data…</div>
            ) : earthquakes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                ✅ No M3.0+ earthquakes near your location in the past 7 days
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 8 }}>
                {earthquakes.slice(0, 24).map(eq => (
                  <div key={eq.id} style={{
                    padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8,
                    border: `1px solid ${getMagColor(eq.magnitude)}30`, display: 'flex', gap: 12, alignItems: 'center',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 8, flexShrink: 0,
                      background: `${getMagColor(eq.magnitude)}20`, border: `1px solid ${getMagColor(eq.magnitude)}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: getMagColor(eq.magnitude),
                    }}>
                      M{eq.magnitude?.toFixed(1)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {eq.place}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Depth {eq.depth_km?.toFixed(0) ?? eq.depth?.toFixed(0)}km
                        {eq.distance_km != null && ` · ${eq.distance_km.toFixed(0)} km from you`}
                        {' · '}{new Date(eq.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {eq.tsunami === 1 && (
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>⚠️ TSUNAMI WARNING</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weather */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wind size={18} color="#06b6d4" />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Current Weather</h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                  {weather?.city ? `📍 ${weather.city}` : 'Your location'} · Open-Meteo (no API key)
                </p>
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Loading weather…</div>
            ) : !weather ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                Weather unavailable — is the backend running?
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: Thermometer, label: 'Temperature', value: `${weather.temperature}°C`, sub: `Feels like ${weather.feels_like}°C`, color: '#f97316' },
                  { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, sub: 'Relative humidity', color: '#06b6d4' },
                  { icon: Wind, label: 'Wind Speed', value: `${weather.wind_speed} km/h`, sub: `Dir: ${weather.wind_direction}°`, color: '#8b5cf6' },
                  { icon: AlertTriangle, label: 'Pressure', value: `${weather.pressure} hPa`, sub: `Precip: ${weather.precipitation ?? 0}mm`, color: '#22c55e' },
                ].map(({ icon: Icon, label, value, sub, color }) => (
                  <div key={label} style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <Icon size={13} color={color} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', padding: 10, background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ fontSize: 20, marginRight: 8 }}>{weather.icon}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{weather.description}</span>
                  <span style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    Source: {weather.source} · {weather.updated_at}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* NASA Events */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={18} color="#8b5cf6" />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>NASA EONET Events</h2>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                  Active natural events within 2,000 km · {nasaEvents.length} events
                </p>
              </div>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Loading NASA data…</div>
            ) : nasaEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                ✅ No active NASA EONET events near your location
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                {nasaEvents.slice(0, 20).map(ev => (
                  <div key={ev.id} style={{
                    padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8,
                    border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center',
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {ev.categories?.join(', ')}
                        {ev.distance_km != null && ` · ${ev.distance_km.toFixed(0)} km from you`}
                        {ev.date && ` · ${new Date(ev.date).toLocaleDateString('en-IN')}`}
                      </div>
                    </div>
                    {ev.link && (
                      <a href={ev.link} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 10, color: '#8b5cf6', textDecoration: 'none', flexShrink: 0 }}>
                        NASA →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

function bannerStyle(color) {
  return {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', borderRadius: 8, marginBottom: 16,
    background: `${color}15`, border: `1px solid ${color}40`,
    color, fontSize: 13, fontWeight: 500,
  };
}
