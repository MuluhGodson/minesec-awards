const db = require('../db');

exports.getEvaluationData = async (req, res) => {
  const { token } = req.params;
  
  try {
    // 1. Validate Token and check Step Deadline
    const juryResult = await db.query(`
      SELECT sjm.*, ts.category_id, ts.position, ts.name_en, ts.name_fr, ts.ends_at, ts.is_unlimited_candidates, ts.max_candidates, ts.selects_winners, ac.name_en as category_name_en, ac.name_fr as category_name_fr
      FROM step_jury_members sjm
      JOIN timeline_steps ts ON sjm.step_id = ts.id
      JOIN award_categories ac ON ts.category_id = ac.id
      WHERE sjm.access_token = $1
    `, [token]);

    if (juryResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Invalid or expired token' });
    }

    const jurySession = juryResult.rows[0];

    // Check if the deadline for this step has passed
    if (jurySession.ends_at && new Date() > new Date(jurySession.ends_at)) {
      return res.status(403).json({ status: 'error', message: 'The evaluation deadline for this step has passed. Access revoked.' });
    }

    // 2. Fetch candidates currently at this step. 
    // In a real application, you'd check `applications.current_step_id` or similar. 
    // Since we don't have that strict logic yet, we'll fetch all applications for this category for demo purposes.
    // We should ideally fetch applications whose status allows them to be evaluated at this step.
    const applicationsResult = await db.query(`
      SELECT a.id, a.reference, a.data, a.status,
        COALESCE((SELECT json_agg(ad.*) FROM application_documents ad WHERE ad.application_id = a.id), '[]'::json) as documents
      FROM applications a
      WHERE a.category_id = $1
    `, [jurySession.category_id]);

    // 3. Fetch the jury member's current votes
    let currentVotes = [];
    if (jurySession.selects_winners) {
      const votesResult = await db.query('SELECT application_id, prize_id FROM jury_votes WHERE step_jury_id = $1', [jurySession.id]);
      currentVotes = votesResult.rows.map(r => ({ applicationId: r.application_id, prizeId: r.prize_id }));
    } else {
      const votesResult = await db.query('SELECT application_id FROM jury_votes WHERE step_jury_id = $1', [jurySession.id]);
      currentVotes = votesResult.rows.map(r => r.application_id);
    }

    // 4. If step selects winners, fetch available prizes
    let prizes = [];
    if (jurySession.selects_winners) {
      const prizesResult = await db.query('SELECT * FROM category_prizes WHERE category_id = $1 ORDER BY position ASC', [jurySession.category_id]);
      prizes = prizesResult.rows;
    }

    res.json({
      status: 'success',
      data: {
        session: {
          email: jurySession.email,
          has_voted: jurySession.has_voted
        },
        category: {
          id: jurySession.category_id,
          name_en: jurySession.category_name_en,
          name_fr: jurySession.category_name_fr
        },
        step: {
          id: jurySession.step_id,
          position: jurySession.position,
          name_en: jurySession.name_en,
          name_fr: jurySession.name_fr,
          ends_at: jurySession.ends_at,
          is_unlimited_candidates: jurySession.is_unlimited_candidates,
          max_candidates: jurySession.max_candidates,
          selects_winners: jurySession.selects_winners
        },
        candidates: applicationsResult.rows,
        current_votes: currentVotes,
        prizes: prizes
      }
    });

  } catch (error) {
    console.error('Error fetching evaluation data:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch evaluation data' });
  }
};

exports.submitVotes = async (req, res) => {
  const { token } = req.params;
  const { applicationIds } = req.body; // Array of application UUIDs they voted for

  if (!Array.isArray(applicationIds)) {
    return res.status(400).json({ status: 'error', message: 'applicationIds must be an array' });
  }

  try {
    // 1. Validate Token and Deadline
    const juryResult = await db.query(`
      SELECT sjm.*, ts.ends_at, ts.is_unlimited_candidates, ts.max_candidates, ts.selects_winners
      FROM step_jury_members sjm
      JOIN timeline_steps ts ON sjm.step_id = ts.id
      WHERE sjm.access_token = $1
    `, [token]);

    if (juryResult.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Invalid or expired token' });
    const jurySession = juryResult.rows[0];

    if (jurySession.ends_at && new Date() > new Date(jurySession.ends_at)) {
      return res.status(403).json({ status: 'error', message: 'The evaluation deadline for this step has passed. Access revoked.' });
    }

    // 2. Validate vote constraints based on step type
    if (jurySession.selects_winners) {
      // applicationIds here is expected to be an array of objects: { applicationId, prizeId }
      // Check for duplicates
      const usedPrizes = new Set();
      const usedApps = new Set();
      for (const vote of applicationIds) {
        if (!vote.applicationId || !vote.prizeId) {
          return res.status(400).json({ status: 'error', message: 'Votes must include both applicationId and prizeId when selecting winners.' });
        }
        if (usedPrizes.has(vote.prizeId)) return res.status(400).json({ status: 'error', message: 'You cannot assign the same prize to multiple candidates.' });
        if (usedApps.has(vote.applicationId)) return res.status(400).json({ status: 'error', message: 'You cannot assign multiple prizes to the same candidate.' });
        usedPrizes.add(vote.prizeId);
        usedApps.add(vote.applicationId);
      }
    } else {
      if (!jurySession.is_unlimited_candidates && jurySession.max_candidates && applicationIds.length > jurySession.max_candidates) {
        return res.status(400).json({ status: 'error', message: `You can only vote for a maximum of ${jurySession.max_candidates} candidates.` });
      }
    }

    // 3. Process the votes in a transaction
    await db.query('BEGIN');

    // Remove old votes
    await db.query('DELETE FROM jury_votes WHERE step_jury_id = $1', [jurySession.id]);

    // Insert new votes
    if (jurySession.selects_winners) {
      for (const vote of applicationIds) {
        await db.query(
          'INSERT INTO jury_votes (step_jury_id, application_id, prize_id) VALUES ($1, $2, $3)',
          [jurySession.id, vote.applicationId, vote.prizeId]
        );
      }
    } else {
      for (const appId of applicationIds) {
        await db.query(
          'INSERT INTO jury_votes (step_jury_id, application_id) VALUES ($1, $2)',
          [jurySession.id, appId]
        );
      }
    }

    // Mark as voted
    await db.query('UPDATE step_jury_members SET has_voted = true WHERE id = $1', [jurySession.id]);

    await db.query('COMMIT');

    res.json({ status: 'success', message: 'Votes successfully recorded' });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error submitting votes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit votes' });
  }
};
