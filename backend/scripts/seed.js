const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  user: process.env.DB_USERNAME || 'root',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_DATABASE || 'minesec_awards',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    
    // Check if admin already exists
    const existingAdmin = await pool.query("SELECT id FROM users WHERE email = 'admin@minesec.gov.cm'");
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email`,
      ['Super', 'Admin', 'admin@minesec.gov.cm', hashedPassword, 'super_admin', 'active']
    );

    console.log('Default Admin created successfully!');
    console.log('Email:', result.rows[0].email);
    console.log('Password: admin123');

  } catch (err) {
    console.error('Failed to seed admin:', err);
  } finally {
    await pool.end();
  }
}

seedAdmin();
