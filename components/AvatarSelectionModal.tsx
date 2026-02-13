
import React, { useRef, useState } from 'react';
import { UserIcon, ShieldIcon, BotIcon, FileTextIcon, PlusIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { generateUserAvatar } from '../services/geminiService';

interface AvatarSelectionModalProps {
    onClose: () => void;
    onSelect: (base64: string) => void;
}

const PRESET_AVATARS = [
    "https://img.freepik.com/free-photo/3d-rendering-biorobots-concept_23-2149524398.jpg?t=st=1710000000~exp=1710003600~hmac=fake1",
    "https://img.freepik.com/free-photo/cyborg-woman-with-neon-lights_23-2150828695.jpg", 
    "https://img.freepik.com/free-photo/portrait-futuristic-male-cyborg_23-2150828723.jpg",
    "https://img.freepik.com/free-photo/robot-face-with-neon-lights_23-2150828745.jpg",
    "https://img.freepik.com/free-photo/futuristic-soldier-armor_23-2150828712.jpg",
    "https://img.freepik.com/free-photo/cyberpunk-hacker-hoodie_23-2150828688.jpg"
];

const AvatarSelectionModal: React.FC<AvatarSelectionModalProps> = ({ onClose, onSelect }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [generating, setGenerating] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                triggerHaptic('success');
                onSelect(reader.result as string);
                onClose();
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePresetSelect = (url: string) => {
        triggerHaptic('selection');
        // In a real app we might want to convert this URL to base64 to save offline, 
        // but for now we pass the URL directly assuming online access or convert via canvas.
        // For simplicity in this demo, we pass the URL.
        onSelect(url);
        onClose();
    };

    const handleAiGenerate = async () => {
        setGenerating(true);
        triggerHaptic('medium');
        try {
            const base64 = await generateUserAvatar();
            if (base64) {
                onSelect(`data:image/jpeg;base64,${base64}`);
                triggerHaptic('success');
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-brand-bg border border-brand-border rounded-[2rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-slide-up-mobile" onClick={e => e.stopPropagation()}>
                
                <div className="p-5 border-b border-white/10 bg-brand-card/50 flex justify-between items-center">
                    <h2 className="font-orbitron font-bold text-white text-lg tracking-widest uppercase">Identity_Module</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    
                    {/* Option 1: Upload */}
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Manual Override</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-4 border border-dashed border-brand-cyan/30 bg-brand-cyan/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-brand-cyan/10 transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <PlusIcon className="w-5 h-5 text-brand-cyan" />
                            </div>
                            <span className="text-xs font-bold text-brand-cyan uppercase">Upload from Device</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                        />
                    </div>

                    {/* Option 2: Presets */}
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Database Presets</p>
                        <div className="grid grid-cols-4 gap-3">
                            {PRESET_AVATARS.map((url, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handlePresetSelect(url)}
                                    className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-brand-purple hover:scale-105 transition-all relative group"
                                >
                                    <img src={url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Preset" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Option 3: AI Generation */}
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Neural Generation</p>
                        <button 
                            onClick={handleAiGenerate}
                            disabled={generating}
                            className="w-full py-4 bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:border-white/30 transition-all disabled:opacity-50"
                        >
                            {generating ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <BotIcon className="w-5 h-5 text-white" />
                            )}
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {generating ? 'Generating...' : 'Generate AI Avatar'}
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AvatarSelectionModal;
