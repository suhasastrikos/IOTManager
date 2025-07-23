import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Database, 
  Layers, 
  Cpu, 
  Package, 
  Smartphone,
  Tag,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { useDatabaseContext } from '../contexts/DatabaseContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isConnected, disconnect } = useDatabaseContext();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Database, current: location.pathname === '/' },
    ...(isConnected ? [
      { name: 'Asset Profiles', href: '/asset-profiles', icon: Layers, current: location.pathname === '/asset-profiles' },
      { name: 'Device Profiles', href: '/device-profiles', icon: Cpu, current: location.pathname === '/device-profiles' },
      { name: 'Assets', href: '/assets', icon: Package, current: location.pathname === '/assets' },
      { name: 'Devices', href: '/devices', icon: Smartphone, current: location.pathname === '/devices' },
      { name: 'Attributes', href: '/attributes', icon: Tag, current: location.pathname === '/attributes' },
      { name: 'Telemetry', href: '/telemetry', icon: Activity, current: location.pathname === '/telemetry' },
    ] : [])
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isConnected={isConnected} disconnect={disconnect} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} isConnected={isConnected} disconnect={disconnect} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, isConnected, disconnect }) => (
  <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <Database className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-semibold text-gray-900">IoT Manager</span>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                item.current
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
    {isConnected && (
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Database Connected</p>
            <button
              onClick={disconnect}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default Layout;