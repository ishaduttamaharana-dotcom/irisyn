import { useState } from 'react';
import { Send, Bot } from 'lucide-react';

interface ChatMessage {
  id: number;
  from: 'user' | 'bot';
  text: string;
}

const OpenClawChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: 'bot', text: 'Hi, I\'m OpenClaw. Ask me about cluster health, anomalies, or recovery actions.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text: input };
    // Placeholder response until the real /chat endpoint is wired up.
    const botMsg: ChatMessage = { id: Date.now() + 1, from: 'bot', text: 'This is a placeholder response — chat backend not yet connected.' };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="card p-4 flex flex-col h-80">
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
        <Bot size={16} /> OpenClaw Chat
      </p>
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.from === 'user'
                ? 'ml-auto bg-brand-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask OpenClaw..."
          className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button onClick={handleSend} className="rounded-lg bg-brand-500 p-2 text-white hover:bg-brand-600" aria-label="Send">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default OpenClawChat;
