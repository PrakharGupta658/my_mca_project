// src/api/occupancyApi.js
//
// Talks to the DeskTherm realtime occupancy endpoint.
// Example: https://flask.claircoair.com/api/v1/desktherm-realtime?Sensor=2c:cf:67:ff:f5:f4
//
// Raw response shape:
// {
//   "data": {
//     "COUNT": 3,
//     "SEATS": { "Ground_Floor_Workstation_Seat_1": 0, ... },
//     "SENSOR": "2c:cf:67:ff:f5:f4",
//     "TIME": 1781864926,          // unix seconds
//     "_id": "6a3519e56a43beb5554d8a9d"
//   }
// }
// SEATS value: 0 = available, 1 = occupied (sensor only reports these two states)

const BASE_URL = "https://flask.claircoair.com/api/v1/desktherm-realtime";

/**
 * Fetch the latest raw snapshot for a given sensor.
 * @param {string} sensorId e.g. "2c:cf:67:ff:f5:f4"
 */
export async function fetchRealtimeOccupancy(sensorId) {
  const url = `${BASE_URL}?Sensor=${encodeURIComponent(sensorId)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Occupancy API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (!json || !json.data) {
    throw new Error("Occupancy API returned an unexpected payload");
  }

  return normalizeSnapshot(json.data);
}

/**
 * Convert the raw SEATS map into an array of desk objects the UI can render,
 * plus a few derived aggregate numbers.
 */
export function normalizeSnapshot(raw) {
  const seatEntries = Object.entries(raw.SEATS || {});

  const desks = seatEntries.map(([key, value]) => ({
    id: key,
    label: prettifySeatName(key),
    status: value === 1 ? "occupied" : "available",
  }));

  const occupied = desks.filter((d) => d.status === "occupied").length;
  const available = desks.length - occupied;
  const rate = desks.length ? Math.round((occupied / desks.length) * 100) : 0;

  return {
    sensorId: raw.SENSOR,
    recordId: raw._id,
    timestamp: raw.TIME ? new Date(raw.TIME * 1000) : new Date(),
    count: raw.COUNT ?? desks.length,
    desks,
    occupied,
    available,
    rate,
  };
}

function prettifySeatName(key) {
  // "Ground_Floor_Workstation_Seat_1" -> "Ground Floor · Seat 1"
  const seatMatch = key.match(/Seat_(\d+)$/i);
  const seatNumber = seatMatch ? seatMatch[1] : null;
  const floor = key.replace(/_Workstation_Seat_\d+$/i, "").replace(/_/g, " ");
  return seatNumber ? `${floor} · Seat ${seatNumber}` : key.replace(/_/g, " ");
}