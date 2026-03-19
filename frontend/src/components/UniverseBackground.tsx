import React from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, OrbitControls } from "@react-three/drei";

interface UniverseBackgroundProps {
  children: React.ReactNode;
}

const UniverseBackground: React.FC<UniverseBackgroundProps> = ({ children }) => {
  return (
    <section className="universe-background">
      {/* 3D Universe Background */}
      <div className="universe-canvas-wrapper">
        <Canvas 
          camera={{ position: [0, 0, 10] }}
          style={{ background: '#000000' }}
          gl={{ alpha: false }}
        >
          <ambientLight intensity={0.5} />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="universe-content">{children}</div>
    </section>
  );
};

export default UniverseBackground;
