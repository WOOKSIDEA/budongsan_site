const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// 매물 전체 조회 (일반 사용자 - 노출 중인 것만)
router.get('/', async (req, res) => {
  try {
    const { type, min, max, search } = req.query;
    let query = `SELECT p.*, array_agg(i.url ORDER BY i.order_index) FILTER (WHERE i.url IS NOT NULL) as images
                 FROM properties p
                 LEFT JOIN images i ON p.id = i.property_id
                 WHERE p.is_active = true`;
    const params = [];
    if (type) { params.push(type); query += ` AND p.property_type = $${params.length}`; }
    if (min)  { params.push(min);  query += ` AND p.price >= $${params.length}`; }
    if (max)  { params.push(max);  query += ` AND p.price <= $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (p.title ILIKE $${params.length} OR p.address ILIKE $${params.length})`; }
    query += ' GROUP BY p.id ORDER BY p.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 매물 전체 조회 (관리자 - 숨김 포함 전체)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, array_agg(i.url ORDER BY i.order_index) FILTER (WHERE i.url IS NOT NULL) as images
       FROM properties p
       LEFT JOIN images i ON p.id = i.property_id
       GROUP BY p.id ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 매물 단건 조회
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, array_agg(i.url ORDER BY i.order_index) FILTER (WHERE i.url IS NOT NULL) as images
       FROM properties p
       LEFT JOIN images i ON p.id = i.property_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '매물 없음' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 매물 등록 (관리자)
router.post('/', auth, async (req, res) => {
  try {
    const { title, price, price_type, property_type, area, rooms, address, description } = req.body;
    const result = await pool.query(
      `INSERT INTO properties (title, price, price_type, property_type, area, rooms, address, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, price, price_type, property_type, area, rooms, address, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 매물 수정 (관리자)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, price, price_type, property_type, area, rooms, address, description, is_active } = req.body;
    const result = await pool.query(
      `UPDATE properties SET title=$1, price=$2, price_type=$3, property_type=$4, area=$5, rooms=$6,
       address=$7, description=$8, is_active=$9 WHERE id=$10 RETURNING *`,
      [title, price, price_type, property_type, area, rooms, address, description, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 매물 삭제 (관리자)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
