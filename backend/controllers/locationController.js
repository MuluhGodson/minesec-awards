const db = require('../db');

exports.getLocations = async (req, res) => {
  try {
    // For this prototype, we'll fetch all regions and schools, and let the frontend organize them.
    const regionsResult = await db.query('SELECT id, code, name_en, name_fr FROM regions ORDER BY id ASC');
    const schoolsResult = await db.query('SELECT id, name, type, sector, region_id, department, city FROM schools ORDER BY name ASC');

    res.json({
      status: 'success',
      data: {
        regions: regionsResult.rows,
        schools: schoolsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch locations' });
  }
};
