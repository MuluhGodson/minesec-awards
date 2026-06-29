const db = require('../db');

exports.getAllCategories = async (req, res) => {
  try {
    const { edition_id } = req.query;
    let query = `
      SELECT ac.*, rt.code as recipient_type_code, rt.name_en as recipient_type_name_en, rt.name_fr as recipient_type_name_fr,
      e.roman_numeral as edition_roman, e.year as edition_year,
      (
        SELECT json_agg(jsonb_build_object(
          'id', s.id, 
          'name', s.name, 
          'logo_storage_key', s.logo_storage_key, 
          'website', s.website, 
          'is_primary', cs.is_primary
        )) 
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
    const { 
      edition_id, code, name_fr, name_en, description_fr, description_en, 
      recipient_type_id, rubric_en, rubric_fr, eligibility, scope, max_winners, prize_amount_fcfa,
      applications_open_at, applications_close_at, is_always_open
    } = req.body;
    
    const result = await db.query(
      `INSERT INTO award_categories 
      (edition_id, code, name_fr, name_en, description_fr, description_en, recipient_type_id, rubric_en, rubric_fr, rubric, eligibility, scope, max_winners, prize_amount_fcfa, applications_open_at, applications_close_at, is_always_open) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [edition_id, code, name_fr, name_en, description_fr, description_en, recipient_type_id, rubric_en, rubric_fr, JSON.stringify({}), JSON.stringify(eligibility || {}), scope || 'national', max_winners || 1, prize_amount_fcfa || null, applications_open_at || null, applications_close_at || null, is_always_open || false]
    );
    
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.congratulateWinners = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const db = require('../db');
    const nodemailer = require('nodemailer');
    
    // Fetch winners for this category
    const winnersRes = await db.query(`
      SELECT 
        a.id,
        a.reference,
        a.data->'contact'->>'email' as email,
        a.data->'contact'->>'full_name' as full_name,
        l.rank,
        ac.name_en as category_name
      FROM laureates l
      JOIN applications a ON l.application_id = a.id
      JOIN award_categories ac ON l.category_id = ac.id
      WHERE l.category_id = $1
    `, [categoryId]);
    
    const winners = winnersRes.rows;
    if (winners.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No winners found for this category.' });
    }
    
    // Setup transporter
    const transporterConfig = {
      host: process.env.SMTP_HOST || '127.0.0.1',
      port: process.env.SMTP_PORT || 1025,
      secure: process.env.SMTP_SECURE === 'true',
      ignoreTLS: process.env.SMTP_SECURE !== 'true',
    };
    if (process.env.SMTP_USER && process.env.SMTP_USER.trim() !== '') {
      transporterConfig.auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
    }
    const transporter = nodemailer.createTransport(transporterConfig);
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@minesec.cm';
    
    // Send emails
    let sentCount = 0;
    for (const winner of winners) {
      if (!winner.email) continue;
      
      const prizeRank = winner.rank === 1 ? '1st Prize' : winner.rank === 2 ? '2nd Prize' : winner.rank === 3 ? '3rd Prize' : `Rank ${winner.rank}`;
      
      try {
        await transporter.sendMail({
          from: `"MINESEC Awards" <${fromEmail}>`,
          to: winner.email,
          subject: `Congratulations! You are a winner in ${winner.category_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Congratulations ${winner.full_name}!</h2>
              <p>We are thrilled to inform you that your application (<strong>${winner.reference}</strong>) has been selected as the <strong>${prizeRank}</strong> winner for the <strong>${winner.category_name}</strong> category!</p>
              <p>Your hard work and dedication have truly stood out. We will be in touch with further details regarding the award ceremony.</p>
              <br>
              <p>Best regards,</p>
              <p><strong>MINESEC Awards Committee</strong></p>
            </div>
          `,
        });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send email to ${winner.email}:`, err);
      }
    }
    
    res.json({ status: 'success', message: `Successfully sent ${sentCount} congratulatory emails.` });
  } catch (err) {
    console.error('Error congratulating winners:', err);
    res.status(500).json({ status: 'error', message: 'Failed to send emails.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      code, name_fr, name_en, max_winners, prize_amount_fcfa, is_flagship, cover_image_url,
      description_en, description_fr, prize_description_en, prize_description_fr,
      rules_en, rules_fr, rubric_en, rubric_fr, sponsor_ids,
      applications_open_at, applications_close_at, is_always_open
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
           applications_open_at = $16,
           applications_close_at = $17,
           is_always_open = COALESCE($18, is_always_open),
           updated_at = NOW()
       WHERE id = $19 RETURNING *`,
      [
        code, name_fr, name_en, max_winners, prize_amount_fcfa, is_flagship, cover_image_url,
        description_en, description_fr, prize_description_en, prize_description_fr,
        rules_en, rules_fr, rubric_en, rubric_fr, 
        applications_open_at || null, applications_close_at || null, is_always_open,
        id
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
