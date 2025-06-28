import { AlertTriangle, Bot, BellRing, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Notifications = () => {
  const notifications = [
    {
      id: 1,
      source: 'Centro de Finanzas',
      message: 'Alerta: los egresos superan los ingresos',
      date: 'Hoy',
      icon: <AlertTriangle size={18} />,
      color: 'bg-red-500/20 text-red-300',
    },
    {
      id: 2,
      source: 'ChatBot',
      message: '¡Hey Sebas! dejaste un movimiento sin especificar el costo',
      date: 'Hoy',
      icon: <Bot size={18} />,
      color: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      id: 3,
      source: 'Sistema SHAIN',
      message: 'Advertencia: se recomienda actualizar la aplicación a su versión más reciente v2.02.17',
      date: 'Ayer',
      icon: <BellRing size={18} />,
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 4,
      source: 'Sistema SHAIN',
      message: '¿Con limitaciones? Explora los demás planes que shain tiene para ti',
      date: '12 Jun',
      icon: <BellRing size={18} />,
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 5,
      source: 'Centro de Finanzas',
      message: 'Alerta: Tu meta mensual está próxima a vencer y no has cumplido aún ni con el 80%',
      date: '9 Jun',
      icon: <AlertTriangle size={18} />,
      color: 'bg-red-500/20 text-red-300',
    },
    {
      id: 6,
      source: 'ChatBot',
      message: 'Me aburro XoX ¿registramos movimientos nuevos hoy?',
      date: '5 Jun',
      icon: <Bot size={18} />,
      color: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      id: 7,
      source: 'Centro de Finanzas',
      message: 'Alerta: los egresos superan los ingresos',
      date: '5 Jun',
      icon: <AlertTriangle size={18} />,
      color: 'bg-red-500/20 text-red-300',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 bg-cover p-6 text-white overflow-x-hidden">
      <h1 className="text-2xl font-bold mb-6">Historial de notificaciones</h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 rounded-md ${n.color}`}
          >
            <div className="mt-1">{n.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{n.source}</p>
              <p className="text-sm text-white/90">{n.message}</p>
              <p className="text-xs text-white/60 mt-1">{n.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to="/dashboard/home"
          className="inline-flex items-center gap-2 text-sm text-purple-300 hover:underline"
        >
          <ArrowLeft size={16} /> Volver al resumen diario
        </Link>
      </div>
    </div>
  );
};