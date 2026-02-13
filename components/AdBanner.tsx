
import React from 'react';
import { useStore } from '../store';

interface AdBannerProps {
    placement: 'HOME' | 'NEWS';
}

const AdBanner: React.FC<AdBannerProps> = ({ placement }) => {
    const { settings, userStats, activeBanners } = useStore();

    // Don't show ads if disabled in Admin or user has paid subscription (PRO/WHALE)
    if (!settings.adsEnabled || userStats.subscriptionTier !== 'FREE' || activeBanners.length === 0) {
        return null;
    }

    // Select random banner or first
    const banner = activeBanners[0];

    return (
        <div 
            onClick={() => window.open(banner.link, '_blank')}
            className={`w-full overflow-hidden rounded-xl border border-dashed border-white/20 relative group cursor-pointer ${placement === 'HOME' ? 'mb-6 h-20' : 'mb-4 h-16'}`}
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
            <div className="absolute top-1 right-1 bg-black/60 px-1 rounded text-[8px] text-slate-500 border border-white/10">AD</div>
            
            <div className="w-full h-full flex items-center justify-between px-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black text-xs shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${banner.colorFrom}, ${banner.colorTo})` }}
                    >
                        {banner.title.charAt(0)}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">{banner.title}</p>
                        <p className="text-[10px] text-slate-400">{banner.subtitle}</p>
                    </div>
                </div>
                <div className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-full">
                    VISIT
                </div>
            </div>
        </div>
    );
};

export default AdBanner;
