import request from 'supertest';
import { pool } from '../../config/database';
import app from '../../app';

jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
}));

describe('Course Controller - Tests d\'intégration', () => {
  beforeAll(async () => {
    try {
      await pool.query('TRUNCATE TABLE courses RESTART IDENTITY CASCADE');
      await pool.query(`
        INSERT INTO courses (code, name, credits, description)
        VALUES 
          ('CS101', 'Introduction à la programmation', 6, 'Cours de base en programmation'),
          ('CS102', 'Structures de données', 6, 'Cours avancé sur les structures de données');
      `);
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données dans courses :', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await pool.query('TRUNCATE TABLE courses RESTART IDENTITY CASCADE');
      await pool.end();
    } catch (error) {
      console.error('Erreur lors du nettoyage de la base de données :', error);
      throw error;
    }
  });

  test('GET /courses - Récupération de tous les cours', async () => {
    const response = await request(app).get('/courses');
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test('GET /courses/:id - Récupération d\'un cours par ID', async () => {
    const response = await request(app).get('/courses/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('code', 'CS101');
  });

  test('POST /courses - Création d\'un nouveau cours', async () => {
    const newCourse = {
      code: 'CS103',
      name: 'Algorithmes',
      credits: 6,
      description: 'Cours avancé sur les algorithmes',
    };

    const response = await request(app).post('/courses').send(newCourse);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  test('PUT /courses/:id - Mise à jour d\'un cours', async () => {
    const updatedCourse = {
      name: 'Introduction à la programmation (mise à jour)',
      credits: 7,
      description: 'Cours de base en programmation avec mise à jour',
    };

    const response = await request(app).put('/courses/1').send(updatedCourse);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', updatedCourse.name);
  });

  test('DELETE /courses/:id - Suppression d\'un cours', async () => {
    const response = await request(app).delete('/courses/1');
    expect(response.status).toBe(200);

    const checkResponse = await request(app).get('/courses/1');
    expect(checkResponse.status).toBe(404);
  });
});
