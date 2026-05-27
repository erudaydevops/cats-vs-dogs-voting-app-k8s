import { useState } from 'react'
import Dashboard    from './components/Dashboard.jsx'
import TaskList     from './components/TaskList.jsx'
import EmployeeList from './components/EmployeeList.jsx'

const API = import.meta.env.VITE_API_URL || ''

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
  { id: 'tasks',     label: 'Tasks',      icon: '✅' },
  { id: 'employees', label: 'Employees',  icon: '👥' },
]

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <div>
            <div className="logo-text">WorkTrack</div>
            <div className="logo-sub">Pro Dashboard</div>
          </div>
        </div>

        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="icon">{n.icon}</span>
            {n.label}
          </button>
        ))}

        <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--border)', marginLeft: '-16px', marginRight: '-16px', paddingLeft: '28px' }}>
          <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>🚀 Deployed on</div>
          <div style={{ fontSize: '.8rem', fontWeight: 600, color: '#a5b4fc' }}>Kubernetes</div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main">
        {page === 'dashboard' && <Dashboard api={API} />}
        {page === 'tasks'     && <TaskList  api={API} />}
        {page === 'employees' && <EmployeeList api={API} />}
      </main>
    </div>
  )
}
