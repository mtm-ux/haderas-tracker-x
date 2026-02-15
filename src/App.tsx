import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { useStore } from '@/store';

function App() {
  const { isDarkMode } = useStore();

  useEffect(() => {
    // Setze Theme bei Initialisierung
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="h-screen flex flex-col bg-app-bg text-app-text overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
