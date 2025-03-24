import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Physics, usePlane, useSphere } from "@react-three/cannon"
import { EffectComposer, SSAO, NormalPass } from "@react-three/postprocessing"
import { useGLTF } from "@react-three/drei"


export default function App() {
  return (
    <Canvas
      shadows
      gl={{ stencil: false, antialias: true }}
      camera={{
        position: [0, 0, 20], // Fixed position
        fov: 50,             // Field of view
        near: 1,             // Near clipping plane
        far: 100,            // Far clipping plane
      }}
      onCreated={({ gl, camera }) => {
        const { width, height } = gl.domElement;
        camera.aspect = width / height; // Lock aspect ratio
        camera.updateProjectionMatrix();
      }}
    >
      <fog attach="fog" args={["red", 25, 35]} />
      <color attach="background" args={["#feef8a"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />
      <directionalLight
        castShadow
        intensity={6}
        position={[50, 50, 25]}
        shadow-mapSize={[256, 256]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Physics gravity={[0, -50, 0]} defaultContactMaterial={{ restitution: 0.5 }}>
        <group position={[0, 0, -10]}>
          <Mouse />
          <Borders />
          <InstancedDucks />
        </group>
      </Physics>
      <EffectComposer>
        <SSAO radius={0.4} intensity={50} luminanceInfluence={0.4} color="red" />
      </EffectComposer>
    </Canvas>
  )
}




function InstancedDucks({ count = 200 }) {
  const viewport = { width: 26, height: 18 }; // Hardcoded viewport dimensions
  console.log(viewport.width, viewport.height);
  const [ref] = useSphere((index) => ({
    mass: 300,
    position: [4 - Math.random() * 8, viewport.height, 0],
    args: [1.2],
  }));

  // Load the duck model
  const duckPath = `${process.env.PUBLIC_URL}/Duck.glb`;
  const { scene } = useGLTF(duckPath);

  if (!scene) return null; // Ensure the model is loaded before rendering

  // Traverse the scene to find the mesh
  let duckMesh = null;
  scene.traverse((child) => {
    if (child.isMesh) {
      duckMesh = child;
    }
  });
  duckMesh.geometry.scale(2, 2, 2); // Scale the geometry

  if (!duckMesh) {
    console.error("No mesh found in the duck model!");
    return null;
  }

  return (
    <instancedMesh ref={ref} castShadow receiveShadow args={[duckMesh.geometry, null, count]}>
      <meshStandardMaterial attach="material" {...duckMesh.material} />
    </instancedMesh>
  );
}

function Borders() {
  const { viewport } = useThree()
  return (
    <>
      <Plane position={[0, -viewport.height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <Plane position={[-viewport.width / 2 - 1, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Plane position={[viewport.width / 2 + 1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Plane position={[0, 0, -1]} rotation={[0, 0, 0]} />
      <Plane position={[0, 0, 12]} rotation={[0, -Math.PI, 0]} />
    </>
  )
}

function Plane({ color, ...props }) {
  usePlane(() => ({ ...props }))
  return null
}

function Mouse() {
  const { viewport } = useThree()
  const [, api] = useSphere(() => ({ type: "Kinematic", args: [6] }))
  return useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 7))
}
