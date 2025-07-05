// src/components/PageContainer.jsx

export const PageContainer = ({ children }) => (
  <div className="w-full min-h-screen max-w-[1280px] mx-auto px-4 py-6 overflow-x-hidden">
    {children}
  </div>
);