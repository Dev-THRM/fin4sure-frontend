import React, { useMemo, useState, useEffect } from "react";
import { LENDERS } from "../../utils/loanConstants";
import { useAuth } from "../../context/AuthContext";
import "./roiTicker.css";

export default function RoiTicker() {
  const [announcementText, setAnnouncementText] = useState("");
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const { role, user } = useAuth();
  const isAdmin = role === "admin" || user?.role === "admin" || (typeof window !== "undefined" && window.location.pathname.includes("admin"));

  useEffect(() => {
    fetch("/api/location/public-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.announcement_banner) {
          setAnnouncementText(data.announcement_banner.trim());
        }
      })
      .catch(() => {});
  }, []);

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

  if (tickerItems.length === 0 && !announcementText) return null;

  // Duplicate sequence for seamless loop animation
  const displayItems = [...tickerItems, ...tickerItems];

  // Repeat announcement for smooth continuous scrolling
  const announcementRepeats = Array(12).fill(announcementText);

  return (
    <>
      {tickerItems.length > 0 && (
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
      )}

      {announcementText && isBannerVisible && (
        <div className="news-ticker-banner" aria-label="News ticker">
          <div className="news-ticker-label">
            <span className="news-pulse-dot"></span>
            <span>NEWS</span>
          </div>
          <div className="news-ticker-viewport">
            <div className="news-ticker-track">
              {announcementRepeats.map((text, idx) => (
                <span key={idx} className="news-ticker-item">
                  <span className="news-icon">📢</span>
                  <span className="news-text">{text}</span>
                  <span className="news-diamond">✦</span>
                </span>
              ))}
            </div>
          </div>
          {isAdmin && (
            <button className="news-close-btn" onClick={() => setIsBannerVisible(false)} title="Dismiss (Admin Only)">
              ✕
            </button>
          )}
        </div>
      )}
    </>
  );
}
export { RoiTicker };
