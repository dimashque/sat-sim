import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Earth from "./Earth";
import Satellites from "./Satellites";

export default function Scene({ positions }) {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      {/* Basic lighting: ambient so the dark side of Earth isn't pure
          black, directional to simulate the sun and give the sphere
          visible shading/depth. */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />

      <Suspense fallback={null}>
        <Earth />
        {/* key={positions.length} forces a remount when satellite count
            changes, working around InstancedMesh's fixed instance count
            mentioned above. */}
        <Satellites key={positions.length} positions={positions} />
      </Suspense>

      <Stars radius={50} depth={50} count={3000} factor={2} fade />
      <OrbitControls enableDamping dampingFactor={0.05} minDistance={1.2} maxDistance={10} />
    </Canvas>
  );
}