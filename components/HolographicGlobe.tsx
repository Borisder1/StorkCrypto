
import React, { useEffect, useRef } from 'react';

const HolographicGlobe: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const GLOBE_RADIUS = width * 0.35;
        const DOTS_COUNT = 300;
        const ROTATION_SPEED = 0.002;
        const PERSPECTIVE = width * 0.8;

        interface Point3D { x: number, y: number, z: number, phase: number }
        const points: Point3D[] = [];

        // Generate points on sphere
        for (let i = 0; i < DOTS_COUNT; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            points.push({
                x: GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta),
                y: GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta),
                z: GLOBE_RADIUS * Math.cos(phi),
                phase: Math.random() * Math.PI * 2
            });
        }

        let angleY = 0;
        let animationId: number;

        const project = (x: number, y: number, z: number) => {
            const scale = PERSPECTIVE / (PERSPECTIVE + z);
            return {
                x: width / 2 + x * scale,
                y: height / 2 + y * scale,
                scale: scale
            };
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            
            // Grid background
            ctx.strokeStyle = 'rgba(0, 217, 255, 0.03)';
            ctx.beginPath();
            for(let i=0; i<width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,height); }
            for(let i=0; i<height; i+=40) { ctx.moveTo(0,i); ctx.lineTo(width,i); }
            ctx.stroke();

            angleY += ROTATION_SPEED;

            // Sort points by Z for depth buffering effect
            const rotatedPoints = points.map(p => {
                const x = p.x * Math.cos(angleY) - p.z * Math.sin(angleY);
                const z = p.z * Math.cos(angleY) + p.x * Math.sin(angleY);
                return { ...p, rx: x, rz: z };
            }).sort((a, b) => b.rz - a.rz);

            // Draw Connections (Lines)
            ctx.lineWidth = 0.5;
            rotatedPoints.forEach((p, i) => {
                if (p.rz < -GLOBE_RADIUS * 0.5) return; // Cull back faces lightly

                // Find close neighbors
                for (let j = i + 1; j < rotatedPoints.length; j++) {
                    const p2 = rotatedPoints[j];
                    const dist = Math.sqrt((p.rx - p2.rx)**2 + (p.y - p2.y)**2 + (p.rz - p2.rz)**2);
                    
                    if (dist < 40) {
                        const proj1 = project(p.rx, p.y, p.rz);
                        const proj2 = project(p2.rx, p2.y, p2.rz);
                        const alpha = (1 - dist / 40) * (p.rz / GLOBE_RADIUS + 0.5) * 0.3;
                        
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
                        ctx.moveTo(proj1.x, proj1.y);
                        ctx.lineTo(proj2.x, proj2.y);
                        ctx.stroke();
                    }
                }
            });

            // Draw Nodes (Dots)
            rotatedPoints.forEach(p => {
                const proj = project(p.rx, p.y, p.rz);
                const alpha = (p.rz + GLOBE_RADIUS) / (2 * GLOBE_RADIUS); // Depth fade
                
                // Pulse effect
                const pulse = (Math.sin(Date.now() * 0.005 + p.phase) + 1) / 2;
                
                ctx.beginPath();
                ctx.fillStyle = `rgba(0, 217, 255, ${alpha})`;
                const size = 1.5 * proj.scale + (pulse * 1.5 * proj.scale);
                ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
                ctx.fill();

                // Rare random bright pings
                if (Math.random() > 0.995 && alpha > 0.5) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 1;
                    ctx.arc(proj.x, proj.y, size * 4, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            animationId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0 z-10" />
            
            {/* Holographic Overlays */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,#020617_90%)]"></div>
            
            <div className="absolute bottom-10 left-6 z-30">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black font-orbitron text-brand-cyan uppercase tracking-widest">Global_Nodes</span>
                </div>
                <p className="text-xs text-white font-mono">ACTIVE: 8,421</p>
                <p className="text-[9px] text-slate-500 font-mono">LATENCY: 42ms</p>
            </div>

            <div className="absolute top-10 right-6 z-30 text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-[10px] font-black font-orbitron text-brand-purple uppercase tracking-widest">Transaction_Flow</span>
                    <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs text-white font-mono">$12.4B / 24H</p>
            </div>
        </div>
    );
};

export default HolographicGlobe;
