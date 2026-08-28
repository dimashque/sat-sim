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
  const points = useMemo(() => {
    if (!satrec) return [];
    return computeOrbitTrail(satrec).map((p) => latLonAltToVector3(p.lat, p.lon, p.alt));
  }, [satrec]);

  if (points.length < 2) return null;

  const positionsArray = new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]));

  return (
    // key forces React to fully unmount/remount this <line> whenever the
    // satellite changes, guaranteeing a brand new Three.js geometry object
    // rather than an in-place update -- sidesteps any stale-buffer issues.
    <line key={satrec.satnum} frustumCulled={false}>
      <bufferGeometry
        // onUpdate fires after R3F applies the attribute -- we use it to
        // explicitly recompute the bounding sphere, since frustum culling
        // (even with frustumCulled=false here, this matters for anything
        // else relying on accurate bounds) depends on it being current.
        onUpdate={(geometry) => geometry.computeBoundingSphere()}
      >
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={positionsArray}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="cyan" transparent opacity={0.6} />
    </line>
  );
}