// Web Audio API Synthesizer for UI Soundscapes

class SoundscapeEngine {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    private playTone(freq: number, type: OscillatorType, duration: number, vol: number) {
        if (!this.enabled) return;
        try {
            this.init();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    }

    // Gentle high-tech click for buttons
    public playClick() {
        this.playTone(800, 'sine', 0.1, 0.1);
    }

    // Deeper sound for selection/tabs
    public playSelect() {
        this.playTone(400, 'triangle', 0.15, 0.1);
    }

    // Success/Action completed (e.g., harvest tokens)
    public playSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        
        // Major chord arpeggio effect
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc1.frequency.setValueAtTime(783.99, now + 0.2); // G5
        
        osc2.frequency.setValueAtTime(1046.50, now + 0.2); // C6

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.2);
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    }

    // Alert/Warning sound
    public playAlert() {
        this.playTone(300, 'sawtooth', 0.3, 0.1);
        setTimeout(() => this.playTone(300, 'sawtooth', 0.3, 0.1), 150);
    }
}

export const soundscapes = new SoundscapeEngine();
