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

    // Responsive Logic: Center (0.0) on Mobile, Left (-4.5) on Desktop
    const getBaseX = () => (window.innerWidth < 768 ? 0.0 : -4.5);
    const [baseX, setBaseX] = useState(getBaseX());
    const [targetX, setTargetX] = useState(getBaseX());

    const tailBonesRef = useRef<THREE.Object3D[]>([]);

    useEffect(() => {
        const handleResize = () => {
            const newBase = getBaseX();
            setBaseX(newBase);
            // If idle, snap to new base. If walking, we might want to respect it but let's just reset for simplicity.
            if (action === 'idle') setTargetX(newBase);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [action]);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser: any) => new VRMLoaderPlugin(parser));

        loader.load('/hakusan-avatar.vrm', (gltf: any) => {
            const vrm = gltf.userData.vrm as VRM;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.deepDispose(gltf.scene);
            vrm.scene.rotation.y = 0;

            // Find ALL Tail Bones (Tail1, Tail2, Shippo, etc.)
            tailBonesRef.current = [];
            vrm.scene.traverse((obj) => {
                const name = obj.name.toLowerCase();
                if (name.includes('tail') || name.includes('shippo')) {
                    console.log("Found Tail Bone:", obj.name);
                    tailBonesRef.current.push(obj);
                }
            });

            setVrm(vrm);
        }, undefined, (error: any) => {
            console.error('Failed to load VRM:', error);
        });
    }, []);

    useFrame((state, delta) => {
        if (!vrm) return;
        vrm.update(delta);

        // Random Action Logic
        if (Math.random() < 0.01) {
            const actions: ('walk' | 'idle' | 'wave' | 'peace')[] = ['walk', 'walk', 'idle', 'wave'];
            const next = actions[Math.floor(Math.random() * actions.length)];

            if (action !== 'walk' && next === 'walk') {
                setAction('walk');
                // Walk Range: strict around base
                // Mobile: -1.0 to 1.0. Desktop: -5.0 to -3.0.
                const range = 1.0;
                setTargetX(baseX + (Math.random() * range * 2 - range));
            } else if (action === 'walk' && Math.abs(targetX - (sceneRef.current?.position.x || 0)) < 0.2) {
                setAction('idle');
            } else if (action !== 'walk') {
                setAction(next);
            }
        }

        const rightUpperArm = vrm.humanoid.getRawBoneNode('rightUpperArm' as any);
        const rightLowerArm = vrm.humanoid.getRawBoneNode('rightLowerArm' as any);
        const leftUpperArm = vrm.humanoid.getRawBoneNode('leftUpperArm' as any);
        const leftLowerArm = vrm.humanoid.getRawBoneNode('leftLowerArm' as any);
        const rightUpperLeg = vrm.humanoid.getRawBoneNode('rightUpperLeg' as any);
        const leftUpperLeg = vrm.humanoid.getRawBoneNode('leftUpperLeg' as any);
        const rightLowerLeg = vrm.humanoid.getRawBoneNode('rightLowerLeg' as any);
        const leftLowerLeg = vrm.humanoid.getRawBoneNode('leftLowerLeg' as any);
        const rightHand = vrm.humanoid.getRawBoneNode('rightHand' as any);
        const leftHand = vrm.humanoid.getRawBoneNode('leftHand' as any);
        const spine = vrm.humanoid.getRawBoneNode('spine' as any);

        // Tail Animation (Chain)
        if (tailBonesRef.current.length > 0) {
            const t = state.clock.elapsedTime;
            tailBonesRef.current.forEach((bone, index) => {
                const speed = action === 'walk' ? 8.0 : 2.0;
                const amp = action === 'walk' ? 0.15 : 0.05;
                const offset = index * 0.5; // Wave lag

                // Base Droop (Curve down)
                const baseDroop = -0.4;

                bone.rotation.x = baseDroop + Math.sin(t * speed - offset) * (amp * 0.5);
                bone.rotation.y = Math.cos(t * speed - offset) * amp;
                bone.rotation.z = Math.sin(t * speed - offset) * (amp * 0.2);
            });
        }

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
                const walkSpeed = 5.5;
                const cycle = t * walkSpeed;

                const armAmp = 0.15; // Reduced swing (0.3 -> 0.15)
                // Relax arms closer to body
                rightUpperArm.rotation.z = 1.4;
                leftUpperArm.rotation.z = -1.4;
                rightUpperArm.rotation.x = Math.sin(cycle + Math.PI) * armAmp;
                leftUpperArm.rotation.x = Math.sin(cycle) * armAmp;

                // Elbow Bend & Twist
                if (rightLowerArm && leftLowerArm) {
                    rightLowerArm.rotation.z = 0.1;
                    leftLowerArm.rotation.z = -0.1;
                    rightLowerArm.rotation.y = -0.5;
                    leftLowerArm.rotation.y = 0.5;
                }

                // Hand Rotation (Fix "Line" look)
                if (rightHand && leftHand) {
                    rightHand.rotation.x = -0.2;
                    leftHand.rotation.x = -0.2;
                }

                const legAmp = 0.8; // Reduced for modesty
                if (rightUpperLeg && leftUpperLeg) {
                    rightUpperLeg.rotation.x = Math.sin(cycle + Math.PI) * legAmp;
                    leftUpperLeg.rotation.x = Math.sin(cycle) * legAmp;
                }

                const kneeBendAmp = 0.4; // Kept low for safety
                if (rightLowerLeg && leftLowerLeg) {
                    rightLowerLeg.rotation.x = -Math.max(0, Math.sin(cycle) * kneeBendAmp);
                    leftLowerLeg.rotation.x = -Math.max(0, -Math.sin(cycle) * kneeBendAmp);
                }

                if (spine) spine.rotation.y = Math.sin(cycle) * 0.08;

                if (spine) spine.rotation.y = 0;
            }
        }

        // Move Group Logic
        if (sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const moveSpeed = 1.6 * delta;

            // WALKING STATE
            if (action === 'walk') {
                if (Math.abs(dist) > 0.05) {
                    sceneRef.current.position.x += Math.sign(dist) * moveSpeed;
                    const turn = dist > 0 ? Math.PI / 2 : -Math.PI / 2;
                    // Smooth rotation
                    sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, turn, 0.2);

                    const walkCycle = state.clock.elapsedTime * 6.0;
                    // Base Height -1.3 (Lowered slightly for bigger scale)
                    sceneRef.current.position.y = -1.3 + Math.abs(Math.cos(walkCycle)) * 0.05;
                } else {
                    // Reached target
                    setAction('idle');
                    sceneRef.current.rotation.y = 0;
                }
            }
            // IDLE STATE (Return Logic)
            else if (action === 'idle') {
                // If we are too far from BaseX, trigger a walk back!
                // Don't "slide" (sucked in). PROPERLY WALK.
                const distToBase = baseX - currentX;
                if (Math.abs(distToBase) > 0.5) {
                    // Trigger return walk
                    setTargetX(baseX);
                    setAction('walk');
                } else {
                    // Minor adjustment if very close (snap logic) without sliding
                    // Or just stay put. Staying put is more natural than sliding.
                    sceneRef.current.rotation.y = THREE.MathUtils.lerp(sceneRef.current.rotation.y, 0, 0.1);
                    sceneRef.current.position.y = -1.3;
                }
            }
        }
    });

    const openChat = () => {
        window.dispatchEvent(new Event('open-site-agent'));
        setAction('idle');
        if (sceneRef.current) sceneRef.current.rotation.y = 0;
    };

    return vrm ? (
        // Scale Increased: 1.1 -> 1.35
        // Position Y Lowered: -1.1 -> -1.3 to fit the larger body
        <group ref={sceneRef} position={[baseX, -1.3, 0]} scale={[1.35, 1.35, 1.35]}>
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
            {/* FOV 40, Higher Camera Y (1.3) to look DOWN and prevent upskirt visibility */}
            <Canvas camera={{ position: [0, 1.3, 4.5], fov: 40 }} gl={{ alpha: true }}>
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <AvatarModel />
            </Canvas>
        </div>
    );
};
