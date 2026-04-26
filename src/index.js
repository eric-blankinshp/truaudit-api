const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Public route
app.use('/auth', require('./routes/auth'));

// Protected routes
const auth = require('./middleware/auth');
app.use('/audits', auth, require('./routes/audits'));
app.use('/corrective_actions', auth, require('./routes/correctiveActions'));
app.use('/recommendations', auth, require('./routes/recommendations'));
app.use('/departments', auth, require('./routes/departments'));

app.get('/', (req, res) => {
  res.json({ message: 'TruAudit API is running.' });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`TruAudit API running on port ${PORT}`);
});