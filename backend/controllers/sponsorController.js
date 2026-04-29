const db = require('../db');

exports.getAllSponsors = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM sponsors ORDER BY display_order ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch sponsors' });
  }
};

exports.createSponsor = async (req, res) => {
  try {
    const { name, legal_name, tier, sector, country, website } = req.body;
    let logo_storage_key = null;
    
    if (req.file) {
      logo_storage_key = req.file.filename;
    }
    
    const result = await db.query(
      `INSERT INTO sponsors (name, legal_name, tier, sector, country, website, logo_storage_key) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, legal_name, tier || 'institutional', sector, country || 'Cameroun', website, logo_storage_key]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to create sponsor' });
  }
};
