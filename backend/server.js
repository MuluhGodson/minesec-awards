const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Basic health check route
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      dbTime: result.rows[0].now,
      message: 'MINESEC Awards API is running'
    });
  } catch (err) {
    console.error('Database connection error', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database connection failed' 
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
