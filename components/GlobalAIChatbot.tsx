
import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  Zap,
  ChevronDown,
  ChevronUp,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { aiService } from '../services/geminiService';

const GlobalAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: "Systems online. I am CivicConnect AI. How can I assist your municipal navigation today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Use the existing chatAssistant service for consistency
      const response = await aiService.chatAssistant(userText, null);
      setMessages(prev => [...prev, { role: 'ai', text: response.suggestion }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Protocol disruption. Re-establishing AI sync... Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-fadeIn">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-[0_20px_40px_rgba(37,99,235,0.4)] hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Sparkles className="group-hover:rotate-12 transition-transform" size={28} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Terminal Window */}
      {isOpen && (
        <div className="bg-white w-[380px] h-[550px] rounded-[3rem] shadow-[0_40px_100px_rgba(15,23,42,0.2)] border border-slate-100 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-slate-900 p-8 flex items-center justify-between text-white relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight leading-none mb-1">Civic AI Engine</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sync Active</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Message Feed */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/50"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-[11px] font-bold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white border border-slate-100 p-4 rounded-[1.5rem] rounded-tl-none">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-8 py-4 bg-white flex gap-2 border-t border-slate-50 overflow-x-auto scrollbar-hide">
             {["How to report?", "Track issue", "TrustScore™ info"].map(label => (
               <button 
                key={label}
                onClick={() => setInput(label)}
                className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-blue-50 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 rounded-full border border-slate-100 transition-all"
               >
                 {label}
               </button>
             ))}
          </div>

          {/* Input Terminal */}
          <form onSubmit={handleSend} className="p-8 bg-white border-t border-slate-50">
            <div className="relative group">
              <input 
                type="text"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] px-8 py-5 text-[11px] font-bold text-slate-900 outline-none transition-all pr-14 shadow-inner"
                placeholder="Query AI Core..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[8px] font-bold text-slate-300 text-center mt-4 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Fingerprint size={10} /> Authenticated Session
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

export default GlobalAIChatbot;
