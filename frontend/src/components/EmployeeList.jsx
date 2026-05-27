import { useState, useEffect } from 'react'

export default function EmployeeList({ api }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    fetch(`${api}/api/employees`)
      .then(r => r.json()).then(setEmployees)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">⏳ Loading employees...</div>

  return (
    <div>
      <div className="page-header">
        <h1>👥 Employees</h1>
        <p>Team members and their task assignments</p>
      </div>

      <div className="emp-grid">
        {employees.map(e => {
          const total     = parseInt(e.total_tasks)     || 0
          const completed = parseInt(e.completed_tasks) || 0
          const pct       = total > 0 ? Math.round((completed / total) * 100) : 0
          return (
            <div key={e.id} className="emp-card">
              <div className="emp-avatar">{e.avatar}</div>
              <div className="emp-name">{e.name}</div>
              <div className="emp-role">{e.role}</div>

              <div className="emp-stats">
                <div className="emp-stat">
                  <div className="emp-stat-val">{total}</div>
                  <div className="emp-stat-lbl">Total</div>
                </div>
                <div className="emp-stat">
                  <div className="emp-stat-val" style={{color:'var(--green)'}}>{completed}</div>
                  <div className="emp-stat-lbl">Done</div>
                </div>
                <div className="emp-stat">
                  <div className="emp-stat-val" style={{color:'var(--yellow)'}}>{parseInt(e.inprogress_tasks)||0}</div>
                  <div className="emp-stat-lbl">WIP</div>
                </div>
                <div className="emp-stat">
                  <div className="emp-stat-val" style={{color:'var(--blue)'}}>{parseInt(e.pending_tasks)||0}</div>
                  <div className="emp-stat-lbl">Todo</div>
                </div>
              </div>

              <div style={{ marginTop:'12px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.75rem', color:'var(--muted)', marginBottom:'4px' }}>
                  <span>Completion</span><span style={{fontWeight:600}}>{pct}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{width:`${pct}%`}} />
                </div>
              </div>

              <div style={{ marginTop:'12px', fontSize:'.78rem', color:'var(--muted)' }}>📧 {e.email}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
