
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Asset } from '../types';

interface PortfolioChartProps {
    assets: Asset[];
}

const COLORS = ['#00F0FF', '#00FF9D', '#BD00FF', '#FF0055', '#F27D26', '#E4E3E0'];

export const PortfolioDistributionChart: React.FC<PortfolioChartProps> = ({ assets }) => {
    const data = assets
        .filter(a => a.value > 0)
        .map(a => ({
            name: a.ticker,
            value: a.value
        }))
        .sort((a, b) => b.value - a.value);

    if (data.length === 0) return null;

    return (
        <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Assets</span>
                <span className="text-sm font-black text-white font-orbitron">{assets.length}</span>
            </div>
        </div>
    );
};
