import React, { useState } from 'react';
import { Database, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const Home = () => {
  const { isConnected, connectToDatabase, loading, connectionConfig } = useDatabaseContext();
  const [formData, setFormData] = useState({
    type: 'mysql',
    host: 'localhost',
    port: '3306',
    database: 'iot_manager',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(!isConnected);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await connectToDatabase(formData);
    if (!result.success) {
      setError(result.error);
    } else {
      setShowForm(false);
    }
  };

  if (isConnected && !showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Database Connected Successfully
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Connected to {connectionConfig?.type?.toUpperCase()} database: {connectionConfig?.database}
                </p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900">Asset Profiles</h4>
                <p className="mt-1 text-sm text-blue-700">Manage asset profile templates</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900">Device Profiles</h4>
                <p className="mt-1 text-sm text-green-700">Configure device templates</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-900">Assets</h4>
                <p className="mt-1 text-sm text-purple-700">Manage your assets</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-orange-900">Devices</h4>
                <p className="mt-1 text-sm text-orange-700">Monitor connected devices</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Change Database Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center mb-6">
            <Database className="h-12 w-12 text-blue-600" />
          </div>
          
          <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-2">
            Database Connection
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Connect to your database to start managing IoT devices and assets
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Database Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="mysql">MySQL</option>
                <option value="postgresql">PostgreSQL</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Host</label>
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input
                  type="number"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Database Name</label>
              <input
                type="text"
                name="database"
                value={formData.database}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Connecting...
                </>
              ) : (
                'Connect to Database'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;