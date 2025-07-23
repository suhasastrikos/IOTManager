const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get all assets with profile names
router.get('/', async (req, res) => {
  try {
    const assets = await database.query(`
      SELECT a.*, ap.name as profile_name 
      FROM assets a 
      LEFT JOIN asset_profiles ap ON a.profile_id = ap.id 
      ORDER BY a.created_at DESC
    `);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assets = await database.query(`
      SELECT a.*, ap.name as profile_name 
      FROM assets a 
      LEFT JOIN asset_profiles ap ON a.profile_id = ap.id 
      WHERE a.id = ?
    `, [id]);
    
    if (assets.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json(assets[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new asset
router.post('/', async (req, res) => {
  try {
    const { name, type, profile_id, status, attributes } = req.body;
    
    if (!name || !type || !profile_id) {
      return res.status(400).json({ error: 'Name, type, and profile_id are required' });
    }

    const result = await database.query(
      'INSERT INTO assets (name, type, profile_id, status, attributes) VALUES (?, ?, ?, ?, ?)',
      [name, type, profile_id, status || 'active', JSON.stringify(attributes || {})]
    );

    const newAsset = await database.query(`
      SELECT a.*, ap.name as profile_name 
      FROM assets a 
      LEFT JOIN asset_profiles ap ON a.profile_id = ap.id 
      WHERE a.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newAsset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update asset
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, profile_id, status, attributes } = req.body;
    
    const result = await database.query(
      'UPDATE assets SET name = ?, type = ?, profile_id = ?, status = ?, attributes = ? WHERE id = ?',
      [name, type, profile_id, status, JSON.stringify(attributes || {}), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const updatedAsset = await database.query(`
      SELECT a.*, ap.name as profile_name 
      FROM assets a 
      LEFT JOIN asset_profiles ap ON a.profile_id = ap.id 
      WHERE a.id = ?
    `, [id]);
    
    res.json(updatedAsset[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.query('DELETE FROM assets WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import assets
router.post('/import', async (req, res) => {
  try {
    const { data, format } = req.body;
    
    let assets = [];
    
    switch (format) {
      case 'json':
        assets = Array.isArray(data) ? data : [data];
        break;
      case 'csv':
        assets = data;
        break;
      case 'xml':
        if (data.assets && data.assets.asset) {
          assets = Array.isArray(data.assets.asset) ? data.assets.asset : [data.assets.asset];
        }
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    let imported = 0;
    const errors = [];

    for (const asset of assets) {
      try {
        if (asset.name && asset.type && asset.profile_id) {
          await database.query(
            'INSERT INTO assets (name, type, profile_id, status, attributes) VALUES (?, ?, ?, ?, ?)',
            [asset.name, asset.type, asset.profile_id, asset.status || 'active', JSON.stringify(asset.attributes || {})]
          );
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import ${asset.name}: ${error.message}`);
      }
    }

    res.json({ 
      imported, 
      total: assets.length, 
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;