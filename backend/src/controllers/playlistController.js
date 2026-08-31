const pool = require('../config/db');
async function listarPlaylists(req, res) {
  try {
    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 10;
    const offset = (pagina - 1) * limite;
    const [playlists] = await pool.query(
      'SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.userId, limite, offset],
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM playlists WHERE user_id = ?',
      [req.userId],
    );
    res.json({
      playlists,
      total,
      pagina,
      limite,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao buscar playlists.',
    });
  }
}
async function buscarPlaylist(req, res) {
  try {
    const [linhas] = await pool.query(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId],
    );
    if (linhas.length === 0) {
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    }
    res.json(linhas[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao buscar playlist.',
    });
  }
}
async function criarPlaylist(req, res) {
  try {
    const { nome, descricao, cor_capa, imagem_capa } = req.body;
    if (!nome) {
      return res.status(400).json({
        erro: 'O nome da playlist é obrigatório.',
      });
    }
    const [resultado] = await pool.query(
      'INSERT INTO playlists (user_id, nome, descricao, cor_capa, imagem_capa) VALUES (?, ?, ?, ?, ?)',
      [
        req.userId,
        nome,
        descricao || null,
        cor_capa || '#FF2D87',
        imagem_capa || null,
      ],
    );
    res.status(201).json({
      id: resultado.insertId,
      nome,
      descricao,
      cor_capa,
      imagem_capa,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao criar playlist.',
    });
  }
}
async function atualizarPlaylist(req, res) {
  try {
    const { nome, descricao, cor_capa, imagem_capa } = req.body;
    if (!nome) {
      return res.status(400).json({
        erro: 'O nome da playlist é obrigatório.',
      });
    }
    const [resultado] = await pool.query(
      'UPDATE playlists SET nome = ?, descricao = ?, cor_capa = ?, imagem_capa = ? WHERE id = ? AND user_id = ?',
      [
        nome,
        descricao || null,
        cor_capa || '#FF2D87',
        imagem_capa || null,
        req.params.id,
        req.userId,
      ],
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    }
    res.json({
      id: req.params.id,
      nome,
      descricao,
      cor_capa,
      imagem_capa,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao atualizar playlist.',
    });
  }
}
async function excluirPlaylist(req, res) {
  try {
    const [resultado] = await pool.query(
      'DELETE FROM playlists WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId],
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        erro: 'Playlist não encontrada.',
      });
    }
    res.json({
      mensagem: 'Playlist excluída com sucesso.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao excluir playlist.',
    });
  }
}
module.exports = {
  listarPlaylists,
  buscarPlaylist,
  criarPlaylist,
  atualizarPlaylist,
  excluirPlaylist,
};
