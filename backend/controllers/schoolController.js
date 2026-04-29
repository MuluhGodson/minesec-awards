const db = require('../db');

exports.getAllSchools = async (req, res) => {
  try {
    const { region_id, type } = req.query;
    let query = 'SELECT * FROM schools';
    const params = [];
    const conditions = [];
    
    if (region_id) {
      params.push(region_id);
      conditions.push(`region_id = $${params.length}`);
    }
    if (type) {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY name ASC LIMIT 100'; // Pagination would be better
    
    const result = await db.query(query, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch schools' });
  }
};

exports.createSchool = async (req, res) => {
  try {
    const { matricule, name, type, sector, region_id, department, city } = req.body;
    
    const result = await db.query(
      `INSERT INTO schools 
      (matricule, name, type, sector, region_id, department, city) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [matricule, name, type, sector, region_id, department, city]
    );
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to create school' });
  }
};
