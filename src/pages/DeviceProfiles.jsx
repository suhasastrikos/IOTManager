import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, AlertCircle } from 'lucide-react';
import { deviceProfileService } from '../services/deviceProfileService';
import DeviceProfileModal from '../components/DeviceProfileModal';
import ImportModal from '../components/ImportModal';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const DeviceProfiles = () => {
  const { isConnected } = useDatabaseContext();
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchDeviceProfiles();
    }
  }, [isConnected]);

  const fetchDeviceProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await deviceProfileService.getAll();
      setDeviceProfiles(profiles);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (profileData) => {
    try {
      await deviceProfileService.create(profileData);
      fetchDeviceProfiles();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (profileData) => {
    try {
      await deviceProfileService.update(editingProfile.id, profileData);
      fetchDeviceProfiles();
      setIsModalOpen(false);
      setEditingProfile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device profile?')) {
      try {
        await deviceProfileService.delete(id);
        fetchDeviceProfiles();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleImport = async (data, format) => {
    try {
      await deviceProfileService.importProfiles(data, format);
      fetchDeviceProfiles();
      setIsImportModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredProfiles = deviceProfiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Database Connection</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect to a database first from the home page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Device Profiles</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button
            onClick={() => {
              setEditingProfile(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Profile
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search device profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading device profiles...</p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No device profiles found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {profile.transport_type || 'DEFAULT'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingProfile(profile);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(profile.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DeviceProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        onSubmit={editingProfile ? handleUpdate : handleCreate}
        profile={editingProfile}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Import Device Profiles"
        acceptedFormats={['json', 'csv', 'xml']}
      />
    </div>
  );
};

export default DeviceProfiles;