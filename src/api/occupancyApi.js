const BASE_URL = "http://localhost:8080/api/occupancy";

/**
 * Fetch the current snapshot for a given sensor.
 * @param {string} sensorId e.g. "2c:cf:67:ff:f5:f4"
 */
export async function fetchRealtimeOccupancy(sensorId) {
  const url = `${BASE_URL}/live?sensorId=${encodeURIComponent(sensorId)}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.error || `Occupancy API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return normalizeLive(json);
}

/**
 * Fetch the occupancy trend (rate over time) for the last N hours.
 * @param {string} sensorId
 * @param {number} hours
 */
export async function fetchTrend(sensorId, hours = 24) {
  const url = `${BASE_URL}/trend?sensorId=${encodeURIComponent(sensorId)}&hours=${hours}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.error || `Trend API request failed: ${res.status} ${res.statusText}`);
  }

  const points = await res.json();
  return points.map((p) => ({
    time: new Date(p.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    occupancy: p.occupancy,
  }));
}

/**
 * Fetch the weekly utilization rollup (avg + peak rate per day).
 * @param {string} sensorId
 * @param {number} days
 */
export async function fetchWeekly(sensorId, days = 7) {
  const url = `${BASE_URL}/weekly?sensorId=${encodeURIComponent(sensorId)}&days=${days}`;
  const res = await fetch(url);

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.error || `Weekly API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json(); // [{ day, rate, peak }, ...]
}

/** Converts the backend's /live response into the shape the widgets expect. */
function normalizeLive(raw) {
  const desks = (raw.seats || []).map((s) => ({
    id: s.seatId,
    label: s.label || prettifySeatName(s.seatId),
    status: s.status === 1 ? "occupied" : "available",
  }));

  return {
    sensorId: raw.sensorId,
    timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
    desks,
    occupied: raw.occupied,
    available: raw.available,
    rate: raw.rate,
  };
}

function prettifySeatName(key) {
  const seatMatch = key.match(/Seat_(\d+)$/i);
  const seatNumber = seatMatch ? seatMatch[1] : null;
  const floor = key.replace(/_Workstation_Seat_\d+$/i, "").replace(/_/g, " ");
  return seatNumber ? `${floor} · Seat ${seatNumber}` : key.replace(/_/g, " ");
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}