import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider } from './contexts/DatabaseContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AssetProfiles from './pages/AssetProfiles';
import DeviceProfiles from './pages/DeviceProfiles';
import Assets from './pages/Assets';
import Devices from './pages/Devices';
import Attributes from './pages/Attributes';
import Telemetry from './pages/Telemetry';

function App() {
  return (
    <DatabaseProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/asset-profiles" element={<AssetProfiles />} />
            <Route path="/device-profiles" element={<DeviceProfiles />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/attributes" element={<Attributes />} />
            <Route path="/telemetry" element={<Telemetry />} />
          </Routes>
        </Layout>
      </Router>
    </DatabaseProvider>
  );
}

export default App;