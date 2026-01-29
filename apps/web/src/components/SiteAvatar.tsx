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
    const [targetX, setTargetX] = useState(-7); // Start VERY far left

    // Load VRM
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser: any) => new VRMLoaderPlugin(parser));

        loader.load('/hakusan-avatar.vrm', (gltf: any) => {
            const vrm = gltf.userData.vrm as VRM;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.deepDispose(gltf.scene);

            vrm.scene.rotation.y = 0;
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
        if (Math.random() < 0.01) {
            const actions: ('walk' | 'idle' | 'wave' | 'peace')[] = ['walk', 'walk', 'idle', 'wave'];
            const next = actions[Math.floor(Math.random() * actions.length)];

            if (action !== 'walk' && next === 'walk') {
                setAction('walk');
                // Restrict movement to LEFT side only (-8 to -3) to avoid center content
                setTargetX((Math.random() * 5) - 8);
            } else if (action === 'walk' && Math.abs(targetX - (sceneRef.current?.position.x || 0)) < 0.5) {
                setAction('idle');
            } else if (action !== 'walk') {
                setAction(next);
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
                // Walking Animation
                const walkSpeed = 5.5;
                const cycle = t * walkSpeed;

                const armAmp = 0.3;
                rightUpperArm.rotation.z = 1.2;
                leftUpperArm.rotation.z = -1.2;
                rightUpperArm.rotation.x = Math.sin(cycle + Math.PI) * armAmp;
                leftUpperArm.rotation.x = Math.sin(cycle) * armAmp;

                // Legs Logic
                const legAmp = 0.7;
                if (rightUpperLeg && leftUpperLeg) {
                    // Hip Rotation
                    rightUpperLeg.rotation.x = Math.sin(cycle + Math.PI) * legAmp;
                    leftUpperLeg.rotation.x = Math.sin(cycle) * legAmp;
                }

                // Knee Logic (The Fix)
                // "Toe should come out before knee" -> Knee needs to EXTEND (0) as leg swings forward.
                // Standard Walk Phase:
                // Hip Swing Forward (0 to PI/2 phase): Knee should be straightening.
                // Hip Max Forward (Heel Strike): Knee should be fully straight (0).

                // My Hip Logic:
                // Left Leg = sin(cycle). Max Forward at PI/2.
                // Right Leg = sin(cycle + PI). Max Forward at 3PI/2 (or -PI/2).

                // Previous Logic: -Math.max(0, sin(cycle)*1.2)
                // Left Leg: Max sin(cycle) is at PI/2. Max(0, 1) = 1. So it was BENDING (-1.2) at max forward!
                // This explains "Knees are weird". It was bending EXACTLY when it should form a straight line for contact.

                // Fix:
                // Knee should bend when leg is lifting (Hip Back -> Front mid-swing).
                // Or simply: Bend when leg is NOT forward.
                // Let's use phase shift.
                // We want Knee = 0 when sin(cycle) = 1 (Max Forward).
                // We want Knee = Bent value when sin(cycle) is ... maybe negative (Leg Back)? 
                // Actually proper cycle:
                // Hip Back (Lift) -> Knee Bends.
                // Hip Swing (Forward) -> Knee Straightens.
                // Hip Forward (Contact) -> Knee Straight.

                // Try: Knee follows Hip but clamped?
                // If Hip is positive (Forward), Knee should be 0.
                // If Hip is negative (Back), Knee can bend.

                // Let's try: Bend = -Math.max(0, -sin(cycle))?
                // Left Leg Hip = sin(cycle). 
                // If we use -sin(cycle), it is positive when Hip is Back (negative).
                // So max(0, -sin) bends the knee when leg is back.
                // And when leg is forward (sin > 0), max(0, negative) is 0 -> Straight Knee!

                // Wait, "Back" leg is pushing off. Push off leg is straight-ish.
                // Leg bending happens during the SWING phase (moving from back to front).
                // Swing happens when sin(cycle) goes from -1 to 1.
                // That is cos(cycle) peak?

                // Let's try the simple fix first:
                // Bend knee when leg is BACK (-sin > 0).
                // Straighten when leg is FORWARD (sin > 0).
                // This matches "Toe comes out" (Straight leg swings forward).

                const kneeBendAmp = 1.0;

                // Left Leg: Hip = sin(cycle).
                // We want bend when sin is negative (Back) or transitioning.
                // Actually, let's try phase shifting the bend to get that "kick" feel.
                // Kick comes just before full extension.
                // Using -Math.max(0, -sin(cycle)) means:
                // - Leg Back: Knee Bent.
                // - Leg Forwarding: Knee Straightens.
                // - Leg Forward: Knee Straight.
                // This sounds correct for the "Toe out" visual.

                if (rightLowerLeg && leftLowerLeg) {
                    // Right Hip: sin(cycle + PI) = -sin(cycle).
                    // So Right Leg Back when -sin(cycle) < 0 => sin(cycle) > 0.
                    // Bend when sin(cycle) > 0.

                    rightLowerLeg.rotation.x = -Math.max(0, Math.sin(cycle) * kneeBendAmp);

                    // Left Hip: sin(cycle).
                    // Bend when sin(cycle) < 0.
                    leftLowerLeg.rotation.x = -Math.max(0, -Math.sin(cycle) * kneeBendAmp);
                }

                if (spine) spine.rotation.y = Math.sin(cycle) * 0.08;

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

        // Walking Movement Logic
        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const moveSpeed = 1.5 * delta; // Slightly faster to match kick

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * moveSpeed;

                const turn = dist > 0 ? Math.PI / 2 : -Math.PI / 2;
                sceneRef.current.rotation.y = turn;

                const walkCycle = state.clock.elapsedTime * 5.5;
                sceneRef.current.position.y = -1.0 + Math.abs(Math.cos(walkCycle)) * 0.04;
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
        if (sceneRef.current) sceneRef.current.rotation.y = 0;
    };

    return vrm ? (
        <group ref={sceneRef} position={[-7, -1.0, 0]}>
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
            <Canvas camera={{ position: [0, 0.8, 8.5], fov: 20 }} gl={{ alpha: true }}>
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <AvatarModel />
            </Canvas>
        </div>
    );
};
