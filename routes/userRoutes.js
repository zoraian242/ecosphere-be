const express = require('express');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Lihat daftar user (Khusus Admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nama, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;