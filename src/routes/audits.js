const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /audits - create new audit
router.post('/', async (req, res) => {
  const { department_id, iso_section, result, notes, completed_date } = req.body;
  const user_id = req.user.user_id;
  const role = req.user.role;

  // Rule 1 — only auditors can create audits
  if (role !== 'auditor') {
    return res.status(403).json({ error: 'Only auditors may create audits.' });
  }

  // Validate required fields
  if (!department_id || !iso_section || !result || !completed_date) {
    return res.status(400).json({ error: 'department_id, iso_section, result, and completed_date are required.' });
  }

  if (!['pass', 'fail'].includes(result)) {
    return res.status(400).json({ error: 'result must be pass or fail.' });
  }

  try {
    // Rule 4 — max 5 in-work audits
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM audit WHERE user_id = $1 AND status IN ('in_work', 'submitted')",
      [user_id]
    );

    if (parseInt(countResult.rows[0].count) >= 5) {
      return res.status(409).json({ error: 'You already have 5 audits in work. Submit or close one before creating a new audit.' });
    }

    // Create the audit
    const insertResult = await pool.query(
      `INSERT INTO audit (user_id, department_id, iso_section, result, notes, completed_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'in_work')
       RETURNING *`,
      [user_id, department_id, iso_section, result, notes, completed_date]
    );

    res.status(201).json(insertResult.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /audits - get all visible audits with optional filters
router.get('/', async (req, res) => {
  const user_id = req.user.user_id;
  const role = req.user.role;
  const { department_id, result, iso_section, from, to } = req.query;

  try {
    let query = `
      SELECT a.*, d.name as department_name, u.name as auditor_name
      FROM audit a
      JOIN department d ON a.department_id = d.department_id
      JOIN user_account u ON a.user_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Rule 6 — auditors only see their own in_work audits
    if (role === 'auditor') {
      query += ` AND (a.user_id = $${paramCount} OR a.status != 'in_work')`;
      params.push(user_id);
      paramCount++;
    }

    if (department_id) {
      query += ` AND a.department_id = $${paramCount}`;
      params.push(department_id);
      paramCount++;
    }

    if (result) {
      query += ` AND a.result = $${paramCount}`;
      params.push(result);
      paramCount++;
    }

    if (iso_section) {
      query += ` AND a.iso_section = $${paramCount}`;
      params.push(iso_section);
      paramCount++;
    }

    if (from) {
      query += ` AND a.completed_date >= $${paramCount}`;
      params.push(from);
      paramCount++;
    }

    if (to) {
      query += ` AND a.completed_date <= $${paramCount}`;
      params.push(to);
      paramCount++;
    }

    query += ' ORDER BY a.created_at DESC';

    const result2 = await pool.query(query, params);
    res.json(result2.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /audits/:id/submit
router.put('/:id/submit', async (req, res) => {
  const { id } = req.params;
  const role = req.user.role;
  const user_id = req.user.user_id;

  // Rule 1 — only auditors can submit
  if (role !== 'auditor') {
    return res.status(403).json({ error: 'Only auditors may submit audits.' });
  }

  try {
    const auditResult = await pool.query(
      'SELECT * FROM audit WHERE audit_id = $1',
      [id]
    );

    if (auditResult.rows.length === 0) {
      return res.status(404).json({ error: 'Audit not found.' });
    }

    const audit = auditResult.rows[0];

    if (audit.status !== 'in_work') {
      return res.status(409).json({ error: 'Only in_work audits can be submitted.' });
    }

    // Update status to submitted
    await pool.query(
      "UPDATE audit SET status = 'submitted' WHERE audit_id = $1",
      [id]
    );

    // Rule 3 — auto create corrective action if fail
    let corrective_action_id = null;
    if (audit.result === 'fail') {
      const caResult = await pool.query(
        `INSERT INTO corrective_action (audit_id, department_id, status)
         VALUES ($1, $2, 'open')
         RETURNING corrective_action_id`,
        [id, audit.department_id]
      );
      corrective_action_id = caResult.rows[0].corrective_action_id;
    }

    res.json({
      id: parseInt(id),
      status: 'submitted',
      corrective_action_created: corrective_action_id !== null,
      corrective_action_id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /audits/:id/review
router.put('/:id/review', async (req, res) => {
  const { id } = req.params;
  const role = req.user.role;

  // Rule 2 — only QMS managers
  if (role !== 'qms_manager') {
    return res.status(403).json({ error: 'Only QMS managers may move audits to in_review.' });
  }

  try {
    const auditResult = await pool.query(
      'SELECT * FROM audit WHERE audit_id = $1',
      [id]
    );

    if (auditResult.rows.length === 0) {
      return res.status(404).json({ error: 'Audit not found.' });
    }

    if (auditResult.rows[0].status !== 'submitted') {
      return res.status(409).json({ error: 'Only submitted audits can be moved to in_review.' });
    }

    await pool.query(
      "UPDATE audit SET status = 'in_review' WHERE audit_id = $1",
      [id]
    );

    res.json({ id: parseInt(id), status: 'in_review' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /audits/:id/close
router.put('/:id/close', async (req, res) => {
  const { id } = req.params;
  const role = req.user.role;

  // Rule 2 — only QMS managers
  if (role !== 'qms_manager') {
    return res.status(403).json({ error: 'Only QMS managers may close audits.' });
  }

  try {
    const auditResult = await pool.query(
      'SELECT * FROM audit WHERE audit_id = $1',
      [id]
    );

    if (auditResult.rows.length === 0) {
      return res.status(404).json({ error: 'Audit not found.' });
    }

    if (auditResult.rows[0].status !== 'in_review') {
      return res.status(409).json({ error: 'Only in_review audits can be closed.' });
    }

    // Rule 3 — check for open corrective actions
    const caResult = await pool.query(
      "SELECT * FROM corrective_action WHERE audit_id = $1 AND status = 'open'",
      [id]
    );

    if (caResult.rows.length > 0) {
      return res.status(409).json({ error: 'This audit has an unresolved corrective action and cannot be closed.' });
    }

    await pool.query(
      "UPDATE audit SET status = 'closed' WHERE audit_id = $1",
      [id]
    );

    res.json({ id: parseInt(id), status: 'closed' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;