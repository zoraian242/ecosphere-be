const express = require('express');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET soal quiz untuk User (Tanpa kolom jawaban_benar)
router.get('/play', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d FROM quiz'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST submit jawaban quiz oleh User & hitung skor otomatis
router.post('/submit', verifyToken, async (req, res) => {
    // Format body dari FE: { jawaban: [{ id: 1, pilihan: 'A' }, { id: 2, pilihan: 'C' }] }
    const { jawaban } = req.body;
    try {
        const [soalRows] = await db.query('SELECT id, jawaban_benar FROM quiz');
        let benar = 0;

        soalRows.forEach((soal) => {
            const userJawab = jawaban.find((j) => j.id === soal.id);
            if (userJawab && userJawab.pilihan.toUpperCase() === soal.jawaban_benar) {
                benar++;
            }
        });

        const totalSoal = soalRows.length;
        const skor = totalSoal > 0 ? Math.round((benar / totalSoal) * 100) : 0;

        res.json({ total_soal: totalSoal, jawaban_benar: benar, skor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CRUD SOAL KHUSUS ADMIN ---

// READ semua soal + kunci jawaban
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM quiz ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE soal
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar } = req.body;
    try {
        await db.query(
            'INSERT INTO quiz (pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar) VALUES (?, ?, ?, ?, ?, ?)',
            [pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar.toUpperCase()]
        );
        res.status(201).json({ message: 'Soal quiz berhasil ditambahkan!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE soal
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    const { pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar } = req.body;
    try {
        await db.query(
            'UPDATE quiz SET pertanyaan=?, opsi_a=?, opsi_b=?, opsi_c=?, opsi_d=?, jawaban_benar=? WHERE id=?',
            [pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar.toUpperCase(), req.params.id]
        );
        res.json({ message: 'Soal quiz berhasil diupdate!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE soal
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM quiz WHERE id = ?', [req.params.id]);
        res.json({ message: 'Soal quiz berhasil dihapus!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;