const mysql = require('mysql2/promise');
const { Pool } = require('pg');

class DatabaseManager {
  constructor() {
    this.connection = null;
    this.config = null;
  }

  async connect(config) {
    try {
      this.config = config;
      
      if (config.type === 'mysql') {
        this.connection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl || false
        });
      } else if (config.type === 'postgresql') {
        this.connection = new Pool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl || false
        });
      } else {
        throw new Error('Unsupported database type');
      }

      return { success: true };
    } catch (error) {
      console.error('Database connection error:', error);
      return { success: false, error: error.message };
    }
  }

  async testConnection(config) {
    try {
      if (config.type === 'mysql') {
        const testConnection = await mysql.createConnection({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl || false
        });
        await testConnection.ping();
        await testConnection.end();
      } else if (config.type === 'postgresql') {
        const testPool = new Pool({
          host: config.host,
          port: config.port,
          user: config.username,
          password: config.password,
          database: config.database,
          ssl: config.ssl || false
        });
        const client = await testPool.connect();
        await client.query('SELECT 1');
        client.release();
        await testPool.end();
      }

      return { success: true };
    } catch (error) {
      console.error('Database test connection error:', error);
      return { success: false, error: error.message };
    }
  }

  async query(sql, params = []) {
    if (!this.connection) {
      throw new Error('No database connection established');
    }

    try {
      if (this.config.type === 'mysql') {
        const [rows] = await this.connection.execute(sql, params);
        return rows;
      } else if (this.config.type === 'postgresql') {
        const result = await this.connection.query(sql, params);
        return result.rows;
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async initializeSchema() {
    try {
      const tables = [
        // Asset Profiles table
        `CREATE TABLE IF NOT EXISTS asset_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          configuration JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        
        // Device Profiles table
        `CREATE TABLE IF NOT EXISTS device_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          transport_type VARCHAR(50) DEFAULT 'MQTT',
          configuration JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        
        // Assets table
        `CREATE TABLE IF NOT EXISTS assets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          profile_id INT NOT NULL,
          status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
          attributes JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES asset_profiles(id) ON DELETE CASCADE
        )`,
        
        // Devices table
        `CREATE TABLE IF NOT EXISTS devices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          type VARCHAR(100) NOT NULL,
          profile_id INT NOT NULL,
          asset_id INT NOT NULL,
          status ENUM('active', 'inactive', 'error') DEFAULT 'active',
          attributes JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES device_profiles(id) ON DELETE CASCADE,
          FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
        )`
      ];

      if (this.config.type === 'postgresql') {
        // Adjust SQL for PostgreSQL
        tables.forEach((sql, index) => {
          tables[index] = sql
            .replace(/INT AUTO_INCREMENT PRIMARY KEY/g, 'SERIAL PRIMARY KEY')
            .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
            .replace(/ENUM\('([^']+)'(?:,\s*'([^']+)')*\)/g, 'VARCHAR(50)')
            .replace(/JSON/g, 'JSONB');
        });
      }

      for (const sql of tables) {
        await this.query(sql);
      }

      return { success: true };
    } catch (error) {
      console.error('Schema initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  async disconnect() {
    if (this.connection) {
      if (this.config.type === 'mysql') {
        await this.connection.end();
      } else if (this.config.type === 'postgresql') {
        await this.connection.end();
      }
      this.connection = null;
      this.config = null;
    }
  }
}

module.exports = new DatabaseManager();