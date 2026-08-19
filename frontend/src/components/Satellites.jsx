import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Converts geodetic coordinates into a Three.js scene position.
// This is separate/exported logic (not inlined) because it's pure math, can be reused 

function latLonAltToVector3(lat, lon, altKm, earthRadius = 1) {
  // Altitude is scaled relative to Earth's *visual* radius (1 unit) using
  // the real ratio of alt-to-Earth-radius (6371km), so satellites sit at
  // proportionally correct heights rather than an arbitrary fixed offset.
  const r = earthRadius * (1 + altKm / 6371);
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// Why InstancedMesh instead of a <mesh> per satellite: rendering, say, 500
// separate mesh objects means 500 separate draw calls -- a serious GPU
// bottleneck. InstancedMesh draws all of them in a single draw call by
// reusing one geometry/material and just updating each instance's transform
// matrix. This is the standard technique for "many identical small objects."
export default function Satellites({ positions }) {
    console.log("Satellites received:", positions.length, positions[0]);
  const meshRef = useRef();

  // dummy is a scratch object reused every frame to compute a transform
  // matrix, rather than allocating a new Object3D per satellite per frame
  // (which would pressure the garbage collector needlessly).
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    positions.forEach((sat, i) => {
      const pos = latLonAltToVector3(sat.lat, sat.lon, sat.alt);
      dummy.position.copy(pos);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    // Required after updating instance matrices, or Three.js won't
    // re-upload the new transforms to the GPU.
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, positions.length]}
      frustumCulled={false} // prevents satellites near screen edges from popping out incorrectly
    >
      <sphereGeometry args={[0.005,8, 8]} />
      <meshBasicMaterial color="orange" />
    </instancedMesh>
  );
}