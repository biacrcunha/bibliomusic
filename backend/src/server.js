require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const songRoutes = require('./routes/songRoutes');
const app = express();
app.use(cors());
app.use(
  express.json({
    limit: '5mb',
  }),
);
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    autora: 'Beatriz Ceciliato Robaskievicz da Cunha',
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/playlists/:playlistId/songs', songRoutes);
app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada.',
  });
});
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    erro: 'Erro interno do servidor.',
  });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
