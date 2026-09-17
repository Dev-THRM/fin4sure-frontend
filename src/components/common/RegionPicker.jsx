import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Home,
  Building,
  Compass,
  Sun,
  Landmark,
  Navigation,
  Globe,
  Search,
  X,
  MapPin,
  Check
} from "lucide-react";

export const REGION_DATA = {
  metro: {
    id: "metro",
    label: "Metros",
    desc: "India's top 8 metro cities",
    Icon: Building,
    cities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
  },
  north: {
    id: "north",
    label: "North",
    desc: "Cities across North & Central India",
    Icon: Compass,
    cities: [
      "Delhi NCR", "Gurgaon", "Noida", "Faridabad", "Ghaziabad",
      "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj",
      "Bareilly", "Meerut", "Moradabad", "Aligarh", "Ludhiana",
      "Amritsar", "Chandigarh", "Jalandhar", "Jaipur", "Jodhpur",
      "Kota", "Ajmer", "Bikaner", "Dehradun", "Haridwar",
      "Srinagar", "Jammu", "Patna", "Ranchi", "Dhanbad",
      "Jamshedpur", "Guwahati", "Shimla"
    ],
  },
  south: {
    id: "south",
    label: "South",
    desc: "Cities across South India",
    Icon: Sun,
    cities: [
      "Bengaluru", "Chennai", "Hyderabad", "Coimbatore", "Madurai",
      "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur",
      "Visakhapatnam", "Vijayawada", "Tirupati", "Guntur", "Nellore",
      "Mysuru", "Hubli", "Mangaluru", "Belagavi", "Shivamogga",
      "Salem", "Tiruchirappalli", "Tirunelveli", "Vellore", "Warangal",
      "Karimnagar", "Nizamabad", "Puducherry"
    ],
  },
  west: {
    id: "west",
    label: "West",
    desc: "Cities across West India & Gujarat",
    Icon: Landmark,
    cities: [
      "Mumbai", "Pune", "Navi Mumbai", "Thane", "Nashik",
      "Nagpur", "Aurangabad", "Solapur", "Kolhapur", "Ahmednagar",
      "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
      "Jamnagar", "Gandhinagar", "Anand", "Indore", "Bhopal",
      "Jabalpur", "Gwalior", "Ujjain", "Raipur", "Bilaspur", "Rewa"
    ],
  },
  east: {
    id: "east",
    label: "East",
    desc: "Cities across East & Northeast India",
    Icon: Navigation,
    cities: [
      "Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur",
      "Kharagpur", "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur",
      "Sambalpur", "Patna", "Gaya", "Bhagalpur", "Muzaffarpur",
      "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Agartala",
      "Imphal", "Guwahati", "Shillong", "Dibrugarh", "Silchar"
    ],
  },
  national: {
    id: "national",
    label: "Pan India",
    desc: "Pan-India & regional coverage options",
    Icon: Globe,
    cities: [
      "Pan India", "All Metros", "Tier 1 Cities", "Tier 2 Cities", "Tier 3 Cities",
      "North India", "South India", "West India", "East India", "Central India",
      "Delhi NCR", "Mumbai Metropolitan", "Bengaluru Metropolitan",
      "Hyderabad Metropolitan", "Chennai Metropolitan", "Pune Metropolitan", "Other"
    ],
  },
};

export default function RegionPicker({
  value = "",
  onChange,
  required = false,
  placeholder = "Select City / Area of Operation"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("metro");
  const [searchQuery, setSearchQuery] = useState("");
  const [pickedCity, setPickedCity] = useState(value || "");
  const pickerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync picked city if external value changes
  useEffect(() => {
    if (value) setPickedCity(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  // All unique cities list for global search
  const allCities = useMemo(() => {
    return Array.from(new Set(Object.values(REGION_DATA).flatMap((r) => r.cities)));
  }, []);

  // Filtered cities based on search query or active tab
  const displayedCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return (REGION_DATA[activeTab] || REGION_DATA.metro).cities;
    }
    return allCities.filter((c) => c.toLowerCase().includes(q));
  }, [searchQuery, activeTab, allCities]);

  const handlePick = (city) => {
    setPickedCity(city);
  };

  const handleConfirm = (cityToConfirm) => {
    const finalCity = cityToConfirm || pickedCity;
    if (!finalCity) return;
    onChange?.(finalCity);
    setIsOpen(false);
  };

  const currentTabInfo = REGION_DATA[activeTab] || REGION_DATA.metro;

  return (
    <div className="rgn-picker" ref={pickerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button */}
      <div
        className="rgn-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        aria-expanded={isOpen}
        style={{
          borderColor: isOpen ? "var(--teal, #0f766e)" : undefined,
          boxShadow: isOpen ? "0 0 0 3px rgba(15, 118, 110, 0.14)" : undefined,
        }}
      >
        <span className="icon" style={{ display: "flex", alignItems: "center", color: "#64748B" }}>
          <MapPin size={16} />
        </span>
        <span className={`rgn-trigger-text ${value ? "chosen" : ""}`}>
          {value || placeholder}
        </span>
        <span
          className="rgn-caret"
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease"
          }}
        >
          ▾
        </span>
        {required && <input type="text" value={value} required tabIndex={-1} style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: "1px", height: "1px" }} onChange={() => {}} />}
      </div>

      {/* Pop-up Panel */}
      {isOpen && (
        <div className="rgn-panel" style={{ display: "block" }}>
          {/* Header */}
          <div className="rgn-panel-header">
            <span className="rgn-panel-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Home size={15} style={{ color: "var(--teal, #0F766E)" }} />
              Choose your operating city
            </span>
            <button
              type="button"
              className="rgn-panel-close"
              onClick={() => setIsOpen(false)}
              title="Close"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="rgn-search-wrap">
            <span className="rgn-srch-ic" style={{ display: "flex", alignItems: "center" }}>
              <Search size={15} />
            </span>
            <input
              ref={searchInputRef}
              className="rgn-srch-inp"
              type="text"
              placeholder="Search any city or region…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="rgn-srch-clr"
                onClick={() => setSearchQuery("")}
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Tabs (shown when not searching) */}
          {!searchQuery && (
            <>
              <div className="rgn-tabs-bar">
                {Object.values(REGION_DATA).map((tab) => {
                  const IconComponent = tab.Icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      className={`rgn-tab ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSearchQuery("");
                      }}
                      style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                      <IconComponent size={13} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="rgn-tab-desc">
                {currentTabInfo.desc}
              </div>
            </>
          )}

          {/* Chips Grid */}
          <div className="rgn-chips-grid">
            {displayedCities.length === 0 ? (
              <div className="rgn-no-result">
                No city found for <strong>{searchQuery}</strong>
                <br />
                <button
                  type="button"
                  className="rgn-chip"
                  onClick={() => {
                    handlePick(searchQuery);
                    handleConfirm(searchQuery);
                  }}
                  style={{ marginTop: "8px", fontWeight: 700, borderColor: "var(--teal, #0F766E)" }}
                >
                  + Add &quot;{searchQuery}&quot;
                </button>
              </div>
            ) : (
              displayedCities.map((city) => {
                const isPicked = pickedCity === city;
                return (
                  <button
                    key={city}
                    type="button"
                    className={`rgn-chip ${isPicked ? "picked" : ""}`}
                    onClick={() => {
                      handlePick(city);
                    }}
                    onDoubleClick={() => {
                      handleConfirm(city);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    {isPicked && <Check size={12} strokeWidth={3} />}
                    {city}
                  </button>
                );
              })
            )}
          </div>

          {/* Confirm Bar (shown when a city is picked) */}
          {pickedCity && (
            <div className="rgn-confirm-bar" style={{ display: "flex" }}>
              <div className="rgn-selected-text">
                <MapPin size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                <span>{pickedCity} selected</span>
              </div>
              <button
                type="button"
                className="rgn-confirm-btn"
                onClick={() => handleConfirm(pickedCity)}
              >
                Confirm ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
