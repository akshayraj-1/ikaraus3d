import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";


function Model({ url }) {
    console.log(url);
    const { scene } = useGLTF(url);
    return <primitive object={scene} scale={1} />;
}
function PreviewCard({ model }) {
    console.log(model);
    return (
        <div style={{ width: "100%", height: "400px" }}>
            <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[2, 2, 2]} />
                <Model url={model.url} />
                <OrbitControls />
            </Canvas>
        </div>
    );
}

export default PreviewCard;