const express = require('express');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Kirim pesan kontak (User / Publik)
router.post('/', async (req, res) => {
    const { nama_pengirim, email_pengirim, pesan } = req.body;
    try {
        await db.query(
            'INSERT INTO kontak (nama_pengirim, email_pengirim, pesan) VALUES (?, ?, ?)',
            [nama_pengirim, email_pengirim, pesan]
        );
        res.status(201).json({ message: 'Pesan berhasil dikirim!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Baca semua pesan masuk (Khusus Admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM kontak ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;