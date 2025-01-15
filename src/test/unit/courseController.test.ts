import { courseController } from '../../controllers/courseController';
import { Request, Response } from 'express';
import { pool } from '../../config/database';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

describe('courseController', () => {
  describe('getAll', () => {
    it('devrait retourner tous les cours', async () => {
      const req = {} as Request;
      const res = {
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [
          { id: 1, code: 'CS101', name: 'Introduction à la programmation', credits: 3 },
        ],
      });

      await courseController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([
        { id: 1, code: 'CS101', name: 'Introduction à la programmation', credits: 3 },
      ]);
    });

    it("devrait retourner une erreur si la récupération échoue", async () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('Erreur DB'));

      await courseController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Erreur lors de la récupération des cours' });
    });
  });

  describe('getById', () => {
    it('devrait retourner un cours spécifique par ID', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = {
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1, code: 'CS101', name: 'Introduction à la programmation', credits: 3 }],
      });

      await courseController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        code: 'CS101',
        name: 'Introduction à la programmation',
        credits: 3,
      });
    });

    it("devrait retourner une erreur 404 si le cours n'existe pas", async () => {
      const req = { params: { id: '999' } } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await courseController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cours non trouvé' });
    });
  });
});
