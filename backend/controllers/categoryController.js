const db = require('../db');

exports.getAllCategories = async (req, res) => {
  try {
    const { edition_id } = req.query;
    let query = `
      SELECT ac.*, rt.code as recipient_type_code, rt.name_en as recipient_type_name_en, rt.name_fr as recipient_type_name_fr,
      e.roman_numeral as edition_roman, e.year as edition_year,
      (
        SELECT json_agg(s.*) 
        FROM category_sponsors cs 
        JOIN sponsors s ON s.id = cs.sponsor_id 
        WHERE cs.category_id = ac.id
      ) as sponsors,
      (
        SELECT json_agg(ts.* ORDER BY ts.position ASC)
        FROM timeline_steps ts
        WHERE ts.category_id = ac.id
      ) as timeline
      FROM award_categories ac
      LEFT JOIN recipient_types rt ON ac.recipient_type_id = rt.id
      LEFT JOIN editions e ON ac.edition_id = e.id
    `;
    const params = [];
    
    if (edition_id) {
      query += ' WHERE ac.edition_id = $1';
      params.push(edition_id);
    }
    
    query += ' ORDER BY ac.display_order ASC';
    
    const result = await db.query(query, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT ac.*, e.roman_numeral as edition_roman, e.year as edition_year 
      FROM award_categories ac 
      LEFT JOIN editions e ON ac.edition_id = e.id 
      WHERE ac.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to fetch category' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { edition_id, code, name_fr, name_en, description_fr, description_en, recipient_type_id, rubric_en, rubric_fr, eligibility, scope, max_winners, prize_amount_fcfa } = req.body;
    
    const result = await db.query(
      `INSERT INTO award_categories 
      (edition_id, code, name_fr, name_en, description_fr, description_en, recipient_type_id, rubric_en, rubric_fr, rubric, eligibility, scope, max_winners, prize_amount_fcfa) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [edition_id, code, name_fr, name_en, description_fr, description_en, recipient_type_id, rubric_en, rubric_fr, JSON.stringify({}), JSON.stringify(eligibility || {}), scope || 'national', max_winners || 1, prize_amount_fcfa || null]
    );
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, name_fr, name_en, max_winners, prize_amount_fcfa, is_flagship, cover_image_url,
      description_en, description_fr, prize_description_en, prize_description_fr,
      rules_en, rules_fr, rubric_en, rubric_fr, sponsor_ids 
    } = req.body; 
    
    const result = await db.query(
      `UPDATE award_categories 
       SET code = COALESCE($1, code),
           name_fr = COALESCE($2, name_fr), 
           name_en = COALESCE($3, name_en), 
           max_winners = COALESCE($4, max_winners),
           prize_amount_fcfa = $5,
           is_flagship = COALESCE($6, is_flagship),
           cover_image_url = $7,
           description_en = COALESCE($8, description_en),
           description_fr = COALESCE($9, description_fr),
           prize_description_en = COALESCE($10, prize_description_en),
           prize_description_fr = COALESCE($11, prize_description_fr),
           rules_en = COALESCE($12, rules_en),
           rules_fr = COALESCE($13, rules_fr),
           rubric_en = COALESCE($14, rubric_en),
           rubric_fr = COALESCE($15, rubric_fr),
           updated_at = NOW()
       WHERE id = $16 RETURNING *`,
      [
        code, name_fr, name_en, max_winners, prize_amount_fcfa, is_flagship, cover_image_url,
        description_en, description_fr, prize_description_en, prize_description_fr,
        rules_en, rules_fr, rubric_en, rubric_fr, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    // Handle sponsors if provided
    if (sponsor_ids && Array.isArray(sponsor_ids)) {
      await db.query('DELETE FROM category_sponsors WHERE category_id = $1', [id]);
      for (const sponsor_id of sponsor_ids) {
        await db.query(
          'INSERT INTO category_sponsors (category_id, sponsor_id) VALUES ($1, $2)',
          [id, sponsor_id]
        );
      }
    }
    
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to update category' });
  }
};
