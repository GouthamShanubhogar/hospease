import pool from '../config/db.js';

export const listHospitals = async (req, res) => {
  try {
  const result = await pool.query('SELECT * FROM hospitals ORDER BY name');
  // Return array to match frontend expectations (res.data should be an array)
  res.json(result.rows);
  } catch (err) {
    console.error('Error listing hospitals:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to list hospitals', error: err.message });
  }
};

export const createHospital = async (req, res) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ status: 'error', message: 'Hospital name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO hospitals (name, address) VALUES ($1, $2) RETURNING *',
      [name, address || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating hospital:', err.message);
    res.status(500).json({ status: 'error', message: 'Unable to create hospital', error: err.message });
  }
};

export default {
  listHospitals,
  createHospital,
};
