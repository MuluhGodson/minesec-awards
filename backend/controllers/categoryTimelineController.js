const db = require('../db');

exports.getTimelineSteps = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM timeline_steps WHERE category_id = $1 ORDER BY position ASC',
      [categoryId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching timeline steps:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch timeline steps' });
  }
};

exports.createTimelineStep = async (req, res) => {
  const { categoryId } = req.params;
  const { position, name_en, name_fr, description_en, description_fr, starts_at, ends_at, status } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO timeline_steps 
        (category_id, position, name_en, name_fr, description_en, description_fr, starts_at, ends_at, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        categoryId, 
        position || 1, 
        name_en || '', 
        name_fr || '', 
        description_en || null, 
        description_fr || null, 
        starts_at || null, 
        ends_at || null, 
        status || 'upcoming'
      ]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating timeline step:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create timeline step' });
  }
};

exports.updateTimelineStep = async (req, res) => {
  const { stepId } = req.params;
  const { position, name_en, name_fr, description_en, description_fr, starts_at, ends_at, status } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE timeline_steps 
       SET position = COALESCE($1, position),
           name_en = COALESCE($2, name_en),
           name_fr = COALESCE($3, name_fr),
           description_en = $4,
           description_fr = $5,
           starts_at = $6,
           ends_at = $7,
           status = COALESCE($8, status)
       WHERE id = $9 
       RETURNING *`,
      [position, name_en, name_fr, description_en, description_fr, starts_at, ends_at, status, stepId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Timeline step not found' });
    }
    
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating timeline step:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update timeline step' });
  }
};

exports.deleteTimelineStep = async (req, res) => {
  const { stepId } = req.params;
  try {
    const result = await db.query('DELETE FROM timeline_steps WHERE id = $1 RETURNING id', [stepId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Timeline step not found' });
    }
    res.json({ status: 'success', message: 'Timeline step deleted successfully' });
  } catch (error) {
    console.error('Error deleting timeline step:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete timeline step' });
  }
};
