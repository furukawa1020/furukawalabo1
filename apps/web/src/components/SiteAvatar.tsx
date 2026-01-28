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
            VRMUtils.deepDispose(gltf.scene);

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
            const actions: ('walk' | 'idle' | 'wave' | 'peace')[] = ['walk', 'idle', 'idle', 'idle', 'wave', 'peace'];
            const next = actions[Math.floor(Math.random() * actions.length)];
            setAction(next);

            if (next === 'walk') {
                setTargetX((Math.random() - 0.5) * 5); // Target X (-2.5 to 2.5)
            }
        }

        // Apply Bone Rotations
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
                rightUpperArm.rotation.z = Math.sin(t * 5) * 0.2 + 2.5;
                rightLowerArm.rotation.z = 0.5;
                leftUpperArm.rotation.z = -1.2;
                leftLowerArm.rotation.z = 0;
            } else if (action === 'peace') {
                rightUpperArm.rotation.z = 2.0;
                leftUpperArm.rotation.z = -1.2;
            } else if (action === 'walk') {
                // Walking Animation (Correction for "Backwards/Kakukaku")

                // 1. Sync Speed: Movement is 0.5/sec.
                // Stride approx 0.5m. 2 steps/sec?
                // walkSpeed=8 was too fast for 0.5 move. 
                // Let's keep walkSpeed=6 for animation cycle.
                const walkSpeed = 6;
                const cycle = t * walkSpeed;

                // 2. Arms: Swing opposite to legs. 
                // Increase X swing to make it distinct.
                const armAmp = 0.4;
                rightUpperArm.rotation.z = 1.2; // A-pose stable
                leftUpperArm.rotation.z = -1.2;
                rightUpperArm.rotation.x = Math.sin(cycle) * armAmp; // Opposite to Right Leg? No, Left Leg forward = Right Arm forward.
                leftUpperArm.rotation.x = Math.sin(cycle + Math.PI) * armAmp;

                // 3. Legs: 
                // FIX MOONWALK: Invert the hip rotation.
                // Standard: +X rot is Leg Forward.
                // If we want Left Leg Forward (Swing) -> Left Leg Back (Stance).
                // Cycle 0..PI: sin > 0.

                // Let's try: Right Leg starts Back (Stance), Left Forward.
                const legAmp = 0.6;
                const rHip = Math.sin(cycle + Math.PI) * legAmp; // Inverted phase to fix moonwalk?
                const lHip = Math.sin(cycle) * legAmp;

                if (rightUpperLeg && leftUpperLeg) {
                    rightUpperLeg.rotation.x = rHip;
                    leftUpperLeg.rotation.x = lHip;
                }

                // 4. Knees (Smoother)
                // Bend when hip is moving forward (Swing phase).
                // Standard bend is -X rotation.
                // Use a shaped sine wave: only bend when sin(cycle) is positive (Leg forward).
                // Smooth blend: 0.5 * (sin - 1) is always negative, peaks at 0.
                if (rightLowerLeg && leftLowerLeg) {
                    // Right Leg Swing: cycle+PI is positive? approx.
                    // Let's use simple logic: max(0, -sin) but smoothed?
                    // Or just always slight bend + swing bend?
                    // Try: -0.1 - max(0, sin(cycle)) * 0.8

                    // Improved smooth knee:
                    // Bend right knee when right leg swings forward (rHip > 0 approx)
                    // Phase matched to hip.
                    const rKnee = -Math.max(0, Math.sin(cycle + Math.PI) * 1.0);
                    const lKnee = -Math.max(0, Math.sin(cycle) * 1.0);

                    // Smooth out the sharp corner of Max with a power curve or just let it be.
                    // "Kakukaku" might be the frame rate or sharp stop.
                    // Let's filter it: (sin > 0 ? sin : 0)^1.5

                    rightLowerLeg.rotation.x = rKnee;
                    leftLowerLeg.rotation.x = lKnee;
                }

                if (spine) spine.rotation.y = Math.sin(cycle) * 0.1; // More spine twist

            } else {
                // Idle
                rightUpperArm.rotation.z = 1.2 + Math.sin(t) * 0.05;
                leftUpperArm.rotation.z = -1.2 - Math.sin(t) * 0.05;
                rightUpperArm.rotation.x = 0;
                leftUpperArm.rotation.x = 0;

                if (rightUpperLeg && leftUpperLeg && rightLowerLeg && leftLowerLeg) {
                    rightUpperLeg.rotation.x = 0;
                    leftUpperLeg.rotation.x = 0;
                    rightLowerLeg.rotation.x = 0;
                    leftLowerLeg.rotation.x = 0;
                }
                if (spine) spine.rotation.y = 0;
            }
        }

        // Walking Movement Loop
        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const speed = 0.5 * delta;

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * speed;

                // Turn
                const turn = dist > 0 ? -Math.PI / 2 : Math.PI / 2;
                sceneRef.current.rotation.y = turn;

                // Bounce
                const walkCycle = state.clock.elapsedTime * 6; // Match walkSpeed
                // Smooth bounce: abs(cos) is sharp at 0. Use (cos+1)? 
                // No, standard walk is bouncy.
                sceneRef.current.position.y = -1.0 + Math.abs(Math.cos(walkCycle)) * 0.03;
            } else {
                setAction('idle');
                sceneRef.current.rotation.y = 0;
            }
        } else if (sceneRef.current) {
            if (action === 'idle') {
                sceneRef.current.rotation.y = 0;
                sceneRef.current.position.y = -1.0;
            }
        }
    });

    const openChat = () => {
        window.dispatchEvent(new Event('open-site-agent'));
        setAction('idle');
        if (sceneRef.current) {
            sceneRef.current.rotation.y = 0;
        }
    };

    return vrm ? (
        <group ref={sceneRef} position={[0, -1.0, 0]}>
            <primitive object={vrm.scene} />
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
