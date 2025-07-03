import { useState } from "react";
import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { navItems } from "@constants/navigation"; // Asegúrate de que este alias esté configurado

export const QuickActionMenu = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const quickAccess = navItems.filter(item =>
    ["Agregar movimientos", "Historial", "Finanzas"].includes(item.label)
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-400 via-purple-500 to-indigo-600 shadow-md flex items-center justify-center hover:scale-105 transition"
      >
        <Plus className="text-white" size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg overflow-hidden text-sm z-50">
          {quickAccess.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 hover:bg-gray-100 ${
                location.pathname === item.to ? "text-blue-600 font-semibold" : ""
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};