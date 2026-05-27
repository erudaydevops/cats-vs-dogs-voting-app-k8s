const router = require('express').Router();
const { pool } = require('../db');

// GET all employees with their task count
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.*,
        COUNT(t.id)                                            AS total_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'completed')     AS completed_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'in-progress')   AS inprogress_tasks,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')       AS pending_tasks
      FROM employees e
      LEFT JOIN tasks t ON t.employee_id = e.id
      GROUP BY e.id
      ORDER BY e.name
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET single employee
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM employees WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
