const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'minesec_super_secret_key_2026';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query('SELECT id, first_name, last_name, email, password_hash, role FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'success',
      data: {
        token,
        user: { 
          id: user.id, 
          name: `${user.first_name} ${user.last_name}`, 
          email: user.email, 
          role: user.role 
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  res.json({ status: 'success', data: { user: req.user } });
};
