const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// 문의 등록
router.post('/', async (req, res) => {
  try {
    const { property_id, name, phone, message } = req.body;
    const result = await pool.query(
      `INSERT INTO inquiries (property_id, name, phone, message)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [property_id, name, phone, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 문의 전체 조회 (관리자)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, p.title as property_title
       FROM inquiries i
       LEFT JOIN properties p ON i.property_id = p.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
