const db = require('../db');
// 1. Import your new upload service
const { uploadFile } = require('../services/storage');

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

    // 2. Upload the file to the 'sponsors' folder in Firebase Storage 
    //    and grab the public URL. If there is no file, it remains null.
    const logo_storage_key = req.file ? await uploadFile(req.file, 'sponsors') : null;

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