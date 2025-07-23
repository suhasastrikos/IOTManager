const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Test database connection
router.post('/test-connection', async (req, res) => {
  try {
    const { type, host, port, database: dbName, username, password } = req.body;
    
    if (!type || !host || !port || !dbName || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required connection parameters' 
      });
    }

    const config = { type, host, port, database: dbName, username, password };
    const result = await database.testConnection(config);
    
    if (result.success) {
      // If test is successful, establish the actual connection
      await database.connect(config);
      // Initialize schema
      await database.initializeSchema();
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Initialize database schema
router.post('/initialize-schema', async (req, res) => {
  try {
    const result = await database.initializeSchema();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;