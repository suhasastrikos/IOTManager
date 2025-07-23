import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Upload, AlertCircle } from 'lucide-react';
import { assetService } from '../services/assetService';
import { assetProfileService } from '../services/assetProfileService';
import AssetModal from '../components/AssetModal';
import ImportModal from '../components/ImportModal';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const Assets = () => {
  const { isConnected } = useDatabaseContext();
  const [assets, setAssets] = useState([]);
  const [assetProfiles, setAssetProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchAssets();
      fetchAssetProfiles();
    }
  }, [isConnected]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAll();
      setAssets(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetProfiles = async () => {
    try {
      const profiles = await assetProfileService.getAll();
      setAssetProfiles(profiles);
    } catch (err) {
      console.error('Failed to fetch asset profiles:', err);
    }
  };

  const handleCreate = async (assetData) => {
    try {
      await assetService.create(assetData);
      fetchAssets();
      setIsModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (assetData) => {
    try {
      await assetService.update(editingAsset.id, assetData);
      fetchAssets();
      setIsModalOpen(false);
      setEditingAsset(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetService.delete(id);
        fetchAssets();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleImport = async (data, format) => {
    try {
      await assetService.importAssets(data, format);
      fetchAssets();
      setIsImportModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
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
              setEditingAsset(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
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
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No assets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.profile_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          asset.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
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

      <AssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={editingAsset ? handleUpdate : handleCreate}
        asset={editingAsset}
        assetProfiles={assetProfiles}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        title="Import Assets"
        acceptedFormats={['json', 'csv', 'xml']}
      />
    </div>
  );
};

export default Assets;