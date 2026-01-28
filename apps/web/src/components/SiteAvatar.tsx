import { Canvas, useFrame } from '@react-three/fiber';
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

const AvatarModel = () => {
    const [vrm, setVrm] = useState<VRM | null>(null);
    const sceneRef = useRef<THREE.Group>(null);
    const [action, setAction] = useState<'walk' | 'idle' | 'wave' | 'peace'>('idle');
    const [targetX, setTargetX] = useState(0);

    // Load VRM
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser: any) => new VRMLoaderPlugin(parser));

        loader.load('/hakusan-avatar.vrm', (gltf: any) => {
            const vrm = gltf.userData.vrm as VRM;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.deepDispose(gltf.scene); // Proper cleanup hook if needed, but here just setup
            // combineSkeletons is deprecated/removed in newer versions or handled differently.
            // Usually scene rotation is enough.
            // Usually scene rotation is enough.
            vrm.scene.rotation.y = 0; // Face camera (VRM +Z is front, Camera looks -Z... wait. VRM faces +Z. Camera at +Z looking -Z. So VRM +Z faces Camera.)
            // Actually standard VRM models face +Z relative to their local coords? No, usually +Z is forward in standard, but in Three.js +Z is out of screen.
            // If model faces +Z, and camera is at +Z, model is looking AT camera.
            // Previous code had Math.PI, which turned it around.
            setVrm(vrm);
        }, undefined, (error: any) => {
            console.error('Failed to load VRM:', error);
        });
    }, []);

    // Animation Loop
    useFrame((state, delta) => {
        if (!vrm) return;

        vrm.update(delta);

        // Basic "AI" Behavior Loop
        if (Math.random() < 0.005) {
            // Pick a random action occasionally
            const actions: ('walk' | 'idle' | 'wave' | 'peace')[] = ['walk', 'idle', 'idle', 'wave', 'peace']; // weighted
            const next = actions[Math.floor(Math.random() * actions.length)];
            setAction(next);

            if (next === 'walk') {
                setTargetX((Math.random() - 0.5) * 5); // Random position between -2.5 and 2.5
            }
        }

        // Apply Bone Rotations based on Action
        // Cast to 'any' to bypass TS enum check if needed, or better, use string literals cast to VRMHumanBoneName
        const rightUpperArm = vrm.humanoid.getRawBoneNode('rightUpperArm' as any);
        const rightLowerArm = vrm.humanoid.getRawBoneNode('rightLowerArm' as any);
        const leftUpperArm = vrm.humanoid.getRawBoneNode('leftUpperArm' as any);
        const leftLowerArm = vrm.humanoid.getRawBoneNode('leftLowerArm' as any);

        if (rightUpperArm && rightLowerArm && leftUpperArm && leftLowerArm) {
            const t = state.clock.elapsedTime;

            // Default: Arms down (A-pose / Idle)
            // VRM T-pose: Arms are at Z=0? 
            // To put arms down: Rotate Z approx -1.2 (Right) and +1.2 (Left)

            if (action === 'wave') {
                // Wave Right Hand
                rightUpperArm.rotation.z = Math.sin(t * 5) * 0.2 + 2.5; // High up
                rightLowerArm.rotation.z = 0.5;

                // Left arm idle
                leftUpperArm.rotation.z = -1.2;
                leftLowerArm.rotation.z = 0;

            } else if (action === 'peace') {
                // Peace Pose
                rightUpperArm.rotation.z = 2.0;
                leftUpperArm.rotation.z = -1.2;

            } else {
                // Idle / Walk
                // Swing arms slightly
                rightUpperArm.rotation.z = 1.2 + Math.sin(t * 2) * 0.05; // ~70 degrees down
                leftUpperArm.rotation.z = -1.2 - Math.sin(t * 2) * 0.05; // ~70 degrees down

                rightLowerArm.rotation.z = 0;
                leftLowerArm.rotation.z = 0;
            }
        }

        // Walking Movement
        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const speed = 1.0 * delta;

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * speed;
                // Face direction: 
                // TargetX > CurrentX (Positive) -> Move Right -> Turn Right (Face -X?) 
                // Default Face +Z. Turn 90deg (PI/2) to Face +X (Right) or -X (Left)?
                // ThreeJS Right is +X. Left is -X.
                // If standard model faces +Z. Rotation Y -PI/2 faces +X?
                // Let's just try turning towards movement.
                const turn = dist > 0 ? -Math.PI / 2 : Math.PI / 2;
                sceneRef.current.rotation.y = turn;

                // Bobbing (fake walk cycle)
                sceneRef.current.position.y = -1.0 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05;
            } else {
                setAction('idle');
                sceneRef.current.rotation.y = 0; // Face front (camera)
            }
        } else if (sceneRef.current) {
            sceneRef.current.position.y = -1.0; // Reset height
        }
    });

    return vrm ? <primitive object={vrm.scene} ref={sceneRef} position={[0, -1.0, 0]} /> : null;
};

export const SiteAvatar = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-[200px] pointer-events-none z-30" style={{ pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0.8, 6.5], fov: 30 }} gl={{ alpha: true }}>
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <AvatarModel />
            </Canvas>
        </div>
    );
};
