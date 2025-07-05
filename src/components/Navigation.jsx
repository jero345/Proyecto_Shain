import { Link, useLocation } from "react-router-dom";
import { navItems } from "@constants/navigation";

export const Navigation = ({ isOpen = false }) => {
  const location = useLocation();

  if (!Array.isArray(navItems)) {
    console.error("❌ navItems no es un array válido");
    return null;
  }

  return (
    <aside
      className={`
        fixed md:static md:block
        top-0 left-0 h-screen w-72 shrink-0 z-50
        bg-gray-900 text-white p-4
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Logo lateral */}
      <div className="flex items-center justify-center mb-10">
        <span className="text-lg font-bold flex items-center gap-2">
          <span role="img" aria-label="logo">📊</span> Shain
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 transition ${
              location.pathname === item.to ? "bg-gray-800 font-semibold" : ""
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
