import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AssetList from './pages/Assets/AssetList';
import AssetDetail from './pages/Assets/AssetDetail';
import CopilotConsole from './pages/Copilot/CopilotConsole';
import Architecture from './pages/Architecture/Architecture';
import DataSources from './pages/DataSources/DataSources';
import Servers from './pages/Servers/Servers';
import Infrastructure from './pages/Infrastructure/Infrastructure';
import VirtualMachines from './pages/VirtualMachines/VirtualMachines';
import Containers from './pages/Containers/Containers';
import AIInsights from './pages/AIInsights/AIInsights';
import Automation from './pages/Automation/Automation';
import Security from './pages/Security/Security';
import Cluster from './pages/Cluster/Cluster';
import Settings from './pages/Settings/Settings';
import AccessCenter from './pages/Access/AccessCenter';
import ServicesDirectory from './pages/Services/ServicesDirectory';

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/access-center" element={<AccessCenter />} />
              <Route path="/services" element={<ServicesDirectory />} />
              <Route path="/copilot" element={<CopilotConsole />} />
              <Route path="/assets" element={<AssetList />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              <Route path="/telemetry" element={<AssetList />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="/servers" element={<Servers />} />
              <Route path="/infrastructure" element={<Infrastructure />} />
              <Route path="/virtual-machines" element={<VirtualMachines />} />
              <Route path="/containers" element={<Containers />} />
              <Route path="/ai-insights" element={<AIInsights />} />
              <Route path="/maintenance" element={<AIInsights />} />
              <Route path="/analytics" element={<AIInsights />} />
              <Route path="/alerts" element={<Automation />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/security" element={<Security />} />
              <Route path="/cluster" element={<Cluster />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
