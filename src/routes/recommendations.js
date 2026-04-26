const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper — calculate business days elapsed since a date
function businessDaysSince(date) {
  const start = new Date(date);
  const now = new Date();
  let count = 0;
  const current = new Date(start);
  while (current < now) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// POST /recommendations
router.post('/', async (req, res) => {
  const { department_id, description } = req.body;
  const user_id = req.user.user_id;
  const role = req.user.role;

  if (role !== 'auditor') {
    return res.status(403).json({ error: 'Only auditors may submit recommendations.' });
  }

  if (!department_id || !description) {
    return res.status(400).json({ error: 'department_id and description are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO recommendation (user_id, department_id, description, status)
       VALUES ($1, $2, $3, 'open')
       RETURNING *`,
      [user_id, department_id, description]
    );

    const rec = result.rows[0];
    res.status(201).json({ ...rec, delinquent: false });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /recommendations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name as submitted_by_name, d.name as department_name
      FROM recommendation r
      JOIN user_account u ON r.user_id = u.user_id
      JOIN department d ON r.department_id = d.department_id
      ORDER BY r.submitted_at DESC
    `);

    const rows = result.rows.map(rec => ({
      ...rec,
      delinquent: rec.status === 'open' && businessDaysSince(rec.submitted_at) > 4
    }));

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /recommendations/:id/address
router.put('/:id/address', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const role = req.user.role;

  if (role !== 'qms_manager') {
    return res.status(403).json({ error: 'Only QMS managers may address recommendations.' });
  }

  if (!['resolved', 'not_feasible'].includes(status)) {
    return res.status(400).json({ error: "status must be either 'resolved' or 'not_feasible'." });
  }

  try {
    const result = await pool.query(
      `UPDATE recommendation 
       SET status = $1, addressed_at = NOW() 
       WHERE recommendation_id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recommendation not found.' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;