import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { axiosChatbot } from '@services/axiosclient';

const DEFAULT_MESSAGES = [
  { id: 1, date: 'Hoy', sender: 'bot', text: 'Hola 👋 ¿Quieres que te muestre cómo va el negocio?' }
];

export const ChatBot = ({ userName = 'Usuario' }) => {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [lastSlots, setLastSlots] = useState({ date: null, slots: [] });
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, lastSlots, showMenu, sending]);

  // Añadir mensaje
  const pushMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: prev.length + 1, date: 'Hoy', ...msg }]);
    if (msg.sender === 'bot' && /qué quieres hacer hoy|agregar movimiento|agendar cita/i.test(msg.text)) {
      setShowMenu(true);
    } else if (msg.sender === 'bot' && !/Horarios disponibles para/i.test(msg.text)) {
      setShowMenu(false);
    }
  }, []);

  // Parsear horarios del bot
  function parseTimeslotsFromReply(reply) {
    if (!reply) return null;
    const dateMatch = reply.match(/Horarios disponibles para\s*(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) return null;
    const date = dateMatch[1];
    const lines = reply.split('\n').slice(1).map(l => l.trim()).filter(Boolean);
    const slots = lines.map(l => {
      const m = l.match(/^(.+?)\s*\((Disponible|No disponible)\)/i);
      if (m) return { label: m[1].trim(), available: /disponible/i.test(m[2]) };
      return { label: l, available: /disponible/i.test(l) || true };
    });
    return { date, slots };
  }

  async function sendChatToChatbot(text) {
    const headers = { "x-chatbot-key": 'VL0AouMPkVIW7ERvheLmSw6d3HNIcGrdix/eYprnh/M=' };
    try {
      const res = await axiosChatbot.post('/chat', { message: text }, { headers });
      return res?.data?.message ?? res?.data?.reply ?? res?.data?.text ?? '';
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) throw new Error('unauthorized');
      if (status === 403) throw new Error('forbidden');
      throw err;
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || sending) return;

    pushMessage({ sender: 'user', text });
    setInput('');
    setSending(true);
    setLastSlots({ date: null, slots: [] });

    try {
      const reply = await sendChatToChatbot(text);
      pushMessage({ sender: 'bot', text: reply });
      const parsed = parseTimeslotsFromReply(reply);
      if (parsed) setLastSlots(parsed);
    } catch (err) {
      const msg =
        err?.message === 'unauthorized'
          ? '⚠️ No autorizado. Inicia sesión nuevamente.'
          : err?.message === 'forbidden'
          ? '⚠️ Permisos insuficientes para esta acción.'
          : `⚠️ Error: ${err?.response?.data?.error || err?.message || 'Error desconocido'}`;
      pushMessage({ sender: 'bot', text: msg });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[calc(100vh-4rem)] text-white">
      {/* Contenedor fijo y centrado */}
      <div className="w-full max-w-4xl flex flex-col bg-gray-900/60 rounded-2xl border border-white/10 backdrop-blur-md h-[80vh] p-6">
        
        {/* Header */}
        <h1 className="text-xl font-bold mb-4 flex items-center gap-3">
          <MessageSquare className="w-5 h-5" /> Asesor Shain
        </h1>

        {/* Chat scrollable */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4"
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'bot' ? 'self-start' : 'self-end'
              }`}
            >
              {msg.sender === 'bot' && <Bot className="w-5 h-5" />}
              <div
                className={`${
                  msg.sender === 'user' ? 'bg-purple-600 ml-auto' : 'bg-gray-700'
                } p-3 rounded-2xl max-w-[75%]`}
              >
                <span>{msg.text}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Slots disponibles */}
        {lastSlots.slots.length > 0 && (
          <div className="p-3 rounded border border-white/20 bg-gray-800 mb-4">
            <div className="text-sm font-medium mb-2">
              Horarios disponibles — {lastSlots.date}
            </div>
            <div className="flex gap-2 flex-wrap">
              {lastSlots.slots.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {}}
                  className={`px-3 py-2 rounded ${
                    s.available
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                  disabled={!s.available}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input fijo abajo */}
        <form
          onSubmit={handleSend}
          className="flex gap-3 mt-auto border-t border-white/10 pt-3"
        >
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Escribe "hola" o un comando...'
            className="flex-1 p-3 rounded bg-gray-800 text-white resize-none"
          />
          <button
            type="submit"
            disabled={sending}
            className="px-6 py-3 rounded bg-purple-600 hover:bg-purple-700 transition"
          >
            {sending ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;

