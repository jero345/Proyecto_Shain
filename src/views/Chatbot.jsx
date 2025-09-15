import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { axiosChatbot } from '@services/axiosclient'; // instancia con base .../api y withCredentials

const DEFAULT_MESSAGES = [
  { id: 1, date: 'Hoy', sender: 'bot', text: '¡Hola! Escribe "hola" para ver el menú.' }
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
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, lastSlots, showMenu, sending]);

  // Util: añadir mensaje
  const pushMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: prev.length + 1, date: 'Hoy', ...msg }]);
    if (msg.sender === 'bot' && /qué quieres hacer hoy|agregar movimiento|agendar cita/i.test(msg.text)) {
      setShowMenu(true);
    } else if (msg.sender === 'bot' && !/Horarios disponibles para/i.test(msg.text)) {
      setShowMenu(false);
    }
  }, []);

  // Parsear los horarios que el bot devuelve
  function parseTimeslotsFromReply(reply) {
    if (!reply) return null;
    const dateMatch = reply.match(/Horarios disponibles para\s*(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) return null;
    const date = dateMatch[1];
    const lines = reply.split('\n').slice(1).map(l => l.trim()).filter(Boolean);
    const slots = lines.map(l => {
      const m = l.match(/^(.+?)\s*\((Disponible|No disponible|Disponible)\)/i);
      if (m) return { label: m[1].trim(), available: /disponible/i.test(m[2]) };
      const label = l.split(/\s+/)[0];
      return { label, available: /disponible/i.test(l) || true };
    });
    return { date, slots };
  }

  // Llamada al chatbot (opción B: directo al 5051) con Authorization explícito
  async function sendChatToChatbot(text) {
    ; // debe existir tras login
    const headers = {"x-chatbot-key": 'VL0AouMPkVIW7ERvheLmSw6d3HNIcGrdix/eYprnh/M=' };
    try {
      const res = await axiosChatbot.post(
        '/chat',
        { message: text },
        headers ? { headers } : undefined
      );
      // El backend devuelve { ok, message }; dejamos fallback por si cambia
      return res?.data?.message ?? res?.data?.reply ?? res?.data?.text ?? '';
    } catch (err) {
      // Mejora de mensajes de error
      const status = err?.response?.status;
      if (status === 401) {
        throw new Error('unauthorized');
      }
      if (status === 403) {
        throw new Error('forbidden');
      }
      throw err;
    }
  }

  // Enviar mensaje
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
      // Mensaje de error amigable
      const msg =
        err?.message === 'unauthorized'
          ? '⚠️ No autorizado. Inicia sesión nuevamente para continuar.'
          : err?.message === 'forbidden'
          ? '⚠️ Permisos insuficientes para esta acción.'
          : `⚠️ Error: ${err?.response?.data?.error || err?.message || 'Error desconocido'}`;
      pushMessage({ sender: 'bot', text: msg });
    } finally {
      setSending(false);
    }
  };

  // Enter para enviar (Shift+Enter hace salto de línea)
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col min-h-screen text-white">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-3">
        <MessageSquare className="w-5 h-5" /> ChatBot
      </h1>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-2 pb-4" style={{ maxHeight: '62vh' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'bot' ? 'self-start' : 'self-end'}`}>
            {msg.sender === 'bot' && <Bot className="w-5 h-5" />}
            <div className={`${msg.sender === 'user' ? 'bg-gray-800 ml-auto' : 'bg-gray-700'} p-3 rounded-2xl max-w-[76%]`}>
              <span>{msg.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Slots disponibles */}
      {lastSlots.slots.length > 0 && (
        <div className="mt-4 p-3 rounded border">
          <div className="text-sm font-medium mb-2">Horarios disponibles — {lastSlots.date}</div>
          <div className="flex gap-2 flex-wrap">
            {lastSlots.slots.map((s, i) => (
              <button
                key={i}
                onClick={() => {/* TODO: confirmar por backend */}}
                className={`px-3 py-2 rounded ${s.available ? 'bg-green-600' : 'bg-gray-600 cursor-not-allowed'}`}
                disabled={!s.available}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form enviar */}
      <form onSubmit={handleSend} className="mt-6 flex gap-3">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Escribe "hola" o un comando...'
          className="flex-1 p-3 rounded bg-gray-800 text-white"
        />
        <button type="submit" disabled={sending} className="px-6 py-3 rounded bg-purple-600">
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
