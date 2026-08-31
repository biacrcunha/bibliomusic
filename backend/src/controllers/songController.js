const pool = require('../config/db');
async function verificarPlaylistDoUsuario(playlistId, userId) {
  const [linhas] = await pool.query(
    'SELECT id FROM playlists WHERE id = ? AND user_id = ?',
    [playlistId, userId],
  );
  return linhas.length > 0;
}
async function listarMusicas(req, res) {
  try {
    const { playlistId } = req.params;
    const dono = await verificarPlaylistDoUsuario(playlistId, req.userId);
    if (!dono)
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;
    const [musicas] = await pool.query(
      'SELECT * FROM songs WHERE playlist_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [playlistId, limite, offset],
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM songs WHERE playlist_id = ?',
      [playlistId],
    );
    res.json({
      musicas,
      total,
      pagina,
      limite,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao buscar músicas.',
    });
  }
}
async function buscarMusica(req, res) {
  try {
    const { playlistId, songId } = req.params;
    const dono = await verificarPlaylistDoUsuario(playlistId, req.userId);
    if (!dono)
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    const [linhas] = await pool.query(
      'SELECT * FROM songs WHERE id = ? AND playlist_id = ?',
      [songId, playlistId],
    );
    if (linhas.length === 0)
      return res.status(404).json({
        erro: 'Música não encontrada.',
      });
    res.json(linhas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao buscar música.',
    });
  }
}
async function criarMusica(req, res) {
  try {
    const { playlistId } = req.params;
    const dono = await verificarPlaylistDoUsuario(playlistId, req.userId);
    if (!dono)
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    const { titulo, artista, album, duracao_segundos, genero, ano_lancamento } =
      req.body;
    if (!titulo || !artista) {
      return res.status(400).json({
        erro: 'Título e artista são obrigatórios.',
      });
    }
    const [resultado] = await pool.query(
      `INSERT INTO songs (playlist_id, titulo, artista, album, duracao_segundos, genero, ano_lancamento)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        playlistId,
        titulo,
        artista,
        album || null,
        duracao_segundos || null,
        genero || null,
        ano_lancamento || null,
      ],
    );
    res.status(201).json({
      id: resultado.insertId,
      playlist_id: playlistId,
      titulo,
      artista,
      album,
      duracao_segundos,
      genero,
      ano_lancamento,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao adicionar música.',
    });
  }
}
async function atualizarMusica(req, res) {
  try {
    const { playlistId, songId } = req.params;
    const dono = await verificarPlaylistDoUsuario(playlistId, req.userId);
    if (!dono)
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    const { titulo, artista, album, duracao_segundos, genero, ano_lancamento } =
      req.body;
    if (!titulo || !artista) {
      return res.status(400).json({
        erro: 'Título e artista são obrigatórios.',
      });
    }
    const [resultado] = await pool.query(
      `UPDATE songs SET titulo=?, artista=?, album=?, duracao_segundos=?, genero=?, ano_lancamento=?
       WHERE id = ? AND playlist_id = ?`,
      [
        titulo,
        artista,
        album || null,
        duracao_segundos || null,
        genero || null,
        ano_lancamento || null,
        songId,
        playlistId,
      ],
    );
    if (resultado.affectedRows === 0)
      return res.status(404).json({
        erro: 'Música não encontrada.',
      });
    res.json({
      id: songId,
      playlist_id: playlistId,
      titulo,
      artista,
      album,
      duracao_segundos,
      genero,
      ano_lancamento,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao atualizar música.',
    });
  }
}
async function excluirMusica(req, res) {
  try {
    const { playlistId, songId } = req.params;
    const dono = await verificarPlaylistDoUsuario(playlistId, req.userId);
    if (!dono)
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    const [resultado] = await pool.query(
      'DELETE FROM songs WHERE id = ? AND playlist_id = ?',
      [songId, playlistId],
    );
    if (resultado.affectedRows === 0)
      return res.status(404).json({
        erro: 'Música não encontrada.',
      });
    res.json({
      mensagem: 'Música excluída com sucesso.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao excluir música.',
    });
  }
}
module.exports = {
  listarMusicas,
  buscarMusica,
  criarMusica,
  atualizarMusica,
  excluirMusica,
};
