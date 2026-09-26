import React, { useState } from 'react';
import {
  Package, Truck, Anchor, HeartPulse, Shield, Plus, MapPin,
  Send, X, CheckCircle2, AlertTriangle, RefreshCw, Filter, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/audioAlert';

const INITIAL_RESOURCES = [
  { id: 1, name: 'Inflatable Rescue Boats (IRB)', category: 'Marine Rescue', total: 45, deployed: 32, available: 13, location: 'Odisha Coastal Hub', status: 'critical' },
  { id: 2, name: 'Emergency Food & Water Ration Kits', category: 'Relief Supplies', total: 5000, deployed: 3400, available: 1600, location: 'Central Warehouse, Nagpur', status: 'optimal' },
  { id: 3, name: 'Advanced Life Support Ambulances', category: 'Medical', total: 28, deployed: 21, available: 7, location: 'Mumbai Regional Depot', status: 'warning' },
  { id: 4, name: 'Heavy Tracked Earthmovers / Excavators', category: 'Clearing Equipment', total: 18, deployed: 14, available: 4, location: 'Wayanad Sector Depot', status: 'warning' },
  { id: 5, name: 'High-Capacity De-Watering Pumps', category: 'Flood Mitigation', total: 60, deployed: 48, available: 12, location: 'Kullu Flood Command', status: 'optimal' },
];

export default function Resources() {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dispatch Modal
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [dispatchCount, setDispatchCount] = useState(1);
  const [destinationSector, setDestinationSector] = useState('Odisha Coastal Zone (Sector 4)');
  const [transportMode, setTransportMode] = useState('Heavy Transport Truck Convoy');

  // Add Asset Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '', category: 'Marine Rescue', total: 20, location: 'Central Disaster Depot, Delhi',
  });

  const categories = ['all', 'Marine Rescue', 'Relief Supplies', 'Medical', 'Clearing Equipment', 'Flood Mitigation'];

  const filteredResources = resources.filter(r => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  const totalInventory = resources.reduce((sum, r) => sum + r.total, 0);
  const totalDeployed = resources.reduce((sum, r) => sum + r.deployed, 0);
  const totalAvailable = resources.reduce((sum, r) => sum + r.available, 0);
  const utilizationRate = totalInventory > 0 ? ((totalDeployed / totalInventory) * 100).toFixed(1) : '0';

  const handleOpenDispatch = (res) => {
    soundManager.playBeep(650, 0.05);
    setDispatchTarget(res);
    setDispatchCount(Math.min(res.available, Math.max(1, Math.floor(res.available / 2))));
  };

  const handleConfirmDispatch = (e) => {
    e.preventDefault();
    if (!dispatchTarget || dispatchCount <= 0) return;

    setResources(prev => prev.map(item => {
      if (item.id === dispatchTarget.id) {
        const nextAvail = Math.max(0, item.available - dispatchCount);
        const nextDeployed = item.deployed + dispatchCount;
        let nextStatus = 'optimal';
        if (nextAvail === 0) nextStatus = 'critical';
        else if (nextAvail < item.total * 0.25) nextStatus = 'warning';

        return {
          ...item,
          available: nextAvail,
          deployed: nextDeployed,
          status: nextStatus,
        };
      }
      return item;
    }));

    soundManager.playSiren(2);
    toast.success(`Dispatched ${dispatchCount} units of ${dispatchTarget.name} to ${destinationSector}!`, {
      icon: '🚚',
      style: { background: '#f97316', color: '#fff', fontWeight: 700 },
    });

    setDispatchTarget(null);
  };

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!newAsset.name.trim()) return;

    const total = parseInt(newAsset.total) || 10;
    const created = {
      id: Date.now(),
      name: newAsset.name.trim(),
      category: newAsset.category,
      total,
      deployed: 0,
      available: total,
      location: newAsset.location.trim() || 'Central Depot',
      status: 'optimal',
    };

    setResources([created, ...resources]);
    soundManager.playSuccess();
    toast.success(`Added ${created.name} (${total} units) to fleet!`);
    setShowAddModal(false);
    setNewAsset({ name: '', category: 'Marine Rescue', total: 20, location: 'Central Disaster Depot, Delhi' });
  };

  const handleReplenish = (res) => {
    setResources(prev => prev.map(item => {
      if (item.id === res.id) {
        const added = Math.max(5, Math.floor(item.total * 0.3));
        return {
          ...item,
          total: item.total + added,
          available: item.available + added,
          status: 'optimal',
        };
      }
      return item;
    }));
    soundManager.playSuccess();
    toast.success(`Replenished inventory for ${res.name}!`);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', margin: 0 }}>
            Resource & Logistics Command
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>
            Dispatch rescue boats, medical supplies, earthmovers, and high-capacity pumps across state depots.
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
          <Plus size={16} /> Add Logistics Asset
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Inventory Items</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: 'var(--text-primary)' }}>
            {totalInventory.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Currently Deployed</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: '#f97316' }}>
            {totalDeployed.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reserve Ready</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: '#22c55e' }}>
            {totalAvailable.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Depot Utilization Rate</span>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4, color: '#06b6d4' }}>
            {utilizationRate}%
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              soundManager.playBeep(600, 0.04);
            }}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid', cursor: 'pointer',
              background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-elevated)',
              color: selectedCategory === cat ? '#fff' : 'var(--text-muted)',
              borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
              transition: 'all 0.15s ease',
            }}
          >
            {cat === 'all' ? `All Equipment (${resources.length})` : cat}
          </button>
        ))}
      </div>

      {/* Resources Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Asset Name</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Base Depot</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Available / Total</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((res) => (
                <tr
                  key={res.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {res.name}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {res.category}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                      <MapPin size={13} style={{ color: '#06b6d4' }} /> {res.location}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <strong style={{ color: res.available > 0 ? '#22c55e' : '#ef4444', fontSize: 15 }}>
                      {res.available}
                    </strong>
                    <span style={{ color: 'var(--text-muted)' }}> / {res.total}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                      background: res.status === 'critical' ? 'rgba(239,68,68,0.15)' : res.status === 'warning' ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.15)',
                      color: res.status === 'critical' ? '#ef4444' : res.status === 'warning' ? '#f97316' : '#22c55e',
                      border: `1px solid ${res.status === 'critical' ? 'rgba(239,68,68,0.3)' : res.status === 'warning' ? 'rgba(249,115,22,0.3)' : 'rgba(34,197,94,0.3)'}`,
                      textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}>
                      {res.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      {res.available === 0 ? (
                        <button
                          onClick={() => handleReplenish(res)}
                          style={{
                            padding: '6px 12px', fontSize: 12, fontWeight: 700,
                            borderRadius: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)',
                            color: '#22c55e', cursor: 'pointer',
                          }}
                        >
                          <RefreshCw size={11} style={{ display: 'inline', marginRight: 4 }} /> Restock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenDispatch(res)}
                          className="interactive-hover-glow"
                          style={{
                            padding: '6px 14px', fontSize: 12, fontWeight: 700,
                            borderRadius: 6, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                            color: 'var(--text-primary)', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          <Truck size={12} color="#f97316" /> Dispatch
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── DISPATCH MODAL ─── */}
      {dispatchTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, width: '100%', maxWidth: 500, padding: 24,
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Truck size={20} color="#f97316" />
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Dispatch {dispatchTarget.name}
                </h3>
              </div>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setDispatchTarget(null)} />
            </div>

            <form onSubmit={handleConfirmDispatch}>
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-elevated)', marginBottom: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                <div>Base Depot: <strong>{dispatchTarget.location}</strong></div>
                <div>Currently Available in Depot: <strong style={{ color: '#22c55e' }}>{dispatchTarget.available} units</strong></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>Units to Deploy</span>
                  <span style={{ color: '#f97316', fontWeight: 800 }}>{dispatchCount} / {dispatchTarget.available} units</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={dispatchTarget.available}
                  value={dispatchCount}
                  onChange={e => setDispatchCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Destination Disaster Sector
                </label>
                <select
                  value={destinationSector}
                  onChange={e => setDestinationSector(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13,
                  }}
                >
                  <option value="Odisha Coastal Zone (Sector 4 - Bhadrak)">Odisha Coastal Zone (Sector 4 - Bhadrak)</option>
                  <option value="Wayanad Landslide Command Base">Wayanad Landslide Command Base</option>
                  <option value="Kurla Flooded Sector 2 (Mumbai)">Kurla Flooded Sector 2 (Mumbai)</option>
                  <option value="Guwahati Brahmaputra Evacuation Pier">Guwahati Brahmaputra Evacuation Pier</option>
                  <option value="Kullu Flash Flood Valley Relief Outpost">Kullu Flash Flood Valley Relief Outpost</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Transport Logistics Mode
                </label>
                <select
                  value={transportMode}
                  onChange={e => setTransportMode(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13,
                  }}
                >
                  <option value="Heavy Transport Truck Convoy">Heavy Transport Truck Convoy (SDRF Escort)</option>
                  <option value="IAF Heavy Chinook Air-Lift">IAF Heavy Chinook Air-Lift (Fastest)</option>
                  <option value="Amphibious Coastal Transit">Amphibious Coastal Transit (Indian Coast Guard)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setDispatchTarget(null)}
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
                  <Send size={13} /> Confirm Logistics Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ADD LOGISTICS ASSET MODAL ─── */}
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
                  Add Logistics Asset to Fleet
                </h3>
              </div>
              <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => setShowAddModal(false)} />
            </div>

            <form onSubmit={handleAddAsset}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Asset Name
                </label>
                <input
                  required
                  placeholder="e.g. Drone Thermal Reconnaissance Units"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={newAsset.category}
                  onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                >
                  <option value="Marine Rescue">Marine Rescue</option>
                  <option value="Relief Supplies">Relief Supplies</option>
                  <option value="Medical">Medical</option>
                  <option value="Clearing Equipment">Clearing Equipment</option>
                  <option value="Flood Mitigation">Flood Mitigation</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Base Depot Location
                </label>
                <input
                  required
                  placeholder="e.g. NDRF Base 4, Arakkonam"
                  value={newAsset.location}
                  onChange={e => setNewAsset({ ...newAsset, location: e.target.value })}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Total Inventory Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newAsset.total}
                  onChange={e => setNewAsset({ ...newAsset, total: e.target.value })}
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
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
