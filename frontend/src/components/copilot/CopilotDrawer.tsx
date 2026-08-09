import { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Bot, X, Send, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { queryCopilot, executeCopilotAction, getCopilotStatus, CopilotResponse } from '@/services/copilot.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CopilotDrawer = ({ isOpen, onClose }: Props) => {
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  
  const [messages, setMessages] = useState<CopilotResponse[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionConfirmPayload, setActionConfirmPayload] = useState<any | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Context awareness: determine current active page / asset ID
  const activeAssetId = params.id || (location.pathname.includes('MOTOR-001') ? 'MOTOR-001' : undefined);
  const pageContext = location.pathname.split('/')[1] || 'Dashboard';

  useEffect(() => {
    if (isOpen) {
      getCopilotStatus().catch(() => null);
    }
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const prompt = questionText || input;
    if (!prompt.trim() || loading) return;

    setInput('');
    setLoading(true);

    try {
      const res = await queryCopilot({
        question: prompt,
        pageContext,
        activeAssetId,
      });

      setMessages((prev) => [...prev, res]);

      if (res.requiresActionConfirmation && res.actionPayload) {
        setActionConfirmPayload(res.actionPayload);
      }
    } catch (err) {
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
          question: `Confirmed Action: ${actionConfirmPayload.action}`,
          answer: result.message || 'Action executed successfully.',
          evidence: [`Target Asset: ${actionConfirmPayload.target}`, `Scenario: ${actionConfirmPayload.scenario}`],
          risk: 'Simulation state updated.',
          recommendation: 'Observe real-time telemetry response.',
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100">IRISYN COPILOT</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  AI ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles size={12} className="text-purple-400" />
                Context: <strong className="text-purple-300 font-mono">{activeAssetId || pageContext}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
          {[
            'What is happening now?',
            'Show unhealthy assets',
            'Why is MOTOR-001 in warning state?',
            'Inject bearing fault',
            'Is telemetry live?',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-700 whitespace-nowrap transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Bot size={36} className="mx-auto text-purple-400 animate-bounce" />
              <h4 className="font-bold text-slate-200 text-sm">IRISYN Copilot Active</h4>
              <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                I am your context-aware Digital Twin assistant monitoring active local hardware & simulated assets. Ask me anything!
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-3">
              {/* User Prompt */}
              <div className="flex justify-end">
                <div className="px-3.5 py-2 rounded-2xl bg-purple-600 text-white max-w-[85%] font-medium">
                  {msg.question}
                </div>
              </div>

              {/* Copilot Response Card */}
              <div className="p-4 rounded-xl bg-slate-850 border border-slate-750 space-y-3 bg-slate-950/70">
                {/* Answer */}
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">ANSWER</span>
                  <p className="text-slate-100 font-medium text-xs leading-relaxed">{msg.answer}</p>
                </div>

                {/* Evidence */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1 font-mono text-[11px]">
                    <span className="text-slate-400 font-sans font-bold block text-[10px]">OBSERVED EVIDENCE:</span>
                    {msg.evidence.map((item, i) => (
                      <div key={i} className="text-slate-300 flex items-start gap-1.5">
                        <span className="text-purple-400">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk & Recommendation */}
                {msg.risk && (
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <strong className="block text-[10px] text-rose-400">RISK:</strong> {msg.risk}
                    </div>
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <strong className="block text-[10px] text-amber-400">RECOMMENDATION:</strong> {msg.recommendation}
                    </div>
                  </div>
                )}

                {/* Data Sources Used Footer */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>DATA SOURCES:</span>
                    {msg.dataSourcesUsed.map((src) => (
                      <span
                        key={src}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          src === 'REAL-TIME LOCAL'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-500 font-mono">Confidence: {msg.confidence}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Action Confirmation Modal Banner */}
          {actionConfirmPayload && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                <AlertTriangle size={18} />
                Consequential Action Confirmation Required
              </div>
              <div className="text-xs space-y-1 text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <div>ACTION: <strong className="text-amber-400">{actionConfirmPayload.action}</strong></div>
                <div>TARGET: <strong className="text-slate-100">{actionConfirmPayload.target}</strong></div>
                <div>MODE: <strong className="text-purple-400">SIMULATION</strong></div>
                <div>SCENARIO: <strong>{actionConfirmPayload.scenario}</strong></div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setActionConfirmPayload(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 shadow-md"
                >
                  {loading ? 'Executing...' : 'Confirm Execution'}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
              <RefreshCw size={14} className="animate-spin text-purple-400" />
              Copilot is evaluating digital twin telemetry & platform state...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask Copilot about ${activeAssetId || 'system state'}...`}
            className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopilotDrawer;
