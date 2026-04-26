const express = require('express');
const router = express.Router();
const pool = require('../db');

router.put('/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const role = req.user.role;

  // Rule 3 — only QMS managers can resolve
  if (role !== 'qms_manager') {
    return res.status(403).json({ error: 'Only QMS managers may resolve corrective actions.' });
  }

  try {
    const caResult = await pool.query(
      'SELECT * FROM corrective_action WHERE corrective_action_id = $1',
      [id]
    );

    if (caResult.rows.length === 0) {
      return res.status(404).json({ error: 'Corrective action not found.' });
    }

    if (caResult.rows[0].status === 'resolved') {
      return res.status(409).json({ error: 'This corrective action is already resolved.' });
    }

    await pool.query(
      "UPDATE corrective_action SET status = 'resolved', resolved_at = NOW() WHERE corrective_action_id = $1",
      [id]
    );

    res.json({
      id: parseInt(id),
      status: 'resolved',
      resolved_at: new Date()
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;