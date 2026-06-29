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
  const { 
    position, name_en, name_fr, description_en, description_fr, 
    starts_at, ends_at, status, requires_jury, is_unlimited_candidates, max_candidates, selects_winners 
  } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO timeline_steps 
        (category_id, position, name_en, name_fr, description_en, description_fr, starts_at, ends_at, status, requires_jury, is_unlimited_candidates, max_candidates, selects_winners) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
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
        status || 'upcoming',
        requires_jury || false,
        is_unlimited_candidates !== undefined ? is_unlimited_candidates : true,
        max_candidates || null,
        selects_winners || false
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
  const { 
    position, name_en, name_fr, description_en, description_fr, 
    starts_at, ends_at, status, requires_jury, is_unlimited_candidates, max_candidates, selects_winners 
  } = req.body;
  
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
           status = COALESCE($8, status),
           requires_jury = COALESCE($9, requires_jury),
           is_unlimited_candidates = COALESCE($10, is_unlimited_candidates),
           max_candidates = $11,
           selects_winners = COALESCE($12, selects_winners)
       WHERE id = $13 
       RETURNING *`,
      [position, name_en, name_fr, description_en, description_fr, starts_at, ends_at, status, requires_jury, is_unlimited_candidates, max_candidates, selects_winners, stepId]
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

const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.getJuryMembers = async (req, res) => {
  const { stepId } = req.params;
  try {
    const result = await db.query(
      'SELECT id, step_id, email, access_token, has_voted, created_at FROM step_jury_members WHERE step_id = $1 ORDER BY created_at DESC',
      [stepId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching jury members:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch jury members' });
  }
};

exports.addJuryMember = async (req, res) => {
  const { stepId } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: 'error', message: 'Email is required' });

  const token = crypto.randomBytes(32).toString('hex');

  try {
    const result = await db.query(
      `INSERT INTO step_jury_members (step_id, email, access_token) VALUES ($1, $2, $3) RETURNING *`,
      [stepId, email, token]
    );
    
    // Send email using nodemailer
    try {
      const transporterConfig = {
        host: process.env.SMTP_HOST || '127.0.0.1',
        port: process.env.SMTP_PORT || 1025,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        ignoreTLS: process.env.SMTP_SECURE !== 'true',
      };
      
      if (process.env.SMTP_USER && process.env.SMTP_USER.trim() !== '') {
        transporterConfig.auth = {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        };
      }

      const transporter = nodemailer.createTransport(transporterConfig);

      const magicLink = `http://localhost:5173/evaluate?token=${token}`;
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@minesec.cm';
      
      const mailOptions = {
        from: `"MINESEC Awards" <${fromEmail}>`,
        to: email,
        subject: "Jury Invitation: MINESEC Awards Evaluation",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You have been invited as a Jury Member!</h2>
            <p>You have been invited to evaluate candidates for an upcoming step in the MINESEC Awards.</p>
            <p>Click the secure magic link below to access your evaluation portal. No account is required.</p>
            <br>
            <a href="${magicLink}" style="background-color: #cfa85e; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">
              Access Evaluation Portal
            </a>
            <br><br>
            <p>If the button doesn't work, copy and paste this URL into your browser:</p>
            <p><a href="${magicLink}">${magicLink}</a></p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Successfully sent invitation email to ${email}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // We still return success since the token was created, but maybe we could indicate email failure.
    }

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ status: 'error', message: 'User is already invited to this step' });
    }
    console.error('Error adding jury member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to add jury member' });
  }
};

exports.removeJuryMember = async (req, res) => {
  const { juryId } = req.params;
  try {
    await db.query('DELETE FROM step_jury_members WHERE id = $1', [juryId]);
    res.json({ status: 'success', message: 'Jury member removed' });
  } catch (error) {
    console.error('Error removing jury member:', error);
    res.status(500).json({ status: 'error', message: 'Failed to remove jury member' });
  }
};

exports.advanceCandidates = async (req, res) => {
  const { stepId } = req.params;
  try {
    const stepResult = await db.query('SELECT * FROM timeline_steps WHERE id = $1', [stepId]);
    if (stepResult.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Step not found' });
    const step = stepResult.rows[0];

    if (step.selects_winners) {
      // Winner Selection Tally Logic
      const prizesResult = await db.query('SELECT * FROM category_prizes WHERE category_id = $1 ORDER BY position ASC', [step.category_id]);
      const prizes = prizesResult.rows;

      if (prizes.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No prizes configured for this category.' });
      }

      // Get vote counts per candidate per prize
      const votesResult = await db.query(`
        SELECT application_id, prize_id, COUNT(*) as vote_count 
        FROM jury_votes jv
        JOIN step_jury_members sjm ON jv.step_jury_id = sjm.id
        WHERE sjm.step_id = $1
        GROUP BY application_id, prize_id
        ORDER BY vote_count DESC
      `, [stepId]);

      const votes = votesResult.rows;
      const assignedCandidates = new Set();
      const laureates = [];

      for (const prize of prizes) {
        // Find highest voted candidate for this prize who hasn't already won a higher prize
        const candidateVote = votes.find(v => v.prize_id === prize.id && !assignedCandidates.has(v.application_id));
        
        if (candidateVote) {
          assignedCandidates.add(candidateVote.application_id);
          laureates.push({
            application_id: candidateVote.application_id,
            prize_id: prize.id,
            rank: prize.position
          });
        }
      }

      if (laureates.length === 0) {
        return res.status(400).json({ status: 'error', message: 'No valid votes found to determine winners.' });
      }

      await db.query('BEGIN');

      // Fetch edition_id for these applications
      const editionQuery = await db.query('SELECT edition_id FROM applications WHERE category_id = $1 LIMIT 1', [step.category_id]);
      const editionId = editionQuery.rows[0]?.edition_id;

      for (const laureate of laureates) {
        // Update application status
        await db.query(`UPDATE applications SET status = 'laureate' WHERE id = $1`, [laureate.application_id]);
        
        // Insert into laureates
        await db.query(`
          INSERT INTO laureates (application_id, edition_id, category_id, rank)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (application_id) DO UPDATE SET rank = EXCLUDED.rank
        `, [laureate.application_id, editionId, step.category_id, laureate.rank]);
      }

      await db.query('COMMIT');

      return res.json({ 
        status: 'success', 
        message: 'Winners calculated and assigned successfully',
        data: { laureates_count: laureates.length }
      });

    } else {
      // Standard Advancement Logic
      const nextStepResult = await db.query(
        'SELECT id FROM timeline_steps WHERE category_id = $1 AND position > $2 ORDER BY position ASC LIMIT 1',
        [step.category_id, step.position]
      );

      if (nextStepResult.rows.length === 0) {
        return res.status(400).json({ status: 'error', message: 'This is the final step, candidates cannot advance further' });
      }

      const nextStepId = nextStepResult.rows[0].id;

      // Tally votes
      const votesResult = await db.query(`
        SELECT application_id, COUNT(*) as vote_count 
        FROM jury_votes jv
        JOIN step_jury_members sjm ON jv.step_jury_id = sjm.id
        WHERE sjm.step_id = $1
        GROUP BY application_id
        ORDER BY vote_count DESC
      `, [stepId]);

      let applicationsToAdvance = votesResult.rows;

      if (!step.is_unlimited_candidates && step.max_candidates) {
        applicationsToAdvance = applicationsToAdvance.slice(0, step.max_candidates);
      }

      const applicationIds = applicationsToAdvance.map(row => row.application_id);
      
      const allCandidateIds = votesResult.rows.map(row => row.application_id);
      const rejectedIds = allCandidateIds.filter(id => !applicationIds.includes(id));

      await db.query('BEGIN');

      if (applicationIds.length > 0) {
         await db.query(`UPDATE applications SET data = jsonb_set(data, '{current_step_id}', to_jsonb($1::text)) WHERE id = ANY($2)`, [nextStepId, applicationIds]);
      }

      if (rejectedIds.length > 0) {
         await db.query(`UPDATE applications SET status = 'rejected' WHERE id = ANY($1)`, [rejectedIds]);
      }

      await db.query('COMMIT');

      res.json({ 
        status: 'success', 
        message: 'Candidates advanced successfully',
        data: {
          advanced_count: applicationIds.length,
          rejected_count: rejectedIds.length,
          next_step_id: nextStepId,
          advanced_application_ids: applicationIds
        }
      });
    }

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error advancing candidates:', error);
    res.status(500).json({ status: 'error', message: 'Failed to advance candidates' });
  }
};

exports.getStepVotes = async (req, res) => {
  const { stepId } = req.params;
  try {
    const result = await db.query(`
      SELECT 
        a.id as application_id,
        a.reference,
        a.data->'contact'->>'full_name' as candidate_name,
        COUNT(jv.id) as total_votes
      FROM applications a
      JOIN jury_votes jv ON a.id = jv.application_id
      JOIN step_jury_members sjm ON jv.step_jury_id = sjm.id
      WHERE sjm.step_id = $1
      GROUP BY a.id, a.reference, a.data->'contact'->>'full_name'
      ORDER BY total_votes DESC
    `, [stepId]);
    
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching step votes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch step votes' });
  }
};
