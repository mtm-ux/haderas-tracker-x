import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useStore } from '@/store';
import { ChartWidget } from '@/components/widgets/ChartWidget';
import { MetricsWidget } from '@/components/widgets/MetricsWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Dashboard: React.FC = () => {
  const { dashboardLayouts, setDashboardLayouts } = useStore();

  return (
    <div className="flex-1 p-2 md:p-4 overflow-y-auto overflow-x-hidden h-full">
      <ResponsiveGridLayout
        className="layout"
        layouts={dashboardLayouts as any}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={(_currentLayout, allLayouts) => setDashboardLayouts(allLayouts as any)}
        draggableHandle=".drag-handle"
        isDraggable
        isResizable
        compactType="vertical"
      >
        <div key="chart" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
          <div className="drag-handle cursor-move h-8 md:h-1 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center justify-center md:block">
            <span className="text-[11px] text-app-muted md:hidden select-none">Ziehen zum Verschieben</span>
          </div>
          <div className="flex-1 min-h-0">
            <ChartWidget />
          </div>
        </div>

        <div key="metrics" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
          <div className="drag-handle cursor-move h-8 md:h-1 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center justify-center md:block">
            <span className="text-[11px] text-app-muted md:hidden select-none">Ziehen zum Verschieben</span>
          </div>
          <div className="flex-1 min-h-0">
            <MetricsWidget />
          </div>
        </div>

        <div key="news" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
          <div className="drag-handle cursor-move h-8 md:h-1 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center justify-center md:block">
            <span className="text-[11px] text-app-muted md:hidden select-none">Ziehen zum Verschieben</span>
          </div>
          <div className="flex-1 min-h-0">
            <NewsWidget />
          </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};
