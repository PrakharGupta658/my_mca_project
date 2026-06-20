// src/widgets/UtilizationChart.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { tokens } from "../styles/tokens";

/**
 * data: [{ day: "Mon", rate: 52, peak: 78 }, ...]
 *
 * The realtime sensor endpoint only returns the current snapshot, so this
 * widget expects aggregated daily data from your own backend, e.g. a
 * Spring Boot endpoint like GET /api/occupancy/weekly that rolls up
 * stored snapshots in PostgreSQL. Pass that response in as `data`.
 */
export default function UtilizationChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ color: tokens.faint, fontSize: 13 }}>No weekly data available yet.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid stroke={tokens.line} vertical={false} />
        <XAxis dataKey="day" stroke={tokens.faint} fontSize={11} tickLine={false} axisLine={{ stroke: tokens.line }} />
        <YAxis stroke={tokens.faint} fontSize={11} tickLine={false} axisLine={false} width={30} />
        <Tooltip
          contentStyle={{ background: tokens.panelRaised, border: `1px solid ${tokens.line}`, borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: tokens.muted }}
        />
        <Bar dataKey="rate" fill={tokens.available} radius={[4, 4, 0, 0]} barSize={22} />
        <Bar dataKey="peak" fill={tokens.reserved} radius={[4, 4, 0, 0]} barSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}