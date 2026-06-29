const db = require('../db');
const nodemailer = require('nodemailer');

// Function to generate a random reference
const generateReference = (editionYear, categoryCode) => {
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CMR-${editionYear}-${categoryCode}-${randStr}`;
};

exports.submitPublicApplication = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      full_name, email, phone, dob, matricule, sex, justification,
      region, division, sub_division, school
    } = req.body;

    // Fetch category and edition info
    const catResult = await db.query(
      'SELECT ac.code, ac.name_en, e.id as edition_id, e.year FROM award_categories ac JOIN editions e ON ac.edition_id = e.id WHERE ac.id = $1',
      [categoryId]
    );

    if (catResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    const category = catResult.rows[0];
    const reference = generateReference(category.year, category.code);

    const applicationData = {
      contact: { full_name, email, phone, dob, matricule, sex },
      location: { region, division, sub_division, school },
      justification
    };

    // Insert Application
    const appResult = await db.query(
      `INSERT INTO applications (reference, edition_id, category_id, status, data, submitted_at)
       VALUES ($1, $2, $3, 'submitted', $4, NOW()) RETURNING id`,
      [reference, category.edition_id, categoryId, JSON.stringify(applicationData)]
    );

    const applicationId = appResult.rows[0].id;

    // Handle File Uploads
    if (req.files && req.files.length > 0) {
      const fs = require('fs');
      const path = require('path');
      const storageProvider = process.env.STORAGE_PROVIDER || 'local';

      if (storageProvider === 'local') {
        const baseUploadsDir = path.join(__dirname, '../uploads');
        // We use category code and reference for folder structure
        // Clean them just in case
        const safeCatCode = category.code.replace(/[^a-z0-9]/gi, '_');
        const safeRef = reference.replace(/[^a-z0-9-]/gi, '_');
        
        const targetDirRelative = path.join(safeCatCode, safeRef);
        const targetDirPath = path.join(baseUploadsDir, targetDirRelative);
        
        if (!fs.existsSync(targetDirPath)) {
          fs.mkdirSync(targetDirPath, { recursive: true });
        }

        for (const file of req.files) {
          const finalRelativePath = path.join(targetDirRelative, file.filename);
          const finalAbsolutePath = path.join(baseUploadsDir, finalRelativePath);

          // Move file from temporary multer location to new folder
          fs.renameSync(file.path, finalAbsolutePath);

          const kind = file.originalname.startsWith('COVER_PHOTO_') ? 'photo' : 'other';

          await db.query(
            `INSERT INTO application_documents (application_id, kind, label, filename, storage_key, size_bytes, mime_type, checksum_sha256)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'no-checksum')`,
            [applicationId, kind, file.originalname, file.originalname, finalRelativePath, file.size, file.mimetype]
          );
        }
      } else if (storageProvider === 's3') {
        console.log('S3 Storage Provider configured - moving files to bucket (Mock implementation)');
        for (const file of req.files) {
          const s3MockUrl = `https://s3.amazonaws.com/minesec-awards/${category.code}/${reference}/${file.filename}`;
          const kind = file.originalname.startsWith('COVER_PHOTO_') ? 'photo' : 'other';
          await db.query(
            `INSERT INTO application_documents (application_id, kind, label, filename, storage_key, size_bytes, mime_type, checksum_sha256)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'no-checksum')`,
            [applicationId, kind, file.originalname, file.originalname, s3MockUrl, file.size, file.mimetype]
          );
        }
      }
    }

    // Send confirmation email
    try {
      const transporterConfig = {
        host: process.env.SMTP_HOST || '127.0.0.1',
        port: process.env.SMTP_PORT || 1025,
        secure: process.env.SMTP_SECURE === 'true',
        ignoreTLS: process.env.SMTP_SECURE !== 'true',
      };
      
      if (process.env.SMTP_USER && process.env.SMTP_USER.trim() !== '') {
        transporterConfig.auth = {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        };
      }

      const transporter = nodemailer.createTransport(transporterConfig);
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@minesec.cm';
      
      const mailOptions = {
        from: `"MINESEC Awards" <${fromEmail}>`,
        to: email,
        subject: `Application Received - ${category.name_en}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Dear ${full_name},</h2>
            <p>Thank you for submitting your application for the <strong>${category.name_en}</strong> category.</p>
            <p>Your application has been successfully received. Please keep the following tracking number for your records:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-family: monospace; font-size: 24px; letter-spacing: 2px; margin: 20px 0;">
              ${reference}
            </div>
            <p>We will review your application and keep you updated on its status.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>MINESEC Awards Committee</strong></p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Successfully sent confirmation email to ${email}`);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(201).json({ status: 'success', data: { reference, id: applicationId } });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.getCategoryApplications = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await db.query(
      `SELECT a.*, 
        (SELECT json_agg(ad.*) FROM application_documents ad WHERE ad.application_id = a.id) as documents,
        (SELECT json_agg(l.*) FROM laureates l WHERE l.application_id = a.id) as laureates
       FROM applications a
       WHERE a.category_id = $1
       ORDER BY a.created_at DESC`,
      [categoryId]
    );
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.shortlistApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    // We don't have authenticated admin ID from req.user right now in prototype if auth is disabled, but we would use it here.
    // For now we'll set it to NULL or a static admin ID if needed, but let's just leave shortlisted_by NULL for prototype if not available.
    
    const result = await db.query(
      `UPDATE applications 
       SET status = 'finalist', shortlisted_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }
    
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error shortlisting application:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.selectWinner = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { prizeId } = req.body;

    const appResult = await db.query('SELECT * FROM applications WHERE id = $1', [applicationId]);
    if (appResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }
    const app = appResult.rows[0];

    const prizeResult = await db.query('SELECT * FROM category_prizes WHERE id = $1', [prizeId]);
    if (prizeResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Prize not found' });
    }
    const prize = prizeResult.rows[0];

    // Update application
    await db.query(`UPDATE applications SET status = 'laureate' WHERE id = $1`, [applicationId]);

    // Insert into laureates
    const laureateResult = await db.query(
      `INSERT INTO laureates (application_id, edition_id, category_id, rank, prize_amount_fcfa, announced_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [applicationId, app.edition_id, app.category_id, prize.position, prize.amount_fcfa]
    );

    res.json({ status: 'success', data: laureateResult.rows[0] });
  } catch (err) {
    console.error('Error selecting winner:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.revokeShortlist = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const result = await db.query(
      `UPDATE applications 
       SET status = 'submitted', shortlisted_at = NULL 
       WHERE id = $1 RETURNING *`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }
    
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error revoking shortlist:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.revokeWinner = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Remove from laureates table
    await db.query('DELETE FROM laureates WHERE application_id = $1', [applicationId]);

    // Revert status to finalist
    const result = await db.query(
      `UPDATE applications SET status = 'finalist' WHERE id = $1 RETURNING *`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }

    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error revoking winner:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.getRecentLaureates = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        l.id as laureate_id,
        l.rank,
        a.reference,
        a.data as application_data,
        e.year,
        ac.name_en as category_name_en,
        ac.name_fr as category_name_fr,
        ac.code as category_code,
        (SELECT storage_key FROM application_documents d WHERE d.application_id = a.id AND d.kind = 'photo' LIMIT 1) as photo_url
      FROM laureates l
      JOIN applications a ON l.application_id = a.id
      JOIN editions e ON l.edition_id = e.id
      JOIN award_categories ac ON l.category_id = ac.id
      WHERE l.public_profile = TRUE
      ORDER BY l.created_at DESC
      LIMIT 6
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching recent laureates:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};

exports.getLaureatesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const result = await db.query(`
      SELECT 
        l.id as laureate_id,
        l.rank,
        a.reference,
        a.data as application_data,
        e.year,
        ac.name_en as category_name_en,
        ac.name_fr as category_name_fr,
        ac.code as category_code,
        cp.name_en as prize_name_en,
        cp.name_fr as prize_name_fr,
        (SELECT storage_key FROM application_documents d WHERE d.application_id = a.id AND d.kind = 'photo' LIMIT 1) as photo_url
      FROM laureates l
      JOIN applications a ON l.application_id = a.id
      JOIN editions e ON l.edition_id = e.id
      JOIN award_categories ac ON l.category_id = ac.id
      LEFT JOIN category_prizes cp ON l.category_id = cp.category_id AND l.rank = cp.position
      WHERE l.category_id = $1 AND l.public_profile = TRUE
      ORDER BY l.rank ASC
    `, [categoryId]);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching laureates by category:', err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
};
