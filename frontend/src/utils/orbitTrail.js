import * as satellite from "satellite.js";

/**
 * Computes each satellite's actual orbital period from its mean motion.
 *
 * satrec.no is the SGP4-internal mean motion, in radians per minute
 * (already unit-converted from the OMM's MEAN_MOTION field, which is in
 * revolutions/day). One full revolution is 2π radians, so dividing 2π by
 * the per-minute rate gives minutes per revolution -- the orbital period.
 *
 * This matters because a fixed guess like "90 minutes" is only roughly
 * right for low-Earth-orbit satellites (ISS-like). GPS satellites orbit
 * roughly every 12 hours, geostationary satellites roughly every 24 --
 * using a fixed window for those would show only a tiny sliver of their
 * actual orbit instead of a full loop.
 */
function orbitalPeriodMinutes(satrec) {
  return (2 * Math.PI) / satrec.no;
}

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
 * @param minutesBefore how far back in time to start the trail. Defaults
 *                      to half this satellite's own orbital period, so the
 *                      trail traces close to one full loop regardless of
 *                      whether it's a fast LEO satellite or a slow
 *                      geostationary one. Pass an explicit number to
 *                      override.
 * @param minutesAfter  same idea, forward in time.
 * @param stepSeconds   resolution -- smaller = smoother line, more points
 * @returns array of { lat, lon, alt } points, in chronological order
 */
export function computeOrbitTrail(
  satrec,
  { minutesBefore, minutesAfter, stepSeconds = 60 } = {}
) {
  // Default to half the satellite's real orbital period on each side,
  // covering one full loop total, unless the caller explicitly overrode it.
  const halfPeriod = orbitalPeriodMinutes(satrec) / 2;
  const before = minutesBefore ?? halfPeriod;
  const after = minutesAfter ?? halfPeriod;

  const points = [];
  const now = Date.now();
  const startMs = now - before * 60 * 1000;
  const endMs = now + after * 60 * 1000;

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