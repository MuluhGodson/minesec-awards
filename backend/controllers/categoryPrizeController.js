const db = require('../db');

exports.getPrizes = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await db.query(
      'SELECT * FROM category_prizes WHERE category_id = $1 ORDER BY position ASC',
      [categoryId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching category prizes:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.addPrize = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name_en, name_fr, amount_fcfa, description_en, description_fr } = req.body;

    const posResult = await db.query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next_pos FROM category_prizes WHERE category_id = $1',
      [categoryId]
    );
    const nextPos = posResult.rows[0].next_pos;

    const result = await db.query(
      `INSERT INTO category_prizes (category_id, position, name_en, name_fr, amount_fcfa, description_en, description_fr)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [categoryId, nextPos, name_en, name_fr, amount_fcfa || null, description_en, description_fr]
    );

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error adding category prize:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.updatePrize = async (req, res) => {
  try {
    const { prizeId } = req.params;
    const { name_en, name_fr, amount_fcfa, description_en, description_fr } = req.body;

    const result = await db.query(
      `UPDATE category_prizes 
       SET name_en = $1, name_fr = $2, amount_fcfa = $3, description_en = $4, description_fr = $5
       WHERE id = $6 RETURNING *`,
      [name_en, name_fr, amount_fcfa || null, description_en, description_fr, prizeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Prize not found' });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error updating prize:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.deletePrize = async (req, res) => {
  try {
    const { prizeId } = req.params;
    const result = await db.query('DELETE FROM category_prizes WHERE id = $1 RETURNING *', [prizeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Prize not found' });
    }

    res.json({ status: 'success', message: 'Prize deleted' });
  } catch (err) {
    console.error('Error deleting prize:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};
