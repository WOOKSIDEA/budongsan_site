const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

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

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, array_agg(i.url ORDER BY i.order_index) FILTER (WHERE i.url IS NOT NULL) as images
       FROM properties p
       LEFT JOIN images i ON p.id = i.property_id
       WHERE p.id = $1 GROUP BY p.id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '매물 없음' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, price, deposit, monthly_rent, price_type, property_type,
            area, rooms, bathrooms, address, address_detail, description,
            floor, total_floors, parking, move_in_date, building_year } = req.body;
    const result = await pool.query(
      `INSERT INTO properties
        (title, price, deposit, monthly_rent, price_type, property_type,
         area, rooms, bathrooms, address, address_detail, description,
         floor, total_floors, parking, move_in_date, building_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [title, price, deposit, monthly_rent, price_type, property_type,
       area, rooms, bathrooms, address, address_detail, description,
       floor, total_floors, parking, move_in_date, building_year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, price, deposit, monthly_rent, price_type, property_type,
            area, rooms, bathrooms, address, address_detail, description,
            floor, total_floors, parking, move_in_date, building_year, is_active } = req.body;
    const result = await pool.query(
      `UPDATE properties SET
        title=$1, price=$2, deposit=$3, monthly_rent=$4, price_type=$5, property_type=$6,
        area=$7, rooms=$8, bathrooms=$9, address=$10, address_detail=$11, description=$12,
        floor=$13, total_floors=$14, parking=$15, move_in_date=$16, building_year=$17, is_active=$18
       WHERE id=$19 RETURNING *`,
      [title, price, deposit, monthly_rent, price_type, property_type,
       area, rooms, bathrooms, address, address_detail, description,
       floor, total_floors, parking, move_in_date, building_year, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
