"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader (Tanh + Wavy Background)
const fragmentShader = `
  uniform float u_time;
  varying vec2 vUv;

  float tanhFunction(float x, float k) {
    return 1.0 - 2.0 / (1.0 + exp(2.0 * x * k));
  }

  float waveFunction(float x, float time) {
    return sin(8.0 * x + time * 2.0) * 0.2 + sin(4.0 * x + time * 1.5) * 0.1;
  }

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;  // Normalize UV space (-1 to 1)

    float distortion = waveFunction(p.x, u_time);  // Apply wavy effect
    float smoothFactor = 3.5;  // Adjust smoothness of the transition
    float color = tanhFunction(p.y + distortion, smoothFactor); // Wavy tanh

    gl_FragColor = vec4(vec3(0.4 + 0.6 * color), 1.0);
  }
`;

const TanhShaderEffect = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} /> {/* Fullscreen quad */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ u_time: { value: 0 } }}
      />
    </mesh>
  );
};

const TanhShaderCanvas = () => (
  <Canvas
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: "-1", // Ensures it's behind content
    }}
    camera={{ position: [0, 0, 1] }}
  >
    <TanhShaderEffect />
  </Canvas>
);

export default TanhShaderCanvas;