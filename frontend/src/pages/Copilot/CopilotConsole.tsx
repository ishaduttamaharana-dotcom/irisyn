import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Bot, Send, Sparkles, AlertTriangle, Database, RefreshCw, Activity } from 'lucide-react';
import { queryCopilot, executeCopilotAction, getCopilotStatus, CopilotResponse, CopilotStatus } from '@/services/copilot.service';

const CopilotConsole = () => {
  const [messages, setMessages] = useState<CopilotResponse[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<CopilotStatus | null>(null);
  const [actionConfirmPayload, setActionConfirmPayload] = useState<any | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCopilotStatus().then(setStatus).catch(() => null);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (questionText?: string) => {
    const prompt = questionText || input;
    if (!prompt.trim() || loading) return;

    setInput('');
    setLoading(true);

    try {
      const res = await queryCopilot({
        question: prompt,
        pageContext: 'CopilotConsole',
      });
      setMessages((prev) => [...prev, res]);

      if (res.requiresActionConfirmation && res.actionPayload) {
        setActionConfirmPayload(res.actionPayload);
      }
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionConfirmPayload) return;
    setLoading(true);
    try {
      const result = await executeCopilotAction(
        actionConfirmPayload.action,
        actionConfirmPayload.target,
        actionConfirmPayload.scenario
      );

      setMessages((prev) => [
        ...prev,
        {
          question: `Confirmed Action Execution: ${actionConfirmPayload.action}`,
          answer: result.message || 'Action executed successfully.',
          evidence: [`Target Asset: ${actionConfirmPayload.target}`, `Scenario: ${actionConfirmPayload.scenario}`],
          risk: 'Simulation state updated.',
          recommendation: 'Observe live telemetry updates.',
          dataSourcesUsed: ['SIMULATED'],
          confidence: 'CONFIRMED',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setActionConfirmPayload(null);
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="IRISYN AI Copilot Command Console"
      description="Context-aware conversational Digital Twin assistant powered by live telemetry & platform tools"
    >
      <div className="space-y-6">
        {/* AI Status Header Bar */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                IRISYN COPILOT CORE
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  AI STATUS: {status?.aiStatus ?? 'ONLINE'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: <strong className="text-purple-300">{status?.configuredModel ?? 'IRISYN Digital Twin Copilot v2.4'}</strong> • Sync: {status?.lastDataSync ?? '0.8 sec ago'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Activity size={15} className="animate-pulse" />
              <span>DATA CONNECTION: {status?.dataConnection ?? 'LIVE'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300">
              <Database size={15} />
              <span>ASSET CONTEXT: {status?.activeContextAssets ?? 6} Assets</span>
            </div>
          </div>
        </div>

        {/* Console Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Quick Actions */}
          <div className="space-y-4">
            <div className="card p-4 bg-slate-900 border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" />
                Quick Operations
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  'What is happening right now?',
                  'Show unhealthy assets',
                  'Why is MOTOR-001 in warning state?',
                  'Inject bearing fault into MOTOR-001',
                  'Is the telemetry currently live?',
                  'Show today critical incidents',
                  'Compare MOTOR-001 with host laptop',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700/60 transition-colors font-medium text-[11px]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Stream */}
          <div className="lg:col-span-3 card p-6 bg-slate-900 border-slate-800 flex flex-col h-[650px] justify-between">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-sans text-xs scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center py-20 space-y-3">
                  <Bot size={44} className="mx-auto text-purple-400 animate-bounce" />
                  <h4 className="font-bold text-slate-200 text-base">IRISYN Copilot Command Center Active</h4>
                  <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                    Ask natural language questions about real local laptop host hardware, synthetic industrial asset twins, health scores, and anomaly predictions.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-end">
                    <div className="px-4 py-2.5 rounded-2xl bg-purple-600 text-white max-w-[80%] font-medium shadow-md">
                      {msg.question}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">ANSWER</span>
                      <p className="text-slate-100 text-sm leading-relaxed font-medium">{msg.answer}</p>
                    </div>

                    {msg.evidence && msg.evidence.length > 0 && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-1">
                        <span className="text-slate-400 font-sans font-bold block text-[11px] mb-1">MEASURED EVIDENCE:</span>
                        {msg.evidence.map((item, i) => (
                          <div key={i} className="text-slate-300 flex items-start gap-1.5">
                            <span className="text-purple-400">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.risk && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                          <strong className="block text-[11px] text-rose-400 mb-0.5">OPERATIONAL RISK:</strong> {msg.risk}
                        </div>
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          <strong className="block text-[11px] text-amber-400 mb-0.5">RECOMMENDATION:</strong> {msg.recommendation}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>SOURCES:</span>
                        {msg.dataSourcesUsed.map((src) => (
                          <span
                            key={src}
                            className={`px-2 py-0.5 rounded font-bold ${
                              src === 'REAL-TIME LOCAL'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                      <span className="text-slate-400 font-mono">Confidence: {msg.confidence}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Action Confirmation Banner */}
              {actionConfirmPayload && (
                <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-4">
                  <div className="flex items-center gap-2 font-bold text-base text-amber-300">
                    <AlertTriangle size={20} />
                    Consequential Operation Confirmation Required
                  </div>
                  <div className="text-xs space-y-1.5 text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <div>ACTION: <strong className="text-amber-400">{actionConfirmPayload.action}</strong></div>
                    <div>TARGET ASSET: <strong className="text-slate-100">{actionConfirmPayload.target}</strong></div>
                    <div>ENVIRONMENT: <strong className="text-purple-400">SIMULATION</strong></div>
                    <div>SCENARIO PARAMETER: <strong>{actionConfirmPayload.scenario}</strong></div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setActionConfirmPayload(null)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel Action
                    </button>
                    <button
                      onClick={handleConfirmAction}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 shadow-md"
                    >
                      {loading ? 'Executing...' : 'Confirm & Execute Action'}
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic p-3">
                  <RefreshCw size={16} className="animate-spin text-purple-400" />
                  Copilot is executing tool requests against Digital Twin Engine...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Copilot about asset state, telemetry, alerts, or simulation actions..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CopilotConsole;
