const db = require('../db');

exports.getAllEditions = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM editions ORDER BY year DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch editions' });
  }
};

exports.getEditionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM editions WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Edition not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch edition' });
  }
};

exports.createEdition = async (req, res) => {
  try {
    const { year, roman_numeral, name_fr, name_en, theme_fr, theme_en, status, applications_open_at, applications_close_at, total_budget_fcfa } = req.body;
    
    const result = await db.query(
      `INSERT INTO editions 
      (year, roman_numeral, name_fr, name_en, theme_fr, theme_en, status, applications_open_at, applications_close_at, total_budget_fcfa) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [year, roman_numeral, name_fr, name_en, theme_fr, theme_en, status || 'draft', applications_open_at, applications_close_at, total_budget_fcfa]
    );
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to create edition' });
  }
};

exports.updateEdition = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ceremony_at, ceremony_venue } = req.body; // Example fields to update
    
    const result = await db.query(
      `UPDATE editions 
       SET status = COALESCE($1, status), 
           ceremony_at = COALESCE($2, ceremony_at), 
           ceremony_venue = COALESCE($3, ceremony_venue),
           updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [status, ceremony_at, ceremony_venue, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Edition not found' });
    }
    
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to update edition' });
  }
};
