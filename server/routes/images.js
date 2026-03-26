const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const pool = require('../db');
const auth = require('../middleware/auth');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'momRS',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 이미지 업로드 (관리자)
router.post('/:propertyId', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { propertyId } = req.params;
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: '파일이 없습니다.' });

    const inserted = [];
    for (let i = 0; i < files.length; i++) {
      const result = await pool.query(
        'INSERT INTO images (property_id, url, order_index) VALUES ($1, $2, $3) RETURNING *',
        [propertyId, files[i].path, i]
      );
      inserted.push(result.rows[0]);
    }
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 이미지 삭제 (관리자)
router.delete('/:imageId', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT url FROM images WHERE id=$1', [req.params.imageId]);
    if (result.rows.length === 0) return res.status(404).json({ error: '이미지 없음' });

    const url = result.rows[0].url;
    const publicId = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
    await pool.query('DELETE FROM images WHERE id=$1', [req.params.imageId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 매물별 이미지 조회
router.get('/:propertyId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM images WHERE property_id=$1 ORDER BY order_index',
      [req.params.propertyId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
