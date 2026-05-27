import { useState, useEffect } from 'react'

const STATUS   = ['all','pending','in-progress','completed']
const PRIORITY = ['all','high','medium','low']

const EMPTY = { title:'', description:'', status:'pending', priority:'medium', employee_id:'', due_date:'' }

export default function TaskList({ api }) {
  const [tasks, setTasks]         = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [statusF, setStatusF]     = useState('all')
  const [priorityF, setPriorityF] = useState('all')
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY)

  const fetchTasks = () => {
    const params = new URLSearchParams()
    if (statusF   !== 'all') params.set('status',   statusF)
    if (priorityF !== 'all') params.set('priority', priorityF)
    fetch(`${api}/api/tasks?${params}`)
      .then(r => r.json()).then(setTasks).catch(()=>{})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTasks() }, [statusF, priorityF])
  useEffect(() => {
    fetch(`${api}/api/employees`).then(r => r.json()).then(setEmployees).catch(()=>{})
  }, [])

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = t  => { setEditing(t.id); setForm({ title:t.title, description:t.description||'', status:t.status, priority:t.priority, employee_id:t.employee_id||'', due_date:t.due_date?.slice(0,10)||'' }); setModal(true) }
  const close    = () => { setModal(false); setEditing(null) }

  const save = async () => {
    const url    = editing ? `${api}/api/tasks/${editing}` : `${api}/api/tasks`
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, employee_id: form.employee_id||null}) })
    close(); fetchTasks()
  }

  const del = async id => {
    if (!confirm('Delete this task?')) return
    await fetch(`${api}/api/tasks/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  if (loading) return <div className="loading">⏳ Loading tasks...</div>

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>✅ Tasks</h1>
          <p>Manage and track all team tasks</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'20px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:'6px', fontWeight:600 }}>STATUS</div>
          <div className="filters" style={{ marginBottom:0 }}>
            {STATUS.map(s => (
              <button key={s} className={`filter-btn ${statusF===s?'active':''}`} onClick={()=>setStatusF(s)}>
                {s==='all'?'All':s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:'6px', fontWeight:600 }}>PRIORITY</div>
          <div className="filters" style={{ marginBottom:0 }}>
            {PRIORITY.map(p => (
              <button key={p} className={`filter-btn ${priorityF===p?'active':''}`} onClick={()=>setPriorityF(p)}>
                {p==='all'?'All':p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th><th>Assignee</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>No tasks found</td></tr>
              )}
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight:600, fontSize:'.875rem' }}>{t.title}</div>
                    {t.description && <div style={{ color:'var(--muted)', fontSize:'.78rem', marginTop:'2px' }}>{t.description.slice(0,60)}{t.description.length>60?'…':''}</div>}
                  </td>
                  <td>
                    {t.employee_avatar
                      ? <span style={{ fontSize:'1.1rem' }}>{t.employee_avatar} {t.employee_name}</span>
                      : <span style={{ color:'var(--muted)', fontSize:'.85rem' }}>Unassigned</span>
                    }
                  </td>
                  <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                  <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
                  <td style={{ color:'var(--muted)', fontSize:'.85rem' }}>{t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(t)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>del(t.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>{editing ? '✏️ Edit Task' : '➕ New Task'}</h2>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What needs to be done?" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assign To</label>
                <select value={form.employee_id} onChange={e=>setForm({...form,employee_id:e.target.value})}>
                  <option value="">Unassigned</option>
                  {employees.map(e=><option key={e.id} value={e.id}>{e.avatar} {e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={!form.title}>
                {editing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
