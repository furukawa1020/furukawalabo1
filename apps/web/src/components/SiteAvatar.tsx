import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
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

            vrm.scene.rotation.y = 0; // Face camera
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
        const rightUpperLeg = vrm.humanoid.getRawBoneNode('rightUpperLeg' as any);
        const leftUpperLeg = vrm.humanoid.getRawBoneNode('leftUpperLeg' as any);

        if (rightUpperArm && rightLowerArm && leftUpperArm && leftLowerArm) {
            const t = state.clock.elapsedTime;

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
            } else if (action === 'walk') {
                // Walking Animation (Strolling)
                // Arms swing opposite to legs
                const speed = 8; // Slower, more relaxed
                rightUpperArm.rotation.z = 1.2 + Math.sin(t * speed) * 0.08;
                leftUpperArm.rotation.z = -1.2 + Math.sin(t * speed) * 0.08;

                // Legs move (X rotation for forward/back)
                if (rightUpperLeg && leftUpperLeg) {
                    rightUpperLeg.rotation.x = Math.sin(t * speed) * 0.3; // Smaller steps
                    leftUpperLeg.rotation.x = Math.sin(t * speed + Math.PI) * 0.3;
                }
            } else {
                // Idle breathing
                rightUpperArm.rotation.z = 1.2 + Math.sin(t) * 0.05;
                leftUpperArm.rotation.z = -1.2 - Math.sin(t) * 0.05;

                // Reset legs
                if (rightUpperLeg && leftUpperLeg) {
                    rightUpperLeg.rotation.x = 0;
                    leftUpperLeg.rotation.x = 0;
                }

                rightLowerArm.rotation.z = 0;
                leftLowerArm.rotation.z = 0;
            }
        }

        // Walking Movement
        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const speed = 0.5 * delta; // Slower movement speed

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * speed;

                // Face direction
                const turn = dist > 0 ? -Math.PI / 2 : Math.PI / 2;
                sceneRef.current.rotation.y = turn;

                // Bobbing (fake walk cycle)
                sceneRef.current.position.y = -1.0 + Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.03;
            } else {
                setAction('idle');
                sceneRef.current.rotation.y = 0; // Face front (camera)
            }
        } else if (sceneRef.current) {
            sceneRef.current.position.y = -1.0; // Reset height
        }
    });

    const openChat = () => {
        window.dispatchEvent(new Event('open-site-agent'));
    };

    return vrm ? (
        <group ref={sceneRef} position={[0, -1.0, 0]}>
            <primitive object={vrm.scene} />
            {/* Hitbox for click interaction */}
            <Html position={[0, 1.0, 0]} center wrapperClass="pointer-events-auto">
                <div
                    onClick={openChat}
                    className="w-24 h-48 cursor-pointer"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    title="Click to chat"
                />
            </Html>
        </group>
    ) : null;
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
