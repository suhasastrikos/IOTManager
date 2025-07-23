import React from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const Telemetry = () => {
  const { isConnected } = useDatabaseContext();

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
        <h1 className="text-2xl font-semibold text-gray-900">Telemetry</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center py-12">
          <Activity className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Real-time Telemetry</h3>
          <p className="mt-1 text-sm text-gray-500">
            This page will display real-time telemetry data from your connected devices with charts and metrics.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Feature coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Telemetry;