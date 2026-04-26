const express = require('express');
const router = express.Router();

router.put('/:id/resolve', (req, res) => {
  res.json({ message: 'resolve corrective action placeholder' });
});

module.exports = router;