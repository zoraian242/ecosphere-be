const express = require('express');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// READ semua materi/artikel (Bisa diakses User/Beranda)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM materi ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ detail materi by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM materi WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Konten tidak ditemukan' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE materi (Khusus Admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { judul, kategori, konten, gambar } = req.body;
    try {
        await db.query(
            'INSERT INTO materi (judul, kategori, konten, gambar) VALUES (?, ?, ?, ?)',
            [judul, kategori, konten, gambar || null]
        );
        res.status(201).json({ message: 'Konten berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE materi (Khusus Admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { judul, kategori, konten, gambar } = req.body;
    try {
        await db.query(
            'UPDATE materi SET judul = ?, kategori = ?, konten = ?, gambar = ? WHERE id = ?',
            [judul, kategori, konten, gambar || null, req.params.id]
        );
        res.json({ message: 'Konten berhasil diperbarui!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE materi (Khusus Admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM materi WHERE id = ?', [req.params.id]);
        res.json({ message: 'Konten berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;