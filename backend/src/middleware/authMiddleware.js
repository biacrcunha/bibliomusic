const jwt = require('jsonwebtoken');
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Token não fornecido. Faça login novamente.',
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      erro: 'Sessão expirada ou token inválido. Faça login novamente.',
    });
  }
}
module.exports = authMiddleware;
