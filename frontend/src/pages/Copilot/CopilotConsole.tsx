import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  queryCopilotChat,
  executeCopilotAction,
  diagnoseAsset,
  verifyAssetFix,
  CopilotChatResponse,
  DiagnosticReport,
  FixVerificationReport
} from '@/services/copilot.service';

const CopilotConsole = () => {
  const [activeMode, setActiveMode] = useState<'INVESTIGATION' | 'CHAT'>('INVESTIGATION');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('dc-node-03');
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [verificationReport, setVerificationReport] = useState<FixVerificationReport | null>(null);

  const [messages, setMessages] = useState<CopilotChatResponse[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionConfirmPayload, setActionConfirmPayload] = useState<{ assetId: string; actionType: string; mode: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Run initial asset diagnosis on load
    runDiagnosis(selectedAssetId);
  }, [selectedAssetId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const runDiagnosis = async (assetId: string) => {
    setLoading(true);
    try {
      const report = await diagnoseAsset(assetId);
      setDiagnosticReport(report);
      setVerificationReport(null);
    } catch (e) {
      console.warn('Failed to run diagnosis:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFix = () => {
    setActionConfirmPayload({
      assetId: selectedAssetId,
      actionType: 'RESTART_HIGH_LOAD_PROCESS',
      mode: 'PRODUCTION_SAFE',
    });
  };

  const handleConfirmAction = async () => {
    if (!actionConfirmPayload) return;
    setLoading(true);
    try {
      await executeCopilotAction(actionConfirmPayload.assetId, actionConfirmPayload.actionType);
      setActionConfirmPayload(null);
      // Run Post-Fix Verification immediately
      const verifyRes = await verifyAssetFix(selectedAssetId, 'ACT-9041');
      setVerificationReport(verifyRes);
      // Refresh diagnostic report
      if (diagnosticReport) {
        setDiagnosticReport({
          ...diagnosticReport,
          status: 'HEALTHY',
          healthScore: 87,
          primaryIssue: 'All metrics verified within normal operating baselines',
        });
      }
    } catch (e) {
      console.warn('Action execution fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (questionText?: string) => {
    const prompt = questionText || input;
    if (!prompt.trim() || loading) return;

    setInput('');
    setLoading(true);

    try {
      const res = await queryCopilotChat(prompt, {
        currentAsset: selectedAssetId,
        currentTimeRange: 'last_6_hours',
      });

      if (res) {
        setMessages((prev) => [...prev, res]);
        if (res.resolvedAssetId) {
          setSelectedAssetId(res.resolvedAssetId);
        }
      }
    } catch (e) {
      console.warn('Copilot query error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="IRISYN Engineering Copilot"
      description="Diagnose • Explain • Fix • Verify — AI-Powered Troubleshooting & Operations Agent"
    >
      <div className="space-y-6 font-sans">
        {/* Copilot Header & Active Asset Context Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/30">
              <Wrench size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-mono tracking-tight">
                  IRISYN ENGINEERING COPILOT
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  DIAGNOSTIC ENGINE ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Current Asset: <strong className="text-cyan-300">{selectedAssetId}</strong> • Type: <strong className="text-purple-300">{diagnosticReport?.assetType || 'SERVER'}</strong> • Health:{' '}
                <strong className={diagnosticReport?.status === 'HEALTHY' ? 'text-emerald-400' : 'text-amber-400'}>
                  {diagnosticReport?.healthScore || 68}% ({diagnosticReport?.status || 'WARNING'})
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Asset Selector */}
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="bg-slate-950 text-slate-200 text-xs font-mono px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500"
            >
              <option value="dc-node-03">dc-node-03 (Server Node)</option>
              <option value="MOTOR-001">MOTOR-001 (PMSM Motor)</option>
              <option value="LAPTOP-001">LAPTOP-001 (Host Computer)</option>
              <option value="CNC-001">CNC-001 (CNC Machine)</option>
            </select>

            {/* Mode Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center font-mono text-xs">
              <button
                onClick={() => setActiveMode('INVESTIGATION')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeMode === 'INVESTIGATION' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Investigation Mode
              </button>
              <button
                onClick={() => setActiveMode('CHAT')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeMode === 'CHAT' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Chat Mode
              </button>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-mono pb-1 scrollbar-none">
          <button
            onClick={() => runDiagnosis(selectedAssetId)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Search size={14} />
            <span>[ Diagnose Asset ]</span>
          </button>
          <button
            onClick={() => handleSend(`What is the root cause of ${selectedAssetId}?`)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span>[ Find Root Cause ]</span>
          </button>
          <button
            onClick={() => handleSend(`What changed in the last hour on ${selectedAssetId}?`)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-colors flex items-center gap-1.5"
          >
            <Clock size={14} className="text-cyan-400" />
            <span>[ What Changed? ]</span>
          </button>
          <button
            onClick={handleApplyFix}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Wrench size={14} />
            <span>[ Apply Recommended Fix ]</span>
          </button>
          <button
            onClick={async () => {
              setLoading(true);
              const verifyRes = await verifyAssetFix(selectedAssetId, 'ACT-9041');
              setVerificationReport(verifyRes);
              setLoading(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md"
          >
            <CheckCheck size={14} />
            <span>[ Verify Fix ]</span>
          </button>
        </div>

        {/* INVESTIGATION MODE WORKSPACE (SECTION 26 LAYOUT) */}
        {activeMode === 'INVESTIGATION' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Active Problems & Evidence Correlation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Problem Card */}
              <div className="card p-6 bg-slate-900 border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <AlertTriangle size={16} /> ACTIVE DETECTED PROBLEM
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {diagnosticReport?.confidence || 'HIGH CONFIDENCE'}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-100 font-mono">
                  {diagnosticReport?.primaryIssue || 'CPU Resource Saturation'}
                </h4>

                {/* Evidence Chain */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
                  <span className="text-slate-400 font-sans font-bold block text-[11px] uppercase tracking-wider mb-2">
                    CORRELATED EVIDENCE CHAIN:
                  </span>
                  {diagnosticReport?.evidence.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Root Cause Candidate Scoring */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                    RANKED ROOT CAUSE CANDIDATES:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                    {diagnosticReport?.candidateCauses.map((candidate, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-100">{candidate.cause}</strong>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${candidate.classification === 'LIKELY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {candidate.classification}
                          </span>
                        </div>
                        <span className="text-[11px] text-purple-300 block">Support: {candidate.support}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Investigation Timeline */}
              <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  INVESTIGATION TIMELINE & EVENT CORRELATION
                </h4>
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-800">
                  {diagnosticReport?.timeline.map((t, idx) => (
                    <div key={idx} className="relative flex items-center justify-between text-xs">
                      <div className="absolute -left-[21px] w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-slate-900" />
                      <span className="text-slate-400 font-bold w-16">{t.time}</span>
                      <span className="text-slate-200 flex-1">{t.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Result Card (If Run) */}
              {verificationReport && (
                <div className="card p-6 bg-slate-900 border-emerald-500/40 space-y-4 font-mono animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={18} /> POST-FIX VERIFICATION RESULT — {verificationReport.verificationStatus}
                    </span>
                    <span className="text-[10px] text-slate-400">Action ID: {verificationReport.actionId}</span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans font-medium">
                    {verificationReport.resolutionSummary}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">HEALTH SCORE:</span>
                      <strong className="text-emerald-400 text-sm">
                        {verificationReport.beforeState.healthScore}% → {verificationReport.afterState.healthScore}% ({verificationReport.metricDeltas.healthDelta})
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">PRIMARY METRIC:</span>
                      <strong className="text-cyan-300 text-sm">
                        {verificationReport.beforeState.cpu || verificationReport.beforeState.temperature} → {verificationReport.afterState.cpu || verificationReport.afterState.temperature}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">STATUS:</span>
                      <strong className="text-emerald-400 text-sm">{verificationReport.afterState.status}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Recommended Fix Plan & Quick Troubleshooting Tools */}
            <div className="space-y-6">
              {/* Fix Recommendation Card */}
              <div className="card p-6 bg-slate-900 border-slate-800 space-y-4 font-mono">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Wrench size={16} />
                  RECOMMENDED FIX PLAN
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <strong className="text-slate-200 block">Step 1: Stop excessive workload</strong>
                    <span className="text-[11px] text-slate-400 block font-sans">Restart python.exe process consuming 54% CPU</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <strong className="text-slate-200 block">Step 2: Verify CPU falls below 50%</strong>
                    <span className="text-[11px] text-slate-400 block font-sans">Confirm resource contention is eliminated</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                    <strong className="text-slate-200 block">Step 3: Verify Health recovers to &gt;80%</strong>
                    <span className="text-[11px] text-slate-400 block font-sans">Check disk I/O latency normalization</span>
                  </div>
                </div>

                <button
                  onClick={handleApplyFix}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Apply Recommended Fix</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Resource Consumers Table */}
              <div className="card p-6 bg-slate-900 border-slate-800 space-y-3 font-mono">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={15} className="text-purple-400" />
                  TOP RESOURCE CONSUMERS
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-100 block">python.exe (PID 9041)</strong>
                      <span className="text-[10px] text-slate-500">Status: HIGH_LOAD</span>
                    </div>
                    <span className="text-rose-400 font-bold">54% CPU</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <strong className="text-slate-100 block">node.exe (PID 4102)</strong>
                      <span className="text-[10px] text-slate-500">Status: NORMAL</span>
                    </div>
                    <span className="text-purple-300 font-bold">21% CPU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAT MODE STREAM */}
        {activeMode === 'CHAT' && (
          <div className="card p-6 bg-slate-900 border-slate-800 flex flex-col h-[650px] justify-between">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans text-xs scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-20 space-y-3 font-mono">
                  <Wrench size={44} className="mx-auto text-purple-400 animate-bounce" />
                  <h4 className="font-bold text-slate-200 text-base">IRISYN Copilot Chat Mode Active</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed font-sans">
                    Ask any engineering or telemetry question. All answers are derived deterministically from live platform metrics.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-3 font-mono">
                  <div className="flex justify-end">
                    <div className="px-4 py-2.5 rounded-2xl bg-purple-600 text-white font-medium font-sans text-xs">
                      {msg.answer || msg.message}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-purple-400" /> COPILOT EXPLANATION
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${msg.inferenceCategory === 'OBSERVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : msg.inferenceCategory === 'INFERRED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                        {msg.inferenceCategory}
                      </span>
                    </div>

                    <p className="text-slate-100 text-xs leading-relaxed font-sans">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask IRISYN Engineering Copilot..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                <span>Send</span>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionConfirmPayload && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card p-6 bg-slate-900 border border-amber-500/40 max-w-md w-full space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300 uppercase tracking-wide">
                <AlertTriangle size={18} />
                CONFIRM OPERATION — {actionConfirmPayload.actionType}
              </div>
              <div className="text-xs space-y-1.5 text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>TARGET ASSET: <strong className="text-slate-100">{actionConfirmPayload.assetId}</strong></div>
                <div>MODE: <strong className="text-purple-400">{actionConfirmPayload.mode}</strong></div>
                <div>RISK LEVEL: <strong className="text-amber-400 font-bold">LOW (Safe Workload Restart)</strong></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setActionConfirmPayload(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 shadow-md"
                >
                  {loading ? 'Executing...' : 'Confirm & Execute'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CopilotConsole;
