import { useEffect } from 'react';
import { useStore } from '@/store';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { EntdeckenPage } from '@/pages/EntdeckenPage';
import { DeepResearchPage } from '@/pages/DeepResearchPage';
import { NexusTrendsPage } from '@/pages/NexusTrendsPage';
import { JahresstrahlPage } from '@/pages/JahresstrahlPage';
import { AssetsPage } from '@/pages/AssetsPage';

function App() {
  const { isDarkMode } = useStore();

  useEffect(() => {
    // Setze Theme bei Initialisierung
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Dashboard: Liste + Detailpanel */}
        <Route path="/" element={<AssetsPage />} />
        <Route path="/entdecken" element={<EntdeckenPage />} />
        <Route path="/deep-research" element={<DeepResearchPage />} />
        <Route path="/trends" element={<NexusTrendsPage />} />
        <Route path="/jahresstrahl" element={<JahresstrahlPage />} />
        {/* Assets: Widget-Grid (Chart / Metrics / News) */}
        <Route path="/assets" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
