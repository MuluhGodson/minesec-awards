const db = require('../db');

exports.getCategorySponsors = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const result = await db.query(
      `SELECT s.*, cs.is_primary, cs.contribution_fcfa 
       FROM sponsors s 
       JOIN category_sponsors cs ON s.id = cs.sponsor_id 
       WHERE cs.category_id = $1`,
      [categoryId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching category sponsors:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch category sponsors' });
  }
};

exports.addCategorySponsor = async (req, res) => {
  const { categoryId } = req.params;
  const { sponsor_id, is_primary, contribution_fcfa } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO category_sponsors (category_id, sponsor_id, is_primary, contribution_fcfa) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (category_id, sponsor_id) DO UPDATE 
       SET is_primary = EXCLUDED.is_primary, 
           contribution_fcfa = EXCLUDED.contribution_fcfa
       RETURNING *`,
      [categoryId, sponsor_id, is_primary || false, contribution_fcfa || null]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding category sponsor:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add category sponsor' });
  }
};

exports.removeCategorySponsor = async (req, res) => {
  const { categoryId, sponsorId } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM category_sponsors WHERE category_id = $1 AND sponsor_id = $2 RETURNING *',
      [categoryId, sponsorId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Sponsor not linked to this category' });
    }
    
    res.json({ status: 'success', message: 'Sponsor removed from category' });
  } catch (error) {
    console.error('Error removing category sponsor:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove category sponsor' });
  }
};
