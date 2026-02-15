import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
    symbol: string;
    theme: 'light' | 'dark';
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, theme }) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;

        // Remove any existing script
        const existingScript = container.current.querySelector('script');
        if (existingScript) {
            container.current.removeChild(existingScript);
        }

        // Create new script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;

        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": symbol.includes(':') ? symbol : symbol,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": theme,
            "style": "1",
            "locale": "de_DE",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "calendar": false,
            "support_host": "https://www.tradingview.com"
        });

        container.current.appendChild(script);

        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [symbol, theme]);

    return (
        <div className="tradingview-widget-container h-full w-full" ref={container}>
            <div className="tradingview-widget-container__widget h-full w-full"></div>
        </div>
    );
};
