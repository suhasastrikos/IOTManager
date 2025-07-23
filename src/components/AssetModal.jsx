import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

const AssetModal = ({ isOpen, onClose, onSubmit, asset, assetProfiles }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    profile_id: '',
    status: 'active',
    attributes: '{}'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        type: asset.type || '',
        profile_id: asset.profile_id || '',
        status: asset.status || 'active',
        attributes: JSON.stringify(asset.attributes || {}, null, 2)
      });
    } else {
      setFormData({
        name: '',
        type: '',
        profile_id: '',
        status: 'active',
        attributes: '{}'
      });
    }
    setErrors({});
  }, [asset, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    }

    if (!formData.profile_id) {
      newErrors.profile_id = 'Asset profile is required';
    }

    try {
      JSON.parse(formData.attributes);
    } catch (e) {
      newErrors.attributes = 'Invalid JSON format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submissionData = {
        ...formData,
        attributes: JSON.parse(formData.attributes)
      };
      onSubmit(submissionData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              {asset ? 'Edit Asset' : 'Create Asset'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter asset name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter asset type (e.g., Building, Vehicle, Equipment)"
              />
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Profile
              </label>
              <select
                name="profile_id"
                value={formData.profile_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.profile_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select an asset profile</option>
                {assetProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
              {errors.profile_id && (
                <p className="mt-1 text-sm text-red-600">{errors.profile_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attributes (JSON)
              </label>
              <textarea
                name="attributes"
                value={formData.attributes}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                  errors.attributes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='{"location": "Building A", "floor": 2}'
              />
              {errors.attributes && (
                <p className="mt-1 text-sm text-red-600">{errors.attributes}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                {asset ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AssetModal;