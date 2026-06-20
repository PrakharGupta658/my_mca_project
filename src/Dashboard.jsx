// src/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { tokens } from "./styles/tokens";
import { useOccupancyData } from "./hooks/useOccupancyData";

import Kpi from "./widgets/Kpi";
import Legend from "./widgets/Legend";
import FloorPlan from "./widgets/FloorPlan";
import TrendChart from "./widgets/TrendChart";
import UtilizationChart from "./widgets/UtilizationChart";
import InsightCard from "./widgets/InsightCard";

const SENSOR_ID = "2c:cf:67:ff:f5:f4";

// Placeholder weekly rollup until a backend aggregation endpoint exists
// (see UtilizationChart.jsx for the intended real source).
const WEEKLY_PLACEHOLDER = [
  { day: "Mon", rate: 52, peak: 78 },
  { day: "Tue", rate: 61, peak: 84 },
  { day: "Wed", rate: 67, peak: 92 },
  { day: "Thu", rate: 58, peak: 81 },
  { day: "Fri", rate: 41, peak: 66 },
];

const INSIGHTS = [
  {
    tone: "save",
    text: "Low-utilization seats on this sensor stay empty most of the morning — worth reviewing if this bank of desks can be consolidated.",
  },
  {
    tone: "watch",
    text: "Occupancy is trending toward sensor capacity. If this pattern continues, consider enabling reservations for this zone.",
  },
  {
    tone: "good",
    text: "Live readings are flowing correctly from sensor 2c:cf:67:ff:f5:f4 — once a few days of history accumulate, swap this card set for real Gemini/OpenAI-generated insights.",
  },
];

export default function Dashboard() {
  const { snapshot, trend, error, loading } = useOccupancyData(SENSOR_ID, 5000);
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    if (!snapshot) return { occupied: 0, available: 0, rate: 0, total: 0 };
    return {
      occupied: snapshot.occupied,
      available: snapshot.available,
      rate: snapshot.rate,
      total: snapshot.desks.length,
    };
  }, [snapshot]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.ink,
        color: tokens.text,
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "28px 32px 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 26,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: tokens.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Sensor {SENSOR_ID}
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
              fontSize: 26,
              fontWeight: 600,
              margin: 0,
            }}
          >
            Desk Occupancy &amp; Analytics
          </h1>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: tokens.faint }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: error ? tokens.alert : tokens.available,
                display: "inline-block",
                boxShadow: `0 0 6px ${error ? tokens.alert : tokens.available}`,
              }}
            />
            {error ? "Sensor feed error" : "Live sensor feed"}
          </div>
          <div>{snapshot ? `Updated ${snapshot.timestamp.toLocaleTimeString()}` : loading ? "Connecting…" : "—"}</div>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: tokens.panelRaised,
            border: `1px solid ${tokens.alert}`,
            color: tokens.alert,
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          Couldn't reach the occupancy sensor: {error}
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 26, flexWrap: "wrap" }}>
        <Kpi
          label="Occupancy rate"
          value={`${stats.rate}%`}
          sub={`${stats.occupied} of ${stats.total} seats in use`}
          accent={tokens.occupied}
        />
        <Kpi label="Available now" value={stats.available} sub="Open seats on this sensor" accent={tokens.available} />
        <Kpi label="Occupied" value={stats.occupied} sub="Currently in use" accent={tokens.occupied} />
        <Kpi label="Total tracked" value={stats.total} sub="Seats reported by this sensor" />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, marginBottom: 18 }}>
        <div
          style={{
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Live seat map</div>
            <Legend />
          </div>
          <FloorPlan desks={snapshot?.desks || []} onSelect={setSelected} selectedId={selected?.id} />
          <div
            style={{
              marginTop: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12.5,
              color: tokens.muted,
              minHeight: 18,
            }}
          >
            {selected ? `${selected.label} — ${selected.status}` : "Select a desk to inspect status"}
          </div>
        </div>

        <div
          style={{
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>Live occupancy trend</div>
          <TrendChart data={trend} />
        </div>
      </div>

      {/* Lower grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div
          style={{
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>Weekly utilization vs. peak</div>
          <UtilizationChart data={WEEKLY_PLACEHOLDER} />
        </div>

        <div
          style={{
            background: tokens.panel,
            border: `1px solid ${tokens.line}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 16 }}>AI-based recommendations</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {INSIGHTS.map((ins, i) => (
              <InsightCard key={i} {...ins} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}