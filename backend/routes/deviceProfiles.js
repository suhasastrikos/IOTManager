const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get all device profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await database.query('SELECT * FROM device_profiles ORDER BY created_at DESC');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get device profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const profiles = await database.query('SELECT * FROM device_profiles WHERE id = ?', [id]);
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Device profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new device profile
router.post('/', async (req, res) => {
  try {
    const { name, description, transport_type, configuration } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const result = await database.query(
      'INSERT INTO device_profiles (name, description, transport_type, configuration) VALUES (?, ?, ?, ?)',
      [name, description, transport_type || 'MQTT', JSON.stringify(configuration || {})]
    );

    const newProfile = await database.query('SELECT * FROM device_profiles WHERE id = ?', [result.insertId]);
    res.status(201).json(newProfile[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Device profile name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update device profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, transport_type, configuration } = req.body;
    
    const result = await database.query(
      'UPDATE device_profiles SET name = ?, description = ?, transport_type = ?, configuration = ? WHERE id = ?',
      [name, description, transport_type, JSON.stringify(configuration || {}), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device profile not found' });
    }

    const updatedProfile = await database.query('SELECT * FROM device_profiles WHERE id = ?', [id]);
    res.json(updatedProfile[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete device profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.query('DELETE FROM device_profiles WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device profile not found' });
    }
    
    res.json({ message: 'Device profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import device profiles
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
            'INSERT INTO device_profiles (name, description, transport_type, configuration) VALUES (?, ?, ?, ?)',
            [profile.name, profile.description, profile.transport_type || 'MQTT', JSON.stringify(profile.configuration || {})]
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

module.exports = router;