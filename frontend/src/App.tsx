import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/error/ErrorBoundary';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AssetList from './pages/Assets/AssetList';
import AssetDetail from './pages/Assets/AssetDetail';
import DigitalTwinView from './pages/DigitalTwin/DigitalTwinView';
import TelemetryView from './pages/Telemetry/TelemetryView';
import CopilotConsole from './pages/Copilot/CopilotConsole';
import Architecture from './pages/Architecture/Architecture';
import DataSources from './pages/DataSources/DataSources';
import Automation from './pages/Automation/Automation';
import IncidentsView from './pages/Incidents/IncidentsView';
import MaintenanceView from './pages/Maintenance/MaintenanceView';
import PredictionsView from './pages/Predictions/PredictionsView';
import SimulationView from './pages/Simulation/SimulationView';
import Security from './pages/Security/Security';
import Settings from './pages/Settings/Settings';
import DiagnosticsView from './pages/Diagnostics/DiagnosticsView';
import IntegrationsView from './pages/Integrations/IntegrationsView';
import LogsView from './pages/Logs/LogsView';
import ReportsView from './pages/Reports/ReportsView';
import AccessCenter from './pages/Access/AccessCenter';

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
              <Route path="/copilot" element={<CopilotConsole />} />
              <Route path="/assets" element={<AssetList />} />
              <Route path="/assets/:id" element={<AssetDetail />} />
              <Route path="/digital-twin" element={<DigitalTwinView />} />
              <Route path="/telemetry" element={<TelemetryView />} />
              <Route path="/alerts" element={<Automation />} />
              <Route path="/incidents" element={<IncidentsView />} />
              <Route path="/maintenance" element={<MaintenanceView />} />
              <Route path="/predictions" element={<PredictionsView />} />
              <Route path="/simulation" element={<SimulationView />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/diagnostics" element={<DiagnosticsView />} />
              <Route path="/integrations" element={<IntegrationsView />} />
              <Route path="/logs" element={<LogsView />} />
              <Route path="/reports" element={<ReportsView />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/data-sources" element={<DataSources />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
