const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { SECRET_KEY } = require('../middleware/auth');

const router = express.Router();

// Register (Default role: user)
router.post('/register', async (req, res) => {
    const { nama, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'admin' ? 'admin' : 'user';
        await db.query(
            'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
            [nama, email, hashedPassword, userRole]
        );
        res.status(201).json({ message: 'Registrasi berhasil!' });
    } catch (err) {
        res.status(500).json({ message: 'Gagal registrasi / email sudah terdaftar', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ message: 'Email tidak ditemukan!' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Password salah!' });

        const token = jwt.sign(
            { id: user.id, nama: user.nama, role: user.role },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil!',
            token,
            user: { id: user.id, nama: user.nama, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: err.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout berhasil. Silakan hapus token di sisi client.' });
});

module.exports = router;