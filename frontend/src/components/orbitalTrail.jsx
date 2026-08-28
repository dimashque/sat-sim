import { useMemo } from "react";
import * as THREE from "three";
import { computeOrbitTrail } from "../utils/orbitTrail";

// Reusing the same lat/lon/alt -> scene-position conversion used for
// satellite markers, so the trail lines up exactly with the dot.
function latLonAltToVector3(lat, lon, altKm, earthRadius = 1) {
  const r = earthRadius * (1 + altKm / 6371);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Renders the orbital path of a single satellite (typically the currently
// selected one -- see note below on why we don't do this for every
// satellite at once).
export default function OrbitTrail({ satrec }) {
  // useMemo here matters for the same reason as elsewhere: computing the
  // trail involves ~90 propagate() calls (45 min before + 45 min after at
  // 60s steps). Without memoization, this would re-run on every render
  // (e.g. every time the parent re-renders for unrelated reasons), which
  // is wasted work since the trail only needs to change when the
  // satellite itself changes.
  const points = useMemo(() => {
    if (!satrec) return [];
    return computeOrbitTrail(satrec).map((p) => latLonAltToVector3(p.lat, p.lon, p.alt));
  }, [satrec]);

  if (points.length < 2) return null; // need at least 2 points to draw a line

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          // Three.js buffer geometries want a flat Float32Array of
          // x,y,z,x,y,z,... rather than an array of Vector3 objects --
          // this flattens our points into that format.
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="cyan" linewidth={1} transparent opacity={0.6} />
    </line>
  );
}