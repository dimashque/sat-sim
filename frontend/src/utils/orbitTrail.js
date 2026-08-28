import * as satellite from "satellite.js";

/**
 * Computes a series of lat/lon/alt points tracing a satellite's orbit
 * across a window of time centered on "now" -- used to draw a visual
 * trail showing where the satellite has been and where it's headed.
 *
 * Why centered on "now" rather than only future or only past: it reads
 * naturally on screen as "this is the satellite's orbital path," with the
 * current position (rendered separately by Satellites.jsx) sitting
 * somewhere along the middle of the line.
 *
 * @param satrec        parsed orbit record from satellite.json2satrec()
 * @param minutesBefore how far back in time to start the trail
 * @param minutesAfter  how far forward in time to extend the trail
 * @param stepSeconds   resolution -- smaller = smoother line, more points
 * @returns array of { lat, lon, alt } points, in chronological order
 */
export function computeOrbitTrail(
  satrec,
  { minutesBefore = 45, minutesAfter = 45, stepSeconds = 60 } = {}
) {
  const points = [];
  const now = Date.now();
  const startMs = now - minutesBefore * 60 * 1000;
  const endMs = now + minutesAfter * 60 * 1000;

  for (let t = startMs; t <= endMs; t += stepSeconds * 1000) {
    const time = new Date(t);
    const pv = satellite.propagate(satrec, time);
    if (!pv.position) continue; // propagation failed at this instant -- skip rather than break the line

    const gmst = satellite.gstime(time);
    const geo = satellite.eciToGeodetic(pv.position, gmst);

    points.push({
      lat: satellite.degreesLat(geo.latitude),
      lon: satellite.degreesLong(geo.longitude),
      alt: geo.height,
    });
  }

  return points;
}