const db = require('../db');

exports.getStats = async (req, res) => {
  try {
    const editionResult = await db.query(`SELECT id, year, roman_numeral, total_budget_fcfa FROM editions WHERE status IN ('draft', 'announced', 'open', 'evaluating') LIMIT 1`);
    const activeEdition = editionResult.rows[0] || { year: '2026', roman_numeral: 'XVII', total_budget_fcfa: null };

    const categoriesResult = await db.query(`SELECT COUNT(*) FROM award_categories`);
    const totalCategories = parseInt(categoriesResult.rows[0].count, 10);

    const laureatesResult = await db.query(`SELECT COUNT(*) FROM laureates`);
    const totalLaureates = parseInt(laureatesResult.rows[0].count, 10);

    const applicationsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' OR status = 'submitted' THEN 1 END) as pending
      FROM applications
    `);
    const totalApplications = parseInt(applicationsResult.rows[0].total, 10);
    const pendingApplications = parseInt(applicationsResult.rows[0].pending, 10);

    res.json({
      status: 'success',
      data: {
        activeEdition,
        totalCategories,
        totalLaureates,
        applications: {
          total: totalApplications,
          pending: pendingApplications
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
  }
};
