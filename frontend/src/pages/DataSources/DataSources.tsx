import { useState, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CopilotDrawer from '@/components/copilot/CopilotDrawer';
import {
  CheckCircle2,
  Layers,
  Bot,
  Radio,
  RadioTower,
  FileCode,
  Sliders,
  Search,
  ExternalLink,
} from 'lucide-react';

export type ConnectorStatus = 'CONNECTED' | 'NOT CONFIGURED' | 'ERROR' | 'TARGET / FUTURE';
export type ConnectorCategory = 'AGENT / HOST' | 'INDUSTRIAL' | 'NETWORK' | 'SIMULATION' | 'FUTURE INTEGRATION';

export interface DataConnectorItem {
  id: string;
  name: string;
  protocol: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  ratePerSec: string;
  freshness: string;
  targetAsset: string;
  endpoint: string;
  description: string;
  supportedMethods: string[];
  schemaExample: string;
}

export const MOCK_CONNECTORS: DataConnectorItem[] = [
  {
    id: 'conn-local-agent',
    name: 'Local Host System Agent',
    protocol: 'Local Host Agent / Java MXBean',
    category: 'AGENT / HOST',
    status: 'CONNECTED',
    ratePerSec: '1,420 msgs/s',
    freshness: '0.8 sec',
    targetAsset: 'LAPTOP-001 (Host Workstation)',
    endpoint: 'local://mxbean/system-hardware',
    description: 'Direct OS hardware telemetry collector ingesting CPU, RAM, Disk, Temp and Network throughput.',
    supportedMethods: ['connect()', 'disconnect()', 'health()', 'discover()', 'read()'],
    schemaExample: '{\n  "cpu": 28.4,\n  "ramUsedGb": 7.8,\n  "tempC": 44.0,\n  "netMbps": 1.2\n}',
  },
  {
    id: 'conn-rest-api',
    name: 'IRISYN REST Telemetry Adapter',
    protocol: 'REST / HTTP/2',
    category: 'NETWORK',
    status: 'CONNECTED',
    ratePerSec: '450 msgs/s',
    freshness: '1.2 sec',
    targetAsset: 'IRISYN System Platform API',
    endpoint: 'https://api.irisyn.internal/v1/telemetry',
    description: 'RESTful telemetry ingest endpoint for batched operational payload upload.',
    supportedMethods: ['connect()', 'health()', 'read()'],
    schemaExample: '{\n  "assetId": "LAPTOP-001",\n  "status": "HEALTHY",\n  "timestamp": "2026-08-22T14:22:00Z"\n}',
  },
  {
    id: 'conn-websocket',
    name: 'Real-Time WebSocket Ingest Stream',
    protocol: 'WebSocket (ws:// / wss://)',
    category: 'NETWORK',
    status: 'CONNECTED',
    ratePerSec: '2,800 msgs/s',
    freshness: '0.2 sec',
    targetAsset: 'Live Telemetry Dashboard Stream',
    endpoint: 'wss://stream.irisyn.internal/ws/live',
    description: 'Low-latency bi-directional WebSocket stream carrying live telemetry and state changes.',
    supportedMethods: ['connect()', 'disconnect()', 'health()', 'read()'],
    schemaExample: '{\n  "event": "TELEMETRY_FRAME",\n  "seq": 44164020,\n  "payload": { "cpu": 28 }\n}',
  },
  {
    id: 'conn-opc-ua',
    name: 'Industrial OPC-UA Edge Connector',
    protocol: 'OPC-UA (opc.tcp://)',
    category: 'INDUSTRIAL',
    status: 'CONNECTED',
    ratePerSec: '950 msgs/s',
    freshness: '0.8 sec',
    targetAsset: 'Industrial Edge Proxy (dc-node-06)',
    endpoint: 'opc.tcp://10.244.1.100:4840/UA/EdgeServer',
    description: 'Industrial automation protocol connector decoding PLC node tags and sensor structures.',
    supportedMethods: ['connect()', 'disconnect()', 'health()', 'discover()', 'read()'],
    schemaExample: '{\n  "nodeId": "ns=2;s=Motor.Vibration",\n  "value": 0.8,\n  "quality": "GOOD"\n}',
  },
  {
    id: 'conn-mqtt',
    name: 'Edge MQTT Telemetry Broker',
    protocol: 'MQTT v5.0',
    category: 'INDUSTRIAL',
    status: 'CONNECTED',
    ratePerSec: '1,850 msgs/s',
    freshness: '0.5 sec',
    targetAsset: 'Industrial Edge Connector Pod',
    endpoint: 'mqtt://broker.irisyn.internal:1883/telemetry/#',
    description: 'Publish-subscribe telemetry ingestion broker for IoT and factory floor devices.',
    supportedMethods: ['connect()', 'disconnect()', 'health()', 'read()'],
    schemaExample: '{\n  "topic": "factory/rack-a/node-01/telemetry",\n  "payload": { "temp": 38.5 }\n}',
  },
  {
    id: 'conn-sim-engine',
    name: 'Physics Simulation Core Engine',
    protocol: 'Physics Simulation Core',
    category: 'SIMULATION',
    status: 'CONNECTED',
    ratePerSec: '1,000 msgs/s',
    freshness: '1.0 sec',
    targetAsset: 'MOTOR-001 & PUMP-001 (Simulated Twins)',
    endpoint: 'sim://core/physics-generator',
    description: 'Correlated physical model simulator generating synthetic telemetry under operational load.',
    supportedMethods: ['connect()', 'disconnect()', 'health()', 'read()'],
    schemaExample: '{\n  "rpm": 1750,\n  "temp": 44.0,\n  "currentAmps": 14.2,\n  "vibration": 0.8\n}',
  },
  {
    id: 'conn-modbus',
    name: 'Modbus TCP Fieldbus Connector',
    protocol: 'Modbus TCP (Port 502)',
    category: 'INDUSTRIAL',
    status: 'NOT CONFIGURED',
    ratePerSec: '0 msgs/s',
    freshness: 'N/A',
    targetAsset: 'Factory Floor PLCs (Planned)',
    endpoint: 'modbus://192.168.1.50:502/holding-registers',
    description: 'Industrial fieldbus connector reading coil and holding register values from legacy hardware.',
    supportedMethods: ['connect()', 'health()', 'read()'],
    schemaExample: '{\n  "register": 40001,\n  "value": 1750\n}',
  },
  {
    id: 'conn-snmp',
    name: 'SNMP Infrastructure Switch Connector',
    protocol: 'SNMP v3',
    category: 'NETWORK',
    status: 'NOT CONFIGURED',
    ratePerSec: '0 msgs/s',
    freshness: 'N/A',
    targetAsset: 'Rack A & B Network Switches',
    endpoint: 'snmp://10.0.0.1:161/mib-2',
    description: 'Network management connector polling interface packet counters, errors, and link status.',
    supportedMethods: ['connect()', 'health()', 'read()'],
    schemaExample: '{\n  "oid": "1.3.6.1.2.1.2.2.1.10.1",\n  "octetsIn": 1420958\n}',
  },
  {
    id: 'conn-file-replay',
    name: 'Historical CSV / Telemetry File Replay',
    protocol: 'File Replay / CSV / Parquet',
    category: 'SIMULATION',
    status: 'NOT CONFIGURED',
    ratePerSec: '0 msgs/s',
    freshness: 'N/A',
    targetAsset: 'Batch Replay Workload',
    endpoint: 'file://storage/telemetry_replay.csv',
    description: 'Ingest historic telemetry datasets for offline Digital Twin training and scenario replay.',
    supportedMethods: ['connect()', 'read()'],
    schemaExample: 'timestamp,asset_id,cpu,ram,temp\n2026-08-22T10:00:00Z,LAPTOP-001,24.2,48.5,44.0',
  },
  {
    id: 'conn-can-bus',
    name: 'CAN Bus Vehicle / Machine Connector',
    protocol: 'SocketCAN / J1939',
    category: 'FUTURE INTEGRATION',
    status: 'TARGET / FUTURE',
    ratePerSec: '0 msgs/s',
    freshness: 'N/A',
    targetAsset: 'Heavy Industrial Equipment / Vehicles',
    endpoint: 'can://can0/j1939',
    description: 'Controller Area Network adapter for mobile machinery, engine ECUs, and heavy equipment.',
    supportedMethods: ['health()'],
    schemaExample: '{\n  "canId": "0x0CF00400",\n  "engineRpm": 2100\n}',
  },
  {
    id: 'conn-ble',
    name: 'BLE Wireless Environmental Sensor Hub',
    protocol: 'Bluetooth Low Energy (GATT)',
    category: 'FUTURE INTEGRATION',
    status: 'TARGET / FUTURE',
    ratePerSec: '0 msgs/s',
    freshness: 'N/A',
    targetAsset: 'Wireless Sensor Network Nodes',
    endpoint: 'ble://gateway-01/gatt-service',
    description: 'Wireless sensor hub connector reading battery-powered thermal and acoustic sensors.',
    supportedMethods: ['health()'],
    schemaExample: '{\n  "mac": "AA:BB:CC:DD:EE:FF",\n  "ambientTempC": 24.5\n}',
  },
  {
    id: 'conn-tsdb-historian',
    name: 'Enterprise Historian Database Connector',
    protocol: 'TimescaleDB / InfluxDB / OSIsoft PI',
    category: 'FUTURE INTEGRATION',
    status: 'TARGET / FUTURE',
    ratePerSec: '0 msgs/s',
    freshness: 'N/A',
    targetAsset: 'Enterprise Historian Cluster',
    endpoint: 'tsdb://historian.enterprise.internal:5432/timescale',
    description: 'High-throughput enterprise time-series database connector for historical sync.',
    supportedMethods: ['health()'],
    schemaExample: '{\n  "db": "timescale",\n  "query": "SELECT * FROM metrics"\n}',
  },
];

const DataSources = () => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeConnectorModal, setActiveConnectorModal] = useState<DataConnectorItem | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const filteredConnectors = useMemo(() => {
    return MOCK_CONNECTORS.filter((c: DataConnectorItem) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetAsset.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;
      const matchesCategory = selectedCategoryFilter === 'ALL' || c.category === selectedCategoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, selectedStatusFilter, selectedCategoryFilter]);

  const connectedCount = MOCK_CONNECTORS.filter((c: DataConnectorItem) => c.status === 'CONNECTED').length;
  const notConfiguredCount = MOCK_CONNECTORS.filter((c: DataConnectorItem) => c.status === 'NOT CONFIGURED').length;
  const targetCount = MOCK_CONNECTORS.filter((c: DataConnectorItem) => c.status === 'TARGET / FUTURE').length;

  return (
    <DashboardLayout
      title="Data Sources & Connectors Engine"
      description="Universal Digital Twin Ingestion, Edge Adapters and Protocol Normalization Platform"
    >
      <div className="space-y-6 font-sans">
        
        {/* Core Product Principle Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-[#0D121A] to-[#0D121A] border border-purple-500/30 space-y-2 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono font-bold text-sm text-purple-300">
              <RadioTower size={18} className="text-cyan-400 animate-pulse" />
              UNIVERSAL DIGITAL TWIN INGESTION ENGINE
            </div>
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-1 transition-all"
            >
              <Bot size={14} /> Open Copilot
            </button>
          </div>
          <p className="text-xs text-slate-300 max-w-4xl font-sans">
            IRISYN ingests live operational telemetry from any machine, host, PLC or IoT sensor via edge protocol decoders, normalizing raw signals into a unified real-time Digital Twin state.
          </p>
        </div>

        {/* Universal Canonical Data Flow Pipeline Diagram */}
        <div className="p-5 rounded-2xl bg-[#0D121A] border border-[#1E2936] space-y-3 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" /> CANONICAL INGESTION & DIGITAL TWIN FLOW PIPELINE
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 font-mono text-[10px]">
            <div className="p-2.5 rounded-xl bg-[#111923] border border-purple-500/30 text-center space-y-1">
              <span className="text-purple-400 font-bold block">1. DEVICE</span>
              <p className="text-slate-300 text-[9px] font-sans">Host / Machine / PLC</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111923] border border-cyan-500/30 text-center space-y-1">
              <span className="text-cyan-400 font-bold block">2. ADAPTER</span>
              <p className="text-slate-300 text-[9px] font-sans">Connector / Protocol</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111923] border border-blue-500/30 text-center space-y-1">
              <span className="text-blue-400 font-bold block">3. DECODER</span>
              <p className="text-slate-300 text-[9px] font-sans">Payload Parsing</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111923] border border-emerald-500/30 text-center space-y-1">
              <span className="text-emerald-400 font-bold block">4. NORMALIZER</span>
              <p className="text-slate-300 text-[9px] font-sans">Bounds & Quality</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111923] border border-amber-500/30 text-center space-y-1">
              <span className="text-amber-400 font-bold block">5. TSDB STORE</span>
              <p className="text-slate-300 text-[9px] font-sans">Time-Series History</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111923] border border-indigo-500/30 text-center space-y-1">
              <span className="text-indigo-400 font-bold block">6. TWIN ENGINE</span>
              <p className="text-slate-300 text-[9px] font-sans">Live State Engine</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#111923] border border-purple-500/40 text-center space-y-1">
              <span className="text-purple-300 font-bold block">7. COPILOT / UI</span>
              <p className="text-slate-300 text-[9px] font-sans">Action & Verification</p>
            </div>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">TOTAL CONNECTORS</p>
              <h3 className="text-2xl font-mono font-black text-slate-100 mt-1">{MOCK_CONNECTORS.length}</h3>
              <span className="text-[10px] font-mono text-slate-500">12 Protocols Supported</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Radio size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">ACTIVE CONNECTED</p>
              <h3 className="text-2xl font-mono font-black text-emerald-400 mt-1">{connectedCount}</h3>
              <span className="text-[10px] font-mono text-emerald-400">Stream Freshness &lt; 1s</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">NOT CONFIGURED</p>
              <h3 className="text-2xl font-mono font-black text-amber-400 mt-1">{notConfiguredCount}</h3>
              <span className="text-[10px] font-mono text-slate-500">Ready for Setup</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders size={20} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">TARGET / FUTURE</p>
              <h3 className="text-2xl font-mono font-black text-slate-400 mt-1">{targetCount}</h3>
              <span className="text-[10px] font-mono text-slate-500">Architecture Blueprint</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20">
              <FileCode size={20} />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 rounded-2xl bg-[#0D121A] border border-[#1E2936] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search size={15} className="text-purple-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Connector by Protocol or Asset..."
              className="w-full bg-[#111923] border border-[#1E2936] rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
              <span className="text-slate-400 text-[11px]">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-bold text-xs"
              >
                <option value="ALL" className="bg-[#111923]">All</option>
                <option value="CONNECTED" className="bg-[#111923]">Connected</option>
                <option value="NOT CONFIGURED" className="bg-[#111923]">Not Configured</option>
                <option value="TARGET / FUTURE" className="bg-[#111923]">Target / Future</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#111923] px-2.5 py-1.5 rounded-xl border border-[#1E2936]">
              <span className="text-slate-400 text-[11px]">Category:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-bold text-xs"
              >
                <option value="ALL" className="bg-[#111923]">All</option>
                <option value="AGENT / HOST" className="bg-[#111923]">Agent / Host</option>
                <option value="INDUSTRIAL" className="bg-[#111923]">Industrial</option>
                <option value="NETWORK" className="bg-[#111923]">Network</option>
                <option value="SIMULATION" className="bg-[#111923]">Simulation</option>
                <option value="FUTURE INTEGRATION" className="bg-[#111923]">Future Integration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connectors Matrix Grid / Table */}
        <div className="bg-[#0D121A] border border-[#1E2936] rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-[#111923] border-b border-[#1E2936] text-slate-400 text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-4">CONNECTOR NAME</th>
                  <th className="py-3 px-4">PROTOCOL</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">INGESTION RATE</th>
                  <th className="py-3 px-4">FRESHNESS</th>
                  <th className="py-3 px-4">TARGET ASSET</th>
                  <th className="py-3 px-4 text-right">INSPECT / METHOD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2936]/60">
                {filteredConnectors.map((c: DataConnectorItem) => {
                  const isConnected = c.status === 'CONNECTED';
                  const isNotConfigured = c.status === 'NOT CONFIGURED';

                  let statusBadge = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
                  if (isConnected) statusBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                  else if (isNotConfigured) statusBadge = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setActiveConnectorModal(c)}
                      className="hover:bg-[#16212e] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Radio size={16} className={isConnected ? 'text-cyan-400' : 'text-slate-500'} />
                          <div>
                            <span className="font-bold text-slate-100 group-hover:text-purple-300 block leading-none">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-1">{c.category}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-purple-300 font-bold">
                        {c.protocol}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border inline-flex items-center gap-1 ${statusBadge}`}>
                          ● {c.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-200">
                        {c.ratePerSec}
                      </td>

                      <td className="py-3.5 px-4 text-cyan-400 font-bold">
                        {c.freshness}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-sans text-xs">
                        {c.targetAsset}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConnectorModal(c);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-purple-600/20 hover:bg-purple-600 text-purple-300 border border-purple-500/30 hover:border-purple-500 transition-all flex items-center gap-1 ml-auto"
                        >
                          Inspect <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CONNECTOR INSPECTOR MODAL */}
      {activeConnectorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D121A] border border-[#1E2936] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E2936] pb-3 font-mono">
              <div className="flex items-center gap-2">
                <Radio size={20} className="text-purple-400" />
                <h3 className="font-bold text-slate-100 text-base">{activeConnectorModal.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  activeConnectorModal.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  ● {activeConnectorModal.status}
                </span>
              </div>
              <button
                onClick={() => setActiveConnectorModal(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                [CLOSE]
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-1">
                <span className="text-slate-500 text-[10px] block">Protocol Description & Endpoint</span>
                <p className="text-slate-200 font-sans">{activeConnectorModal.description}</p>
                <code className="text-purple-300 block text-[11px] pt-1">{activeConnectorModal.endpoint}</code>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block">Supported Interface Methods</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeConnectorModal.supportedMethods.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936]">
                  <span className="text-slate-500 text-[10px] block">Target Machine / Asset</span>
                  <strong className="text-slate-100 font-sans block mt-1">{activeConnectorModal.targetAsset}</strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111923] border border-[#1E2936] space-y-1">
                <span className="text-slate-500 text-[10px] block">Normalized Digital Twin Payload Schema</span>
                <pre className="text-cyan-300 bg-[#090D16] p-2.5 rounded-lg border border-[#1E2936] overflow-x-auto text-[11px]">
                  {activeConnectorModal.schemaExample}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1E2936] font-mono text-xs">
              <button
                onClick={() => setActiveConnectorModal(null)}
                className="px-4 py-2 rounded-xl bg-[#111923] hover:bg-slate-800 text-slate-300 border border-[#1E2936]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Copilot Drawer */}
      <CopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </DashboardLayout>
  );
};

export default DataSources;
