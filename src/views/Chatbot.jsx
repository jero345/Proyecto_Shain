import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { axiosChatbot } from '@services/axiosclient';

const DEFAULT_MESSAGES = [
  { id: 1, date: 'Hoy', sender: 'bot', text: 'Hola ¿Quieres que te muestre cómo va el negocio?' }
];

// Obtener la clave del chatbot desde variables de entorno (compatible con Vite y CRA)
const getChatbotKey = () => {
  // Intentar Vite primero (VITE_)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const viteKey = import.meta.env.VITE_CHATBOT_API_KEY;
      if (viteKey) return viteKey;
    }
  } catch {}
  
  // Intentar Create React App (REACT_APP_)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const craKey = process.env.REACT_APP_CHATBOT_API_KEY;
      if (craKey) return craKey;
    }
  } catch {}
  
  // Intentar window.__env (para configuración en runtime)
  try {
    if (typeof window !== 'undefined' && window.__env) {
      const windowKey = window.__env.CHATBOT_API_KEY || window.__env.VITE_CHATBOT_API_KEY;
      if (windowKey) return windowKey;
    }
  } catch {}
  
  return '';
};

export const ChatBot = ({ userName = 'Usuario' }) => {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [lastSlots, setLastSlots] = useState({ date: null, slots: [] });
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [userId, setUserId] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [configError, setConfigError] = useState(null);
  const scrollRef = useRef(null);

  // Verificar configuración al montar
  useEffect(() => {
    const key = getChatbotKey();
    if (!key) {
      setConfigError('chatbot_key_missing');
    }
  }, []);

  // Obtener userId y businessId del localStorage al montar
  useEffect(() => {
    // Intentar obtener del localStorage con la key correcta (auth:user)
    let userData = null;
    
    try {
      // Primero intentar con auth:user (que usa AuthContext)
      const authUserStr = localStorage.getItem('auth:user');
      if (authUserStr) {
        userData = JSON.parse(authUserStr);
      }
    } catch {
      // Error parsing auth:user
    }

    // Fallback a 'user' si auth:user no existe
    if (!userData) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          userData = JSON.parse(userStr);
        }
      } catch {
        // Error parsing user
      }
    }

    // Obtener userId
    const storedUserId = localStorage.getItem('user_id') 
      || localStorage.getItem('userId') 
      || userData?.id 
      || userData?._id;
    
    // Obtener businessId
    let storedBusinessId = localStorage.getItem('business_id') 
      || localStorage.getItem('businessId');
    
    // Si no está directamente, buscar en business
    if (!storedBusinessId) {
      const businessStr = localStorage.getItem('business');
      if (businessStr) {
        try {
          // Puede ser un string (ID directo) o un objeto JSON
          if (businessStr.startsWith('{')) {
            const businessObj = JSON.parse(businessStr);
            storedBusinessId = businessObj.id || businessObj._id;
          } else {
            storedBusinessId = businessStr;
          }
        } catch {
          storedBusinessId = businessStr; // Usar como string si no es JSON
        }
      }
    }
    
    // Fallback a userData.business
    if (!storedBusinessId && userData?.business) {
      if (typeof userData.business === 'string') {
        storedBusinessId = userData.business;
      } else if (typeof userData.business === 'object') {
        storedBusinessId = userData.business.id || userData.business._id;
      }
    }
    
    // También revisar businessId directo en userData
    if (!storedBusinessId && userData?.businessId) {
      storedBusinessId = userData.businessId;
    }
    
    if (storedUserId) setUserId(storedUserId);
    if (storedBusinessId) setBusinessId(storedBusinessId);
  }, []);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
  const parseTimeslotsFromReply = (reply) => {
    if (!reply) return null;
    const dateMatch = reply.match(/Horarios disponibles para\s*(\d{4}-\d{2}-\d{2})/i);
    if (!dateMatch) return null;
    const date = dateMatch[1];
    const lines = reply.split('\n').slice(1).map(l => l.trim()).filter(Boolean);
    const slots = lines.map(l => {
      const m = l.match(/^(.+?)\s*\((Disponible|No disponible)\)/i);
      if (m) return { label: m[1].trim(), available: /disponible/i.test(m[2]) };
      return { label: l, available: /disponible/i.test(l) };
    });
    return { date, slots };
  };

  // Enviar mensaje al chatbot
  const sendChatToChatbot = async (text) => {
    const key = getChatbotKey();
    
    // Si no hay key, intentar sin ella (el backend puede manejar auth por token)
    const headers = key ? { "x-chatbot-key": key } : {};
    const body = { userId, businessId, message: text };
    
    try {
      const res = await axiosChatbot.post('/chat', body, { headers });
      return res?.data?.message ?? res?.data?.reply ?? res?.data?.text ?? '';
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) throw new Error('unauthorized');
      if (status === 403) throw new Error('forbidden');
      throw err;
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const text = input.trim();
    if (!text || sending) return;

    // Verificar que tenemos userId y businessId
    if (!userId || !businessId) {
      pushMessage({ 
        sender: 'bot', 
        text: '⚠️ Error: No se pudo identificar al usuario o negocio. Intenta recargar la página o iniciar sesión nuevamente.' 
      });
      return;
    }

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
      let msg;
      if (err?.message === 'unauthorized') {
        msg = '⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      } else if (err?.message === 'forbidden') {
        msg = '⚠️ No tienes permisos para usar el chatbot.';
      } else {
        const errorDetail = err?.response?.data?.error || err?.message || 'Error desconocido';
        msg = `⚠️ Error al enviar mensaje: ${errorDetail}`;
      }
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

  const handleSlotSelect = (slot) => {
    if (!slot.available) return;
    const text = `Quiero agendar a las ${slot.label}`;
    setInput(text);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-[#0f172a] to-[#0f172a]">
      {/* Área de mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 sm:gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl rounded-br-md' 
                    : 'bg-slate-800/80 backdrop-blur-sm rounded-2xl rounded-bl-md'
                } px-4 py-3 max-w-[85%] sm:max-w-[70%] shadow-lg border ${
                  msg.sender === 'user' ? 'border-purple-500/30' : 'border-white/5'
                }`}
              >
                <span className="text-sm leading-relaxed whitespace-pre-wrap text-white">{msg.text}</span>
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {sending && (
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Slots disponibles */}
          {lastSlots.slots.length > 0 && (
            <div className="ml-11">
              <div className="p-4 rounded-2xl border border-white/10 bg-slate-800/60 backdrop-blur-sm">
                <div className="text-xs sm:text-sm font-semibold mb-3 text-purple-300">
                  📅 Horarios disponibles — {lastSlots.date}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {lastSlots.slots.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSlotSelect(s)}
                      className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        s.available
                          ? 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105 shadow-lg cursor-pointer text-white'
                          : 'bg-slate-700 cursor-not-allowed opacity-50 text-white/50'
                      }`}
                      disabled={!s.available}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-white/10 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
        <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 sm:px-5 py-3 rounded-xl bg-slate-800/80 text-white text-sm border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder:text-white/40 transition-all"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-white"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBot;