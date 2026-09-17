import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import { Package, Truck, Anchor, HeartPulse, Shield, Plus, MapPin } from 'lucide-react';

const RESOURCES = [
  { id: 1, name: 'Inflatable Rescue Boats (IRB)', category: 'Marine Rescue', total: 45, deployed: 32, available: 13, location: 'Odisha Coastal Hub', status: 'critical' },
  { id: 2, name: 'Emergency Food & Water Ration Kits', category: 'Relief Supplies', total: 5000, deployed: 3400, available: 1600, location: 'Central Warehouse, Nagpur', status: 'optimal' },
  { id: 3, name: 'Advanced Life Support Ambulances', category: 'Medical', total: 28, deployed: 21, available: 7, location: 'Mumbai Regional Depot', status: 'warning' },
  { id: 4, name: 'Heavy Tracked Earthmovers / Excavators', category: 'Clearing Equipment', total: 18, deployed: 14, available: 4, location: 'Wayanad Sector Depot', status: 'warning' },
  { id: 5, name: 'High-Capacity De-Watering Pumps', category: 'Flood Mitigation', total: 60, deployed: 48, available: 12, location: 'Kullu Flood Command', status: 'optimal' },
];

export default function Resources() {
  return (
    <div className="page-wrapper">
      <Topbar title="Emergency Resource Allocation & Logistics" breadcrumb="Management / Resources" />

      {/* Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Inventory Items</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>5,151</div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Currently Deployed</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--primary)' }}>3,515</div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reserve Ready</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: '#22c55e' }}>1,636</div>
        </div>
        <div className="card">
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Depot Utilization Rate</span>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: 'var(--secondary)' }}>68.2%</div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Active Resource Fleet</h3>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Plus size={15} /> Add Logistics Asset
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 20px' }}>Asset Name</th>
                <th style={{ padding: '12px 20px' }}>Category</th>
                <th style={{ padding: '12px 20px' }}>Base Depot</th>
                <th style={{ padding: '12px 20px' }}>Available / Total</th>
                <th style={{ padding: '12px 20px' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((res) => (
                <tr key={res.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-bright)' }}>{res.name}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{res.category}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                      <MapPin size={13} style={{ color: 'var(--secondary)' }} /> {res.location}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <strong style={{ color: '#22c55e' }}>{res.available}</strong> / {res.total}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className={`badge ${res.status === 'critical' ? 'badge-red' : res.status === 'warning' ? 'badge-orange' : 'badge-green'}`}>
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                      Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
