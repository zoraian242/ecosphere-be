const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const materiRoutes = require('./routes/materiRoutes');
const quizRoutes = require('./routes/quizRoutes');
const kontakRoutes = require('./routes/kontakRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routing Utama
app.use('/api/auth', authRoutes);
app.use('/api/materi', materiRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/kontak', kontakRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'API Edukasi Sampah berjalan lancar!' });
});

app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});