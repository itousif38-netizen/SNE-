import React, { useState, useRef, useEffect } from 'react';
import { chatWithSuperintendent } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, HardHat } from 'lucide-react';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Morning! I'm your Virtual Superintendent. Need help with compliance, scheduling, or just a sanity check on a build detail? Fire away.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const responseText = await chatWithSuperintendent(history, userMsg.text);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Sorry, I didn't catch that. Radio interference. Can you repeat?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "System error. Check your connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-orange-600 rounded-lg">
          <HardHat className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-white font-bold">Site Superintendent AI</h2>
          <p className="text-slate-400 text-xs">Always on site. 24/7 Support.</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] rounded-2xl px-4 py-3 shadow-sm flex items-start gap-3
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}
            `}>
              <div className={`mt-1 min-w-[20px] ${msg.role === 'user' ? 'hidden' : 'block'}`}>
                 <Bot size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] block mt-1 opacity-70 ${msg.role === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
              <Bot size={20} className="text-orange-500" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-100 text-slate-900 placeholder-slate-500 border-0 rounded-full py-3 px-5 focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
            placeholder="Ask about safety codes, concrete ratios, or scheduling..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-3 rounded-full text-white transition-colors
              ${!input.trim() || loading 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 shadow-md'}
            `}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;