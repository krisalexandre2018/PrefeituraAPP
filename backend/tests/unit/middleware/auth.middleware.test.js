const jwt = require('jsonwebtoken');
const { authMiddleware, isAdmin, isJuridicoOrAdmin } = require('../../../src/middleware/auth.middleware');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('authMiddleware', () => {
    it('deve autenticar com token válido', async () => {
      const token = jwt.sign(
        { userId: '1', userType: 'VEREADOR' },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(req.userId).toBe('1');
      expect(req.userType).toBe('VEREADOR');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve retornar erro se token não for fornecido', async () => {
      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token não fornecido'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro para token inválido', async () => {
      req.headers.authorization = 'Bearer token-invalido';

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve retornar erro para token expirado', async () => {
      const token = jwt.sign(
        { userId: '1', userType: 'VEREADOR' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Token expirado
      );

      req.headers.authorization = `Bearer ${token}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido ou expirado'
      });
    });

    it('deve aceitar token sem Bearer prefix', async () => {
      const token = jwt.sign(
        { userId: '1', userType: 'VEREADOR' },
        process.env.JWT_SECRET
      );

      req.headers.authorization = token;

      await authMiddleware(req, res, next);

      expect(req.userId).toBe('1');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('deve permitir acesso para admin', () => {
      req.userType = 'ADMIN';

      isAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve negar acesso para não-admin', () => {
      req.userType = 'VEREADOR';

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acesso negado. Apenas administradores.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve negar acesso para jurídico', () => {
      req.userType = 'JURIDICO';

      isAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('isJuridicoOrAdmin', () => {
    it('deve permitir acesso para admin', () => {
      req.userType = 'ADMIN';

      isJuridicoOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve permitir acesso para jurídico', () => {
      req.userType = 'JURIDICO';

      isJuridicoOrAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('deve negar acesso para vereador', () => {
      req.userType = 'VEREADOR';

      isJuridicoOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acesso negado. Apenas jurídico ou admin.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('deve negar acesso para tipo indefinido', () => {
      req.userType = undefined;

      isJuridicoOrAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
