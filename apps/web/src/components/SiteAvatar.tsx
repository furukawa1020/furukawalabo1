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
            vrm.scene.rotation.y = Math.PI; // Face forward
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
        // Check if bones exist before rotating
        // Cast to 'any' to bypass TS enum check if needed, or better, use string literals cast to VRMHumanBoneName
        const rightUpperArm = vrm.humanoid.getRawBoneNode('rightUpperArm' as any);
        const rightLowerArm = vrm.humanoid.getRawBoneNode('rightLowerArm' as any);

        if (rightUpperArm && rightLowerArm) {
            const t = state.clock.elapsedTime;

            if (action === 'wave') {
                // Wave Right Hand
                rightUpperArm.rotation.z = Math.sin(t * 5) * 0.2 + 2.5;
                rightLowerArm.rotation.z = 0.5;
            } else if (action === 'peace') {
                // Peace Pose (Static-ish)
                rightUpperArm.rotation.z = 2.0;
            } else {
                // Reset
                rightUpperArm.rotation.z = Math.sin(t) * 0.05 + 1.3; // Idle arm swing
            }
        }

        // Walking Movement
        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const speed = 1.0 * delta;

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * speed;
                // Face direction
                sceneRef.current.rotation.y = Math.PI + (Math.sign(dist) * Math.PI / 4);

                // Bobbing (fake walk cycle)
                sceneRef.current.position.y = -0.8 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05;
            } else {
                setAction('idle');
                sceneRef.current.rotation.y = Math.PI; // Face front
            }
        } else if (sceneRef.current) {
            sceneRef.current.position.y = -0.8; // Reset height
        }
    });

    return vrm ? <primitive object={vrm.scene} ref={sceneRef} position={[0, -0.8, 0]} /> : null;
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
