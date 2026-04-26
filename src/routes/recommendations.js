const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'get recommendations placeholder' });
});

router.post('/', (req, res) => {
  res.json({ message: 'create recommendation placeholder' });
});

router.put('/:id/address', (req, res) => {
  res.json({ message: 'address recommendation placeholder' });
});

module.exports = router;