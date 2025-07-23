import React, { createContext, useContext, useState } from 'react';
import { databaseService } from '../services/databaseService';

const DatabaseContext = createContext();

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const connectToDatabase = async (config) => {
    setLoading(true);
    try {
      const result = await databaseService.testConnection(config);
      if (result.success) {
        setConnectionConfig(config);
        setIsConnected(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionConfig(null);
  };

  return (
    <DatabaseContext.Provider
      value={{
        isConnected,
        connectionConfig,
        loading,
        connectToDatabase,
        disconnect,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};