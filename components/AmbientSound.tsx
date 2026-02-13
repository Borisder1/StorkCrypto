
import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

const AmbientSound: React.FC = () => {
    const { settings } = useStore();
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        if (!settings.soundEnabled) {
            if (audioContextRef.current) {
                if (audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close().catch(e => console.warn("Audio close error:", e));
                }
                audioContextRef.current = null;
            }
            return;
        }

        const initAudio = () => {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            // Ensure we don't overwrite an existing running context
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') return;

            const ctx = new AudioContext();
            audioContextRef.current = ctx;

            // Drone Sound (Low Frequency)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(50, ctx.currentTime); // 50Hz Low Drone
            
            // LFO for modulation
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // Slow pulse
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(500, ctx.currentTime);
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start();

            gain.gain.setValueAtTime(0.02, ctx.currentTime); // Very quiet

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            oscillatorRef.current = osc;
            gainNodeRef.current = gain;
        };

        // Initialize only after user interaction due to browser policies
        const handleInteraction = () => {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                initAudio();
            } else if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume().catch(() => {});
            }
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);

        return () => {
            if (audioContextRef.current) {
                if (audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close().catch(e => console.warn("Audio close error:", e));
                }
                audioContextRef.current = null;
            }
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [settings.soundEnabled]);

    return null; // Logic only component
};

export default AmbientSound;
