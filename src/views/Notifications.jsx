import { AlertTriangle, Bot, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Notifications = () => {
  const notifications = [
    {
      id: 1,
      source: 'Centro de Finanzas',
      message: 'Alerta: los egresos superan los ingresos',
      date: 'Hoy',
      icon: <AlertCircle size={16} />,
      color: 'bg-[#701a1a]', // rojo sólido estilo foto
      text: 'text-red-100',
    },
    {
      id: 2,
      source: 'ChatBot',
      message: '¡Hey Sebas! dejaste un movimiento sin especificar el costo',
      date: 'Hoy',
      icon: <Bot size={16} />,
      color: 'bg-[#0b0f19]', // dark
      text: 'text-white/80',
    },
    {
      id: 3,
      source: 'Sistema SHAIN',
      message: 'Advertencia: se recomienda actualizar la aplicación a su versión más reciente v2.02.17',
      date: 'Ayer',
      icon: <AlertTriangle size={16} />,
      color: 'bg-[#6b4f16]', // amarillo oscuro
      text: 'text-yellow-100',
    },
    {
      id: 4,
      source: 'Sistema SHAIN',
      message: '¿Con limitaciones? Explora los demás planes que shain tiene para ti',
      date: '12 Jun',
      icon: <AlertTriangle size={16} />,
      color: 'bg-[#6b4f16]',
      text: 'text-yellow-100',
    },
    {
      id: 5,
      source: 'Centro de Finanzas',
      message: 'Alerta: Tu meta mensual está próxima a vencer y no has cumplido aún ni con el 80%',
      date: '9 Jun',
      icon: <AlertCircle size={16} />,
      color: 'bg-[#701a1a]',
      text: 'text-red-100',
    },
    {
      id: 6,
      source: 'ChatBot',
      message: 'Me aburro XoX ¿registramos movimientos nuevos hoy?',
      date: '5 Jun',
      icon: <Bot size={16} />,
      color: 'bg-[#0b0f19]',
      text: 'text-white/80',
    },
    {
      id: 7,
      source: 'Centro de Finanzas',
      message: 'Alerta: los egresos superan los ingresos',
      date: '5 Jun',
      icon: <AlertCircle size={16} />,
      color: 'bg-[#701a1a]',
      text: 'text-red-100',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 text-white">
      {/* Encabezado con icono estilo tu foto */}
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-4 h-4 text-white/60" />
        <h1 className="text-base font-semibold text-white/80">Notificaciones</h1>
      </div>

      <h2 className="text-3xl font-bold mb-1">Historial de notificaciones</h2>
      <p className="text-white/50 text-sm mb-8">Últimos 30 días...</p>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center justify-between px-6 py-4 rounded-md ${n.color}`}
          >
            <div className="flex items-center gap-2">
              <span>{n.icon}</span>
              <div className="flex flex-col">
                <p className={`text-xs font-semibold ${n.text}`}>
                  {n.source}
                </p>
                <p className="text-sm">{n.message}</p>
              </div>
            </div>
            <p className="text-xs text-white/70">{n.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
