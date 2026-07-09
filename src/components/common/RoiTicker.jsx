import React, { useMemo } from "react";
import { LENDERS } from "../../utils/loanConstants";
import "./roiTicker.css";

export default function RoiTicker() {
  const tickerItems = useMemo(() => {
    const TICKER_ORDER = ['home', 'lap', 'business', 'personal', 'vehicle'];
    const typeLabels = {
      home: 'Home Loan',
      lap: 'LAP',
      business: 'Business Loan',
      personal: 'Personal Loan',
      vehicle: 'Vehicle Loan'
    };
    let items = [];

    TICKER_ORDER.forEach(t => {
      let perType = LENDERS.map(l => {
        const rt = l.rates && l.rates[t];
        if (!rt) return null;
        const r = rt.f && rt.f[0] != null ? rt.f[0] : (rt.x && rt.x[0] != null ? rt.x[0] : null);
        if (r === null || r === undefined) return null;
        return { name: l.short || l.name, loanLabel: typeLabels[t], rate: r };
      }).filter(Boolean);

      perType.sort((a, b) => a.rate - b.rate);
      items.push(...perType.slice(0, 4)); // top-4 per loan type
    });

    if (items.length === 0) return [];

    const sortedRates = items.map(it => it.rate).sort((a, b) => a - b);
    const median = sortedRates[Math.floor(sortedRates.length / 2)];

    return items.map(it => ({
      ...it,
      down: it.rate < median
    }));
  }, []);

  if (tickerItems.length === 0) return null;

  // Duplicate sequence for seamless loop animation
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="roi-ticker roi-ticker-global" id="roiTicker" aria-label="Lender interest rates">
      <div className="roi-ticker-label">
        <span className="roi-live-dot"></span>ROI
      </div>
      <div className="roi-ticker-viewport">
        <div className="roi-ticker-track" id="roiTickerTrack">
          {displayItems.map((item, index) => (
            <span key={index} className="roi-item">
              <span className="roi-name">{item.name}</span>
              <span className="roi-type">{item.loanLabel}</span>
              <span className="roi-val">{item.rate.toFixed(2)}%</span>
              {item.down ? (
                <span className="roi-arrow down">▼</span>
              ) : (
                <span className="roi-arrow up">▲</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export { RoiTicker };
