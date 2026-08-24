import DashboardLayout from '@/layouts/DashboardLayout';
import { Layers, Server, Cpu, Database, Activity, Cloud, Clock } from 'lucide-react';

const Architecture = () => {
  return (
    <DashboardLayout
      title="Architecture & Engineering Blueprint"
      description="Visual comparison between the current implemented prototype and target industrial deployment architecture"
    >
      <div className="space-y-8">
        {/* Notice Header */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-sm flex items-start gap-3">
          <Layers className="text-purple-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-purple-300">Engineering Transparency Principle</h4>
            <p className="mt-1 text-slate-300 text-xs leading-relaxed">
              IRISYN separates the <strong>Currently Implemented Prototype Architecture</strong> (which uses real local laptop host hardware telemetry) from the <strong>Target Industrial Red Hat / OpenShift Architecture</strong>. Target components represent future PLC & cloud integration blueprints.
            </p>
          </div>
        </div>

        {/* 1. CURRENT PROTOTYPE ARCHITECTURE */}
        <div className="card p-6 border-emerald-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-lg font-bold text-slate-100">1. CURRENT PROTOTYPE ARCHITECTURE</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              ✓ IMPLEMENTED & LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
              <Cpu className="text-emerald-400 mb-2" size={28} />
              <h4 className="font-bold text-sm text-slate-100">Host Computer</h4>
              <span className="text-[11px] text-slate-400 mt-1">Real Laptop / Workstation OS</span>
              <span className="mt-3 px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 font-semibold">
                REAL-TIME LOCAL
              </span>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
              <Activity className="text-blue-400 mb-2" size={28} />
              <h4 className="font-bold text-sm text-slate-100">Java OS Collector</h4>
              <span className="text-[11px] text-slate-400 mt-1">OperatingSystemMXBean + OSHI</span>
              <span className="mt-3 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-300 font-semibold">
                1-Sec Telemetry Stream
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
              <Server className="text-purple-400 mb-2" size={28} />
              <h4 className="font-bold text-sm text-slate-100">Quarkus Backend</h4>
              <span className="text-[11px] text-slate-400 mt-1">Digital Twin & Health Engine</span>
              <span className="mt-3 px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 font-semibold">
                JVM REST + WebSockets
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
              <Database className="text-amber-400 mb-2" size={28} />
              <h4 className="font-bold text-sm text-slate-100">PostgreSQL / H2</h4>
              <span className="text-[11px] text-slate-400 mt-1">Time-Series & State Store</span>
              <span className="mt-3 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 font-semibold">
                Flyway Migrations
              </span>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col items-center">
              <Layers className="text-indigo-400 mb-2" size={28} />
              <h4 className="font-bold text-sm text-slate-100">IRISYN Console</h4>
              <span className="text-[11px] text-slate-400 mt-1">React 18 + Recharts UI</span>
              <span className="mt-3 px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 font-semibold">
                DIGITAL TWIN PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* 2. TARGET INDUSTRIAL RED HAT & OPENSHIFT ARCHITECTURE */}
        <div className="card p-6 border-indigo-500/30 bg-slate-900/60">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Cloud className="text-indigo-400" size={22} />
              <h3 className="text-lg font-bold text-slate-100">2. TARGET INDUSTRIAL & RED HAT ARCHITECTURE</h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
              <Clock size={14} />
              TARGET / FUTURE BLUEPRINT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-center text-xs">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex flex-col items-center">
              <span className="font-bold text-slate-200">1. Physical Machines</span>
              <span className="text-[10px] text-slate-400 mt-1">CNC, Motors, Pumps, PLCs</span>
              <span className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">OPC-UA / Modbus</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex flex-col items-center">
              <span className="font-bold text-slate-200">2. Red Hat Device Edge</span>
              <span className="text-[10px] text-slate-400 mt-1">MicroShift / RHEL Edge</span>
              <span className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Edge Gateway</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex flex-col items-center">
              <span className="font-bold text-slate-200">3. Red Hat AMQ</span>
              <span className="text-[10px] text-slate-400 mt-1">Apache Kafka Event Stream</span>
              <span className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Message Bus</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex flex-col items-center">
              <span className="font-bold text-slate-200">4. OpenShift Platform</span>
              <span className="text-[10px] text-slate-400 mt-1">Container Cluster Ops</span>
              <span className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">OpenShift Container</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex flex-col items-center">
              <span className="font-bold text-slate-200">5. OpenShift AI</span>
              <span className="text-[10px] text-slate-400 mt-1">MLOps Anomaly Models</span>
              <span className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">AI / ML Pipeline</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 flex flex-col items-center">
              <span className="font-bold text-slate-200">6. IRISYN Platform</span>
              <span className="text-[10px] text-slate-400 mt-1">Predictive Operations</span>
              <span className="mt-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Enterprise Control</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Architecture;
