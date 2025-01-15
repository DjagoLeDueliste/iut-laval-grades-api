import request from 'supertest';
import { pool } from '../../config/database';
import app from '../../app';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
}));

describe('Auth Controller - Tests d\'intégration', () => {
  beforeAll(async () => {
    try {
      await pool.query('TRUNCATE TABLE professors RESTART IDENTITY CASCADE');
      await pool.query(`
        INSERT INTO professors (email, password_hash, first_name, department)
        VALUES ('test@example.com', '$2a$10$examplehash', 'John', 'Informatique');
      `);
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données dans professors :', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await pool.query('TRUNCATE TABLE professors RESTART IDENTITY CASCADE');
      await pool.end();
    } catch (error) {
      console.error('Erreur lors du nettoyage de la base de données :', error);
      throw error;
    }
  });

  test('POST /auth/login - Connexion réussie', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'examplepassword' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /auth/login - Échec de connexion avec mauvais mot de passe', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  test('POST /auth/login - Échec de connexion avec email inexistant', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'examplepassword' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });
});
