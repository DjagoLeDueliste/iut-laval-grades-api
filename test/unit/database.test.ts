const { Client } = require('pg');
const assert = require('assert');

const client = new Client({
    user: 'your_username',
    host: 'localhost',
    database: 'your_database',
    password: 'your_password',
    port: 5432,
});

test('Vérifier la connexion PostgreSQL', async () => {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    assert.ok(res.rows.length > 0);
    await client.end();
});