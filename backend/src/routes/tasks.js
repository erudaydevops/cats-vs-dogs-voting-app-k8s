const router = require('express').Router();
const { pool } = require('../db');

// GET all tasks (with employee name)
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = `
      SELECT t.*, e.name as employee_name, e.avatar as employee_avatar
      FROM tasks t
      LEFT JOIN employees e ON t.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (status)   { params.push(status);   query += ` AND t.status = $${params.length}`; }
    if (priority) { params.push(priority); query += ` AND t.priority = $${params.length}`; }
    query += ' ORDER BY t.created_at DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single task
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, e.name as employee_name FROM tasks t
       LEFT JOIN employees e ON t.employee_id = e.id
       WHERE t.id = $1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, employee_id, due_date } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, employee_id, due_date)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, status || 'pending', priority || 'medium', employee_id || null, due_date || null]
    );
    if (req.redis) await req.redis.del('stats');
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update task
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, employee_id, due_date } = req.body;
    const { rows } = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, status=$3, priority=$4,
       employee_id=$5, due_date=$6 WHERE id=$7 RETURNING *`,
      [title, description, status, priority, employee_id || null, due_date || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    if (req.redis) await req.redis.del('stats');
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id=$1', [req.params.id]);
    if (req.redis) await req.redis.del('stats');
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
