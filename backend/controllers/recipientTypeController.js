const db = require('../db');

exports.getAllRecipientTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM recipient_types ORDER BY created_at ASC');
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch recipient types' });
  }
};

exports.createRecipientType = async (req, res) => {
  try {
    const { code, name_fr, name_en } = req.body;
    const result = await db.query(
      'INSERT INTO recipient_types (code, name_fr, name_en) VALUES ($1, $2, $3) RETURNING *',
      [code, name_fr, name_en]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to create recipient type' });
  }
};

exports.updateRecipientType = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name_fr, name_en } = req.body;
    const result = await db.query(
      'UPDATE recipient_types SET code = COALESCE($1, code), name_fr = COALESCE($2, name_fr), name_en = COALESCE($3, name_en), updated_at = NOW() WHERE id = $4 RETURNING *',
      [code, name_fr, name_en, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Recipient type not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to update recipient type' });
  }
};

exports.deleteRecipientType = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: in a real system we would check if this recipient type is used by categories before deleting
    const result = await db.query('DELETE FROM recipient_types WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Recipient type not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23503') { // foreign key violation
      return res.status(400).json({ status: 'error', message: 'Cannot delete because it is used by categories' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to delete recipient type' });
  }
};
