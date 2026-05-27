import { useState, useEffect } from 'react'

export default function Dashboard({ api }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${api}/api/stats`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">⏳ Loading dashboard...</div>

  const completed  = stats?.byStatus?.completed   || 0
  const inProgress = stats?.byStatus?.['in-progress'] || 0
  const pending    = stats?.byStatus?.pending      || 0
  const total      = stats?.totalTasks || 0
  const pct        = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome back! Here's what's happening at WorkTrack Pro.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">📋</div>
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value" style={{color:'var(--green)'}}>{completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div>
            <div className="stat-value" style={{color:'var(--yellow)'}}>{inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🔵</div>
          <div>
            <div className="stat-value" style={{color:'var(--blue)'}}>{pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">👥</div>
          <div>
            <div className="stat-value">{stats?.totalEmployees || 0}</div>
            <div className="stat-label">Employees</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Completion Progress */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Overall Progress</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: '12px' }}>
            {completed} of {total} tasks completed
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '.8rem', color: 'var(--muted)' }}>
            <span>🟢 Done: {completed}</span>
            <span>🟡 WIP: {inProgress}</span>
            <span>🔵 Todo: {pending}</span>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Priority Breakdown</span>
          </div>
          {[
            { key: 'high',   label: '🔴 High',   color: 'var(--red)' },
            { key: 'medium', label: '🟡 Medium',  color: 'var(--yellow)' },
            { key: 'low',    label: '🟢 Low',     color: 'var(--green)' },
          ].map(({ key, label, color }) => {
            const val = stats?.byPriority?.[key] || 0
            const pct2 = total > 0 ? (val / total) * 100 : 0
            return (
              <div key={key} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '6px' }}>
                  <span>{label}</span>
                  <span style={{ color, fontWeight: 600 }}>{val}</span>
                </div>
                <div className="progress">
                  <div style={{ height: '100%', borderRadius: '3px', background: color, width: `${pct2}%`, transition: 'width .5s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* K8s Info Banner */}
      <div style={{
        marginTop: '20px', padding: '16px 20px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(99,102,241,.1), rgba(139,92,246,.1))',
        border: '1px solid rgba(99,102,241,.3)', display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <span style={{ fontSize: '1.8rem' }}>☸️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '.95rem' }}>Running on Kubernetes</div>
          <div style={{ color: 'var(--muted)', fontSize: '.8rem' }}>
            React Frontend · Node.js API · PostgreSQL · Redis · Deployed with Deployments, Services, ConfigMaps & Secrets
          </div>
        </div>
      </div>
    </div>
  )
}
