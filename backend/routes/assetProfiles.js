const express = require('express');
const router = express.Router();
const database = require('../config/database');
const Papa = require('papaparse');
const xml2js = require('xml2js');

// Get all asset profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await database.query('SELECT * FROM asset_profiles ORDER BY created_at DESC');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get asset profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profiles = await database.query('SELECT * FROM asset_profiles WHERE id = ?', [id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Asset profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new asset profile
router.post('/', async (req, res) => {
  try {
    const { name, description, configuration } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const result = await database.query(
      'INSERT INTO asset_profiles (name, description, configuration) VALUES (?, ?, ?)',
      [name, description, JSON.stringify(configuration || {})]
    );

    const newProfile = await database.query('SELECT * FROM asset_profiles WHERE id = ?', [result.insertId]);
    res.status(201).json(newProfile[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Asset profile name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update asset profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, configuration } = req.body;
    
    const result = await database.query(
      'UPDATE asset_profiles SET name = ?, description = ?, configuration = ? WHERE id = ?',
      [name, description, JSON.stringify(configuration || {}), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asset profile not found' });
    }

    const updatedProfile = await database.query('SELECT * FROM asset_profiles WHERE id = ?', [id]);
    res.json(updatedProfile[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete asset profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.query('DELETE FROM asset_profiles WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asset profile not found' });
    }
    
    res.json({ message: 'Asset profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import asset profiles
router.post('/import', async (req, res) => {
  try {
    const { data, format } = req.body;
    
    let profiles = [];
    
    switch (format) {
      case 'json':
        profiles = Array.isArray(data) ? data : [data];
        break;
      case 'csv':
        profiles = data;
        break;
      case 'xml':
        // Handle XML data (simplified)
        if (data.profiles && data.profiles.profile) {
          profiles = Array.isArray(data.profiles.profile) ? data.profiles.profile : [data.profiles.profile];
        }
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    let imported = 0;
    const errors = [];

    for (const profile of profiles) {
      try {
        if (profile.name && profile.description) {
          await database.query(
            'INSERT INTO asset_profiles (name, description, configuration) VALUES (?, ?, ?)',
            [profile.name, profile.description, JSON.stringify(profile.configuration || {})]
          );
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import ${profile.name}: ${error.message}`);
      }
    }

    res.json({ 
      imported, 
      total: profiles.length, 
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export asset profiles
router.get('/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const profiles = await database.query('SELECT * FROM asset_profiles');
    
    switch (format) {
      case 'json':
        res.json(profiles);
        break;
      case 'csv':
        const csv = Papa.unparse(profiles);
        res.setHeader('Content-Type', 'text/csv');
        res.send(csv);
        break;
      case 'xml':
        const builder = new xml2js.Builder();
        const xml = builder.buildObject({ profiles: { profile: profiles } });
        res.setHeader('Content-Type', 'application/xml');
        res.send(xml);
        break;
      default:
        res.status(400).json({ error: 'Unsupported format' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;