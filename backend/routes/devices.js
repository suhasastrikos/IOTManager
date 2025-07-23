const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Get all devices with profile and asset names
router.get('/', async (req, res) => {
  try {
    const devices = await database.query(`
      SELECT d.*, dp.name as profile_name, a.name as asset_name 
      FROM devices d 
      LEFT JOIN device_profiles dp ON d.profile_id = dp.id 
      LEFT JOIN assets a ON d.asset_id = a.id 
      ORDER BY d.created_at DESC
    `);
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get device by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const devices = await database.query(`
      SELECT d.*, dp.name as profile_name, a.name as asset_name 
      FROM devices d 
      LEFT JOIN device_profiles dp ON d.profile_id = dp.id 
      LEFT JOIN assets a ON d.asset_id = a.id 
      WHERE d.id = ?
    `, [id]);
    
    if (devices.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(devices[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new device
router.post('/', async (req, res) => {
  try {
    const { name, type, profile_id, asset_id, status, attributes } = req.body;
    
    if (!name || !type || !profile_id || !asset_id) {
      return res.status(400).json({ error: 'Name, type, profile_id, and asset_id are required' });
    }

    const result = await database.query(
      'INSERT INTO devices (name, type, profile_id, asset_id, status, attributes) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, profile_id, asset_id, status || 'active', JSON.stringify(attributes || {})]
    );

    const newDevice = await database.query(`
      SELECT d.*, dp.name as profile_name, a.name as asset_name 
      FROM devices d 
      LEFT JOIN device_profiles dp ON d.profile_id = dp.id 
      LEFT JOIN assets a ON d.asset_id = a.id 
      WHERE d.id = ?
    `, [result.insertId]);
    
    res.status(201).json(newDevice[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, profile_id, asset_id, status, attributes } = req.body;
    
    const result = await database.query(
      'UPDATE devices SET name = ?, type = ?, profile_id = ?, asset_id = ?, status = ?, attributes = ? WHERE id = ?',
      [name, type, profile_id, asset_id, status, JSON.stringify(attributes || {}), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const updatedDevice = await database.query(`
      SELECT d.*, dp.name as profile_name, a.name as asset_name 
      FROM devices d 
      LEFT JOIN device_profiles dp ON d.profile_id = dp.id 
      LEFT JOIN assets a ON d.asset_id = a.id 
      WHERE d.id = ?
    `, [id]);
    
    res.json(updatedDevice[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await database.query('DELETE FROM devices WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import devices
router.post('/import', async (req, res) => {
  try {
    const { data, format } = req.body;
    
    let devices = [];
    
    switch (format) {
      case 'json':
        devices = Array.isArray(data) ? data : [data];
        break;
      case 'csv':
        devices = data;
        break;
      case 'xml':
        if (data.devices && data.devices.device) {
          devices = Array.isArray(data.devices.device) ? data.devices.device : [data.devices.device];
        }
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    let imported = 0;
    const errors = [];

    for (const device of devices) {
      try {
        if (device.name && device.type && device.profile_id && device.asset_id) {
          await database.query(
            'INSERT INTO devices (name, type, profile_id, asset_id, status, attributes) VALUES (?, ?, ?, ?, ?, ?)',
            [device.name, device.type, device.profile_id, device.asset_id, device.status || 'active', JSON.stringify(device.attributes || {})]
          );
          imported++;
        }
      } catch (error) {
        errors.push(`Failed to import ${device.name}: ${error.message}`);
      }
    }

    res.json({ 
      imported, 
      total: devices.length, 
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;