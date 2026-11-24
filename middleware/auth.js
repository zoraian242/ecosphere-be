const jwt = require('jsonwebtoken');
const SECRET_KEY = 'rahasia_web_sampah_2026';

// Cek apakah user sudah login (punya token valid)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan!' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa!' });
    }
};

// Cek apakah role-nya admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses terlarang! Khusus Admin.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin, SECRET_KEY };