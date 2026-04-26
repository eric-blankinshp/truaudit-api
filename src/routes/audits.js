const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'get audits placeholder' });
});

router.post('/', (req, res) => {
  res.json({ message: 'create audit placeholder' });
});

router.put('/:id/submit', (req, res) => {
  res.json({ message: 'submit audit placeholder' });
});

router.put('/:id/review', (req, res) => {
  res.json({ message: 'review audit placeholder' });
});

router.put('/:id/close', (req, res) => {
  res.json({ message: 'close audit placeholder' });
});

module.exports = router;