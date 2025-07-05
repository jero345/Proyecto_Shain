import { useState } from "react";
import { Navbar } from "./Navbar";
import { Navigation } from "./Navigation";

export const DefaultLayout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-gradientStart via-gradientMid2 to-gradientEnd">
      {/* ✅ Navbar fijo */}
      <Navbar onToggleMenu={() => setIsMenuOpen(!isMenuOpen)} />

      <div className="flex flex-1 relative">
        {/* ✅ Sidebar */}
        <Navigation isOpen={isMenuOpen} />

        {/* ✅ Contenido principal que se expande correctamente */}
        <main className="flex-1 min-h-screen w-full pt-16 md:ml-72 overflow-x-hidden">
          <div className="w-full flex flex-col gap-6 px-4 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
