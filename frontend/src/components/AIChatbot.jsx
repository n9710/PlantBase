/**
 * AIChatbot — Floating 24x7 customer support chatbot
 */
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { BRAND_NAME } from '../constants';
import api from '../api';

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hi! 👋 I'm the ${BRAND_NAME} assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chatbot', { message: msg });
      setMessages(prev => [...prev, { role: 'bot', text: data.data?.response || 'Sorry, I could not understand that.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = ['Track my order', 'Return policy', 'Payment options', 'Become a seller'];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
        style={{ backgroundColor: 'var(--pb-accent)', boxShadow: '0 8px 32px rgba(141,182,0,0.4)' }}>
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl border overflow-hidden animate-scale-in"
          style={{ backgroundColor: 'var(--pb-bg)', borderColor: 'var(--pb-border)' }}>

          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: 'var(--pb-accent)' }}>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{BRAND_NAME} Assistant</p>
              <p className="text-[10px] text-white/70">Online · Typically replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
                  style={{
                    backgroundColor: m.role === 'user' ? 'var(--pb-accent)' : 'var(--pb-surface)',
                    color: m.role === 'user' ? '#fff' : 'var(--pb-text)',
                  }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--pb-accent)', color: '#fff' }}>
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex gap-1 px-4 py-3 rounded-2xl" style={{ backgroundColor: 'var(--pb-surface)' }}>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--pb-text-secondary)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--pb-text-secondary)', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--pb-text-secondary)', animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {quickReplies.map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(sendMessage, 50); }}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all hover:scale-105"
                  style={{ borderColor: 'var(--pb-accent)', color: 'var(--pb-accent)' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--pb-border)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--pb-surface)', borderColor: 'var(--pb-border)',
                color: 'var(--pb-text)', '--tw-ring-color': 'var(--pb-accent)',
              }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: 'var(--pb-accent)' }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
