import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useStore } from '@/store';
import { ChartWidget } from '@/components/widgets/ChartWidget';
import { MetricsWidget } from '@/components/widgets/MetricsWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Dashboard: React.FC = () => {
  const { dashboardLayout, setDashboardLayout } = useStore();

  const onLayoutChange = (newLayout: any[]) => {
    // Only save layout if it's not mobile (to prevent overwriting desktop layout with a linear mobile list)
    if (window.innerWidth > 768) {
      setDashboardLayout(newLayout);
    }
  };

  const layouts = {
    lg: dashboardLayout,
    md: dashboardLayout,
    sm: dashboardLayout,
    xs: [
      { i: 'chart', x: 0, y: 0, w: 12, h: 4 },
      { i: 'metrics', x: 0, y: 4, w: 12, h: 4 },
      { i: 'news', x: 0, y: 8, w: 12, h: 4 },
    ],
  };

  return (
    <div className="flex-1 p-2 md:p-4 overflow-y-auto overflow-x-hidden h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={window.innerWidth > 768}
        isResizable={window.innerWidth > 768}
        compactType="vertical"
      >
        <div key="chart" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
          <div className="drag-handle cursor-move h-1 bg-app-border hover:bg-primary-500/50 transition-colors shrink-0" />
          <div className="flex-1 min-h-0">
            <ChartWidget />
          </div>
        </div>

        <div key="metrics" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
          <div className="drag-handle cursor-move h-1 bg-app-border hover:bg-primary-500/50 transition-colors shrink-0" />
          <div className="flex-1 min-h-0">
            <MetricsWidget />
          </div>
        </div>

        <div key="news" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
          <div className="drag-handle cursor-move h-1 bg-app-border hover:bg-primary-500/50 transition-colors shrink-0" />
          <div className="flex-1 min-h-0">
            <NewsWidget />
          </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};
