import { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Cpu,
  Radio,
  Layers,
  Bot,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  getIndustrialAdapters,
  getLivePlcTags,
  triggerOpenShiftInference,
  IndustrialAdapter,
  PlcTag,
  AiInferenceResult
} from '@/services/industrial.service';

const IndustrialView = () => {
  const [adapters, setAdapters] = useState<IndustrialAdapter[]>([]);
  const [plcTags, setPlcTags] = useState<PlcTag[]>([]);
  const [promptInput, setPromptInput] = useState('Analyze MOTOR-001 temperature Z-score deviation');
  const [inferenceResult, setInferenceResult] = useState<AiInferenceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adp, tags] = await Promise.all([
        getIndustrialAdapters(),
        getLivePlcTags(),
      ]);
      setAdapters(adp);
      setPlcTags(tags);
    } catch (e) {
      console.warn('Failed to load industrial edge data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunInference = async () => {
    setLoading(true);
    try {
      const res = await triggerOpenShiftInference(promptInput);
      setInferenceResult(res);
    } catch (e) {
      console.warn('Inference error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="IRISYN Industrial Edge & OpenShift AI Gateway"
      description="MQTT v5.0 • OPC-UA Binary Gateway • Modbus TCP • Red Hat Edge • OpenShift AI KServe vLLM"
    >
      <div className="space-y-6 font-sans">
        {/* Header Protocol Adapters Grid */}
        <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Cpu size={16} className="text-purple-400" />
              INDUSTRIAL PROTOCOL ADAPTERS & EDGE GATEWAYS (PHASE 8)
            </h4>
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>[ Refresh Gateway Status ]</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {adapters.map((adp) => (
              <div key={adp.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-100 font-mono text-[11px] truncate">{adp.name}</strong>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ● {adp.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1 font-mono">
                  <div>Protocol: <strong className="text-purple-300">{adp.protocol}</strong></div>
                  <div className="truncate">Endpoint: <strong className="text-cyan-300">{adp.endpoint}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Industrial PLC Tags & OpenShift AI Inference Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Industrial PLC Tag Monitor */}
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Radio size={16} className="text-cyan-400" />
                LIVE OPC-UA & MODBUS PLC TAG MONITOR
              </h4>
              <span className="text-[10px] text-emerald-400">Quality: GOOD (0x00)</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {plcTags.map((tag) => (
                <div key={tag.nodeId} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-100 block">{tag.asset} — {tag.metric}</strong>
                    <span className="text-[10px] text-purple-300 font-mono">{tag.nodeId}</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-cyan-300 font-bold text-sm block">{tag.value}</strong>
                    <span className="text-[9px] text-emerald-400 font-mono">{tag.quality}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Red Hat OpenShift AI Model Inference Sandbox */}
          <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Bot size={16} className="text-purple-400" />
                RED HAT OPENSHIFT AI vLLM MODEL SERVING SANDBOX
              </h4>
              <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                NVIDIA A100 GPU
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Industrial AI Prompt Input:</label>
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono"
                />
              </div>

              <button
                onClick={handleRunInference}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>{loading ? 'Executing vLLM Inference...' : 'Run OpenShift AI Model Inference'}</span>
              </button>

              {/* Inference Result Box */}
              {inferenceResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 uppercase text-[10px]">MODEL: {inferenceResult.model}</span>
                    <span className="text-cyan-300 font-bold">{inferenceResult.inferenceLatencyMs} ms</span>
                  </div>
                  <p className="text-slate-200 font-sans text-xs">{inferenceResult.prediction}</p>
                  <div className="pt-2 border-t border-slate-900 text-amber-300 font-bold text-[11px]">
                    Recommendation: {inferenceResult.recommendedAction}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Industrial Edge Hardware Topology Map */}
        <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono text-xs">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-emerald-400" />
            END-TO-END INDUSTRIAL EDGE TOPOLOGY ARCHITECTURE
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">FIELD SENSORS</span>
              <strong className="text-cyan-300 block text-xs">Vibration / Temp</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">PROTOCOL ADAPTERS</span>
              <strong className="text-purple-300 block text-xs">MQTT / OPC-UA / Modbus</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">EDGE GATEWAY</span>
              <strong className="text-emerald-400 block text-xs">RHEL 9.3 Edge Node</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">AI MODEL SERVING</span>
              <strong className="text-purple-300 block text-xs">OpenShift AI KServe</strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[10px]">DIGITAL TWIN</span>
              <strong className="text-cyan-300 block text-xs">IRISYN Platform</strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IndustrialView;
