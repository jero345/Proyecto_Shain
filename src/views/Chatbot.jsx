import { useState } from 'react';

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
      text: 'Venta registrada',
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
    <div className="w-full min-h-screen bg-custom-gradient bg-cover p-6 text-white flex flex-col">
      <h1 className="text-2xl font-bold mb-4">ShainBot</h1>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {Object.entries(groupedByDate).map(([date, msgs]) => (
          <div key={date}>
            <p className="text-xs text-white/60 mb-2">{date}</p>
            <div className="space-y-2">
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradientMid1 self-end ml-auto'
                      : 'bg-white/10 text-white/90'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-6 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-md bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gradientStart"
        />
        <button
          type="submit"
          className="bg-gradientStart hover:bg-gradientMid1 px-4 py-2 rounded-md font-semibold transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};