require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// =====================
// CORS CONFIG (WEB SAFE)
// =====================
app.use(cors({
  origin: '*', // allow all (ok for college project)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use('/api/teacher', require('./routes/teacher.routes'));


app.use(express.json());

// =====================
// LOG ENV (DEBUG)
// =====================
console.log('JWT SECRET:', process.env.JWT_SECRET);

// =====================
// ROUTES
// =====================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));

// =====================
// HEALTH CHECK
// =====================
app.get('/', (req, res) => {
  res.json({ status: 'Backend is running ✅' });
});

// =====================
// ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
