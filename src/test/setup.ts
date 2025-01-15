import { pool } from '../config/database';

jest.mock('../config/database', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
}));

beforeAll(async () => {
  try {
    // Mock de la requête de vérification de connexion
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ result: 1 }] });
    await pool.query('SELECT 1'); // Vérifie la connexion
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
    throw error;
  }
});

beforeEach(async () => {
  await pool.query('TRUNCATE TABLE professors, courses, grades, students RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});