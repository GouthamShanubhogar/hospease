import pool from '../config/db.js';

export const listDepartments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT department_id, name as department_name FROM departments ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing departments:', err.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Unable to list departments', 
      error: err.message 
    });
  }
};

export const createDepartment = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Department name is required' 
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING department_id, name as department_name',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating department:', err.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Unable to create department', 
      error: err.message 
    });
  }
};