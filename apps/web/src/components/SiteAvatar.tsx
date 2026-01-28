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
            // Pick a random action occasionally behavior
            // If currently walking, don't interrupt too abruptly unless it's a stop

            // Bias towards idle
            const actions: ('walk' | 'idle' | 'wave' | 'peace')[] = ['walk', 'idle', 'idle', 'idle', 'wave', 'peace'];
            const next = actions[Math.floor(Math.random() * actions.length)];

            // If we are already interacting (chat open?), maybe we should stay idle?
            // For now, just randomness.
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
        const rightLowerLeg = vrm.humanoid.getRawBoneNode('rightLowerLeg' as any);
        const leftLowerLeg = vrm.humanoid.getRawBoneNode('leftLowerLeg' as any);
        const spine = vrm.humanoid.getRawBoneNode('spine' as any);

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
                // Walking Animation (Natural Stroll)
                const walkSpeed = 5; // Relaxed stroll speed
                const stepCycle = t * walkSpeed;

                // Arms: Swing opposite to legs, small amplitude
                rightUpperArm.rotation.z = 1.2 + Math.sin(stepCycle) * 0.15;
                rightUpperArm.rotation.x = -Math.sin(stepCycle) * 0.1;
                leftUpperArm.rotation.z = -1.2 + Math.sin(stepCycle) * 0.15;
                leftUpperArm.rotation.x = Math.sin(stepCycle) * 0.1;

                // Legs & Knees
                if (rightUpperLeg && leftUpperLeg && rightLowerLeg && leftLowerLeg) {
                    const rHip = Math.sin(stepCycle) * 0.5;
                    const lHip = Math.sin(stepCycle + Math.PI) * 0.5;

                    rightUpperLeg.rotation.x = rHip;
                    leftUpperLeg.rotation.x = lHip;

                    // Knee Bend (Simple approximation: Bend on backward swing or lift)
                    // Let's bend when lifting (hip forward/up)
                    rightLowerLeg.rotation.x = -Math.max(0, -Math.cos(stepCycle) * 1.5);
                    leftLowerLeg.rotation.x = -Math.max(0, -Math.cos(stepCycle + Math.PI) * 1.5);
                }

                // Spine
                if (spine) spine.rotation.y = Math.sin(stepCycle) * 0.05;

            } else {
                // Idle breathing
                rightUpperArm.rotation.z = 1.2 + Math.sin(t) * 0.05;
                leftUpperArm.rotation.z = -1.2 - Math.sin(t) * 0.05;

                // Reset legs
                if (rightUpperLeg && leftUpperLeg && rightLowerLeg && leftLowerLeg) {
                    rightUpperLeg.rotation.x = 0;
                    leftUpperLeg.rotation.x = 0;
                    rightLowerLeg.rotation.x = 0;
                    leftLowerLeg.rotation.x = 0;
                }

                rightLowerArm.rotation.z = 0;
                leftLowerArm.rotation.z = 0;
                if (spine) spine.rotation.y = 0;
            }
        }

        // Walking Movement
        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const speed = 0.5 * delta;

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * speed;

                // Face direction
                const turn = dist > 0 ? -Math.PI / 2 : Math.PI / 2;
                sceneRef.current.rotation.y = turn;

                // Bobbing (Synced)
                const walkCycle = state.clock.elapsedTime * 5;
                const bobble = Math.abs(Math.cos(walkCycle)) * 0.05;
                sceneRef.current.position.y = -1.0 + bobble;
            } else {
                setAction('idle');
                sceneRef.current.rotation.y = 0; // Face front
            }
        } else if (sceneRef.current) {
            if (action === 'idle') {
                sceneRef.current.rotation.y = 0; // Ensure facing front if idle
                sceneRef.current.position.y = -1.0;
            }
        }
    });

    const openChat = () => {
        window.dispatchEvent(new Event('open-site-agent'));
        // Stop the avatar and face front
        setAction('idle');
        if (sceneRef.current) {
            sceneRef.current.rotation.y = 0;
        }
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
