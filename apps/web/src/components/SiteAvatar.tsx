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
    const [targetX, setTargetX] = useState(-7); // Keep left position

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

    useFrame((state, delta) => {
        if (!vrm) return;
        vrm.update(delta);

        if (Math.random() < 0.01) {
            const actions: ('walk' | 'idle' | 'wave' | 'peace')[] = ['walk', 'walk', 'idle', 'wave'];
            const next = actions[Math.floor(Math.random() * actions.length)];

            if (action !== 'walk' && next === 'walk') {
                setAction('walk');
                setTargetX((Math.random() * 5) - 8);
            } else if (action === 'walk' && Math.abs(targetX - (sceneRef.current?.position.x || 0)) < 0.5) {
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
                // Reverted to "Smoother" version (Step 6140 state)
                const walkSpeed = 5.5;
                const cycle = t * walkSpeed;

                const armAmp = 0.3;
                // Relax arms closer to body (1.2 -> 1.4)
                rightUpperArm.rotation.z = 1.4;
                leftUpperArm.rotation.z = -1.4;
                rightUpperArm.rotation.x = Math.sin(cycle + Math.PI) * armAmp;
                leftUpperArm.rotation.x = Math.sin(cycle) * armAmp;

                // Add Elbow Bend & Twist to fix "Line" look
                if (rightLowerArm && leftLowerArm) {
                    rightLowerArm.rotation.z = 0.1;
                    leftLowerArm.rotation.z = -0.1;
                    // Twist to show volume
                    rightLowerArm.rotation.y = -0.5;
                    leftLowerArm.rotation.y = 0.5;
                }

                const legAmp = 0.9;
                if (rightUpperLeg && leftUpperLeg) {
                    rightUpperLeg.rotation.x = Math.sin(cycle + Math.PI) * legAmp;
                    leftUpperLeg.rotation.x = Math.sin(cycle) * legAmp;
                }

                const kneeBendAmp = 0.5; // Significantly reduced to fix 90-degree issue
                if (rightLowerLeg && leftLowerLeg) {
                    // Logic from 6140 (User preferred base):
                    // Bend when sin(cycle) > 0 (Right Leg Back -> Bend)
                    rightLowerLeg.rotation.x = -Math.max(0, Math.sin(cycle) * kneeBendAmp);
                    leftLowerLeg.rotation.x = -Math.max(0, -Math.sin(cycle) * kneeBendAmp);
                }

                if (spine) spine.rotation.y = Math.sin(cycle) * 0.08;

            } else {
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

        if (action === 'walk' && sceneRef.current) {
            const currentX = sceneRef.current.position.x;
            const dist = targetX - currentX;
            const moveSpeed = 1.6 * delta;

            if (Math.abs(dist) > 0.1) {
                sceneRef.current.position.x += Math.sign(dist) * moveSpeed;
                const turn = dist > 0 ? Math.PI / 2 : -Math.PI / 2;
                sceneRef.current.rotation.y = turn;

                const walkCycle = state.clock.elapsedTime * 5.5;
                sceneRef.current.position.y = -1.0 + Math.abs(Math.cos(walkCycle)) * 0.05;
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
            <Canvas camera={{ position: [0, 0.8, 12], fov: 15 }} gl={{ alpha: true }}>
                <ambientLight intensity={1.0} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                <AvatarModel />
            </Canvas>
        </div>
    );
};
