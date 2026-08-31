const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
function gerarToken(userId) {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
}
async function register(req, res) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Preencha nome, email e senha.',
      });
    }
    if (senha.length < 6) {
      return res.status(400).json({
        erro: 'A senha precisa ter pelo menos 6 caracteres.',
      });
    }
    const [existentes] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );
    if (existentes.length > 0) {
      return res.status(409).json({
        erro: 'Já existe uma conta com esse email.',
      });
    }
    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash],
    );
    const token = gerarToken(resultado.insertId);
    res.status(201).json({
      token,
      usuario: {
        id: resultado.insertId,
        nome,
        email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao cadastrar usuário.',
    });
  }
}
async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({
        erro: 'Preencha email e senha.',
      });
    }
    const [linhas] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const usuario = linhas[0];
    if (!usuario) {
      return res.status(401).json({
        erro: 'Email ou senha incorretos.',
      });
    }
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        erro: 'Login ou senha incorretos.',
      });
    }
    const token = gerarToken(usuario.id);
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      erro: 'Erro ao fazer login.',
    });
  }
}
module.exports = {
  register,
  login,
};
