import { useState } from 'react';
import { MessageSquare, Bot } from 'lucide-react';

export const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      date: '9 Jun',
      sender: 'user',
      text: 'Regístrame un nuevo ingreso de 890.000 de una venta de unas gorras negras el día de hoy',
    },
    {
      id: 2,
      date: '9 Jun',
      sender: 'bot',
      text: 'Muy bien, he agregado un ingreso el día de hoy por la venta de dos gorras negras por 890.000 ¿Hay algo más que desees hacer?',
    },
    {
      id: 3,
      date: '9 Jun',
      sender: 'bot',
      text: '✅ Venta registrada',
    },
    {
      id: 4,
      date: '12 Jun',
      sender: 'user',
      text: 'Vendí 3 camisetas negras hoy',
    },
    {
      id: 5,
      date: '12 Jun',
      sender: 'bot',
      text: 'Muy bien, solo falta especificar a qué precio las vendiste',
    },
    {
      id: 6,
      date: '12 Jun',
      sender: 'user',
      text: 'Las vendí por 1.200 pesos',
    },
    {
      id: 7,
      date: 'Hoy',
      sender: 'user',
      text: 'Hola',
    },
    {
      id: 8,
      date: 'Hoy',
      sender: 'bot',
      text: '¡Hola! ¿En qué puedo ayudarte el día de hoy?',
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      date: 'Hoy',
      sender: 'user',
      text: input.trim(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  const groupedByDate = messages.reduce((acc, msg) => {
    acc[msg.date] = acc[msg.date] || [];
    acc[msg.date].push(msg);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 flex flex-col min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#191027] to-[#0d0818] text-white">
      {/* ✅ Título con ícono burbuja */}
      <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-white/70" /> ChatBot
      </h1>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {Object.entries(groupedByDate).map(([date, msgs]) => (
          <div key={date}>
            <p className="text-xs text-white/40 mb-2">{date}</p>
            <div className="space-y-3 flex flex-col">
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.sender === 'bot' ? 'self-start' : 'self-end'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <Bot className="w-4 h-4 text-white/50 mt-1" />
                  )}

                  <div
                    className={`w-fit max-w-[75%] px-4 py-2 rounded-lg text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1a1a1a] text-white ml-auto'
                        : 'bg-[#1c1b2a] text-white/90'
                    }`}
                  >
                    <span
                      className={
                        msg.text.toLowerCase().includes('venta registrada')
                          ? 'text-green-400 font-semibold'
                          : ''
                      }
                    >
                      {msg.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-6 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-full bg-[#1a1a1a] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full font-semibold transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};
