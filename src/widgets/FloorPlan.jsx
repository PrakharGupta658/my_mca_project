// src/widgets/FloorPlan.jsx
import React from "react";
import { tokens } from "../styles/tokens";

/**
 * Renders desks in an auto-flowing grid. The sensor API doesn't expose
 * physical row/col coordinates, so layout is purely count-driven —
 * swap in real coordinates here once your floor-plan mapping exists.
 */
export default function FloorPlan({ desks, onSelect, selectedId, columns = 9 }) {
  if (!desks || desks.length === 0) {
    return <div style={{ color: tokens.faint, fontSize: 13 }}>No seats reported by this sensor.</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(columns, desks.length)}, 1fr)`,
        gap: 6,
      }}
    >
      {desks.map((d) => {
        const color = d.status === "occupied" ? tokens.occupied : tokens.available;
        const isSel = d.id === selectedId;
        return (
          <button
            key={d.id}
            onClick={() => onSelect(d)}
            title={`${d.label} — ${d.status}`}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 4,
              border: isSel ? `1.5px solid ${tokens.text}` : "1px solid transparent",
              background: color + (d.status === "available" ? "33" : "CC"),
              cursor: "pointer",
              padding: 0,
              outline: "none",
              transition: "transform 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        );
      })}
    </div>
  );
}