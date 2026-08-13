import { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Bot, X, Send, Sparkles, AlertTriangle, RefreshCw, Database, ShieldCheck } from 'lucide-react';
import { queryCopilotChat, executeCopilotAction, CopilotChatResponse } from '@/services/copilot.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CopilotDrawer = ({ isOpen, onClose }: Props) => {
  const location = useLocation();
  const params = useParams<{ id?: string }>();

  const [messages, setMessages] = useState<CopilotChatResponse[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionConfirmPayload, setActionConfirmPayload] = useState<{ assetId: string; actionType: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeAssetId = params.id || (location.pathname.includes('MOTOR-001') ? 'MOTOR-001' : undefined);

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
      const res = await queryCopilotChat(prompt, { currentAsset: activeAssetId });
      if (res) {
        setMessages((prev) => [...prev, res]);
      }

      if (res?.type === 'action_confirmation' || prompt.toLowerCase().includes('inject') || prompt.toLowerCase().includes('maintenance')) {
        setActionConfirmPayload({
          assetId: res?.resolvedAssetId || 'LAPTOP-001',
          actionType: 'CREATE_MAINTENANCE_WORK_ORDER',
        });
      }
    } catch (err) {
      console.warn('Copilot drawer query fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionConfirmPayload) return;
    setLoading(true);
    try {
      const result = await executeCopilotAction(actionConfirmPayload.assetId, actionConfirmPayload.actionType);

      if (result) {
        setMessages((prev) => [
          ...prev,
          {
            type: 'text',
            message: `Consequential Action ${result.actionId} Executed: ${result.details}`,
            answer: `Action ${result.actionId} executed successfully by ${result.confirmedBy}`,
            resolvedAssetId: result.assetId,
            inferenceCategory: 'OBSERVED',
            dataTraces: [
              {
                source: 'REAL-TIME LOCAL',
                assetId: result.assetId,
                metric: 'Action Audit Log',
                value: result.status,
                quality: 'LIVE',
                timestamp: result.executedAt,
              },
            ],
            timestamp: result.executedAt,
          },
        ]);
      }
      setActionConfirmPayload(null);
    } catch (e) {
      console.warn('Copilot drawer action execution fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-300 font-sans">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/20">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-100 font-mono">IRISYN COPILOT</h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                  DATA GATEWAY ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                <Sparkles size={12} className="text-purple-400" />
                Context: <strong className="text-purple-300 font-mono">{activeAssetId || 'Fleet Overview'}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            'What is happening now?',
            'Show unhealthy assets',
            'Why is MOTOR-001 in warning state?',
            'What is the temperature of MOTOR-001?',
            'Show prediction evidence',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-purple-900/40 text-slate-300 hover:text-purple-200 border border-slate-800 whitespace-nowrap transition-colors font-mono text-[10px]"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-3 font-sans">
              <Bot size={36} className="mx-auto text-purple-400 animate-bounce" />
              <h4 className="font-bold text-slate-200 text-sm">IRISYN Copilot Operational Assistant</h4>
              <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
                Zero-hallucination data gate active. System queries fetch live physical workstation & synthetic industrial twin state from authorized APIs.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex justify-end">
                <div className="px-3.5 py-2 rounded-2xl bg-purple-600 text-white font-medium font-sans text-xs">
                  {msg.answer || msg.message}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-purple-400" /> COPILOT EXPLANATION
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${msg.inferenceCategory === 'OBSERVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : msg.inferenceCategory === 'INFERRED' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                    {msg.inferenceCategory}
                  </span>
                </div>

                <p className="text-slate-100 text-xs leading-relaxed font-sans">{msg.message}</p>

                {msg.dataTraces && msg.dataTraces.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-[10px]">
                    <span className="text-slate-400 font-sans font-bold block uppercase flex items-center gap-1">
                      <Database size={11} className="text-cyan-400" /> Operational Data Access Traces
                    </span>
                    {msg.dataTraces.map((tr, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950 p-1.5 rounded border border-slate-800">
                        <strong className="text-slate-200">{tr.assetId} • {tr.metric}: {tr.value}</strong>
                        <span className="px-1.5 py-0.2 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {tr.source}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Action Confirmation Modal Banner */}
          {actionConfirmPayload && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                <AlertTriangle size={16} />
                Consequential Action Confirmation Required
              </div>
              <div className="text-[11px] space-y-1 text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                <div>ACTION: <strong className="text-amber-400">{actionConfirmPayload.actionType}</strong></div>
                <div>TARGET: <strong className="text-slate-100">{actionConfirmPayload.assetId}</strong></div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setActionConfirmPayload(null)}
                  className="px-3 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={loading}
                  className="px-3 py-1 rounded text-xs font-bold bg-amber-600 text-white hover:bg-amber-500"
                >
                  {loading ? 'Executing...' : 'Confirm Execution'}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
              <RefreshCw size={14} className="animate-spin text-purple-400" />
              Copilot Data Gate is dispatching tool query to backend API...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2 font-mono">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask Copilot about ${activeAssetId || 'system state'}...`}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
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
