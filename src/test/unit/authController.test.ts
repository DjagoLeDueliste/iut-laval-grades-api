import { authController } from '../../controllers/authController';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/database';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('authController', () => {
  describe('login', () => {
    it('devrait retourner un jeton et les informations du professeur si les identifiants sont valides', async () => {
      const req = {
        body: { email: 'test@example.com', password: 'password123' },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            password_hash: 'hashedPassword',
            first_name: 'Jean',
            department: 'Mathématiques',
          },
        ],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValueOnce('fakeToken');

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith({
        token: 'fakeToken',
        professor: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Jean',
          department: 'Mathématiques',
        },
      });
    });

    it("devrait retourner une erreur 401 si l'email est incorrect", async () => {
      const req = { body: { email: 'wrong@example.com', password: 'password123' } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
    });

    it("devrait retourner une erreur 401 si le mot de passe est incorrect", async () => {
      const req = { body: { email: 'test@example.com', password: 'wrongPassword' } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            passwordHash: 'hashedPassword',
          },
        ],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email ou mot de passe incorrect' });
    });
  });
});
