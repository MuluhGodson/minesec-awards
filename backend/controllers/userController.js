const db = require('../db');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT id, first_name, last_name, email, role, status FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const result = await db.query(query, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, role, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, role`,
      [first_name, last_name, email, hashedPassword, role || 'candidate']
    );
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to create user' });
  }
};
