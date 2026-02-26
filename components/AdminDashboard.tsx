
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShieldIcon, ActivityIcon, UserIcon, BarChartIcon, LinkIcon, ZapIcon, SearchIcon, TrendingUpIcon, BellIcon, SendIcon, PlusIcon } from './icons';
import { triggerHaptic } from '../utils/haptics';
import { supabase } from '../services/supabaseClient';
import { AirdropTask, BannerConfig } from '../types';

interface AdminDashboardProps {
    onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
    const { 
        settings, updateSettings, showToast, toggleMaintenance, updateSubscriptionPrice, maintenanceMode, 
        processSubscriptionRequest, fetchPendingSubscriptions, sendBroadcast,
        partnerTasks, addPartnerTask, removePartnerTask,
        activeBanners, addBanner, removeBanner
    } = useStore();
    
    const [activeTab, setActiveTab] = useState<'SYSTEM' | 'FINANCE' | 'APPROVALS' | 'USERS' | 'BROADCAST' | 'CAMPAIGNS'>('SYSTEM');
    const [users, setUsers] = useState<any[]>([]);
    const [searchUser, setSearchUser] = useState('');
    
    // Broadcast State
    const [bcMessage, setBcMessage] = useState('');
    const [bcType, setBcType] = useState<'INFO' | 'ALERT' | 'SUCCESS'>('INFO');
    
    const [adminWallet, setAdminWallet] = useState(settings?.adminTreasuryWallet || '');
    const [proPrice, setProPrice] = useState(settings?.subscriptionPlans?.find(p => p.id === 'PRO')?.price.toString() || '9.99');
    const [whalePrice, setWhalePrice] = useState(settings?.subscriptionPlans?.find(p => p.id === 'WHALE')?.price.toString() || '49.99');
    const [xpCost, setXpCost] = useState(settings.xpToProRate?.toString() || '500');

    // Campaigns State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskReward, setNewTaskReward] = useState('500');
    const [newTaskLink, setNewTaskLink] = useState('');
    
    const [newBannerTitle, setNewBannerTitle] = useState('');
    const [newBannerSub, setNewBannerSub] = useState('');
    const [newBannerLink, setNewBannerLink] = useState('');

    useEffect(() => {
        if (activeTab === 'APPROVALS') fetchPendingSubscriptions();
        if (activeTab === 'USERS') fetchAllUsers();
    }, [activeTab]);

    const fetchAllUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*').order('last_active', { ascending: false });
        if (data) setUsers(data);
    };

    const updateUserTierDirectly = async (userId: string, tier: string) => {
        triggerHaptic('heavy');
        const { error } = await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', userId);
        if (!error) {
            showToast(`User ${userId.slice(0,5)} updated to ${tier}`);
            fetchAllUsers();
        }
    };

    const handleUpdateFinance = () => {
        triggerHaptic('success');
        updateSettings({ 
            adminTreasuryWallet: adminWallet,
            xpToProRate: parseInt(xpCost) 
        });
        updateSubscriptionPrice('PRO', parseFloat(proPrice));
        updateSubscriptionPrice('WHALE', parseFloat(whalePrice));
        showToast('Finance Config Updated');
    };

    const handleSendBroadcast = () => {
        if (!bcMessage.trim()) return;
        triggerHaptic('heavy');
        sendBroadcast(bcMessage, bcType);
        setBcMessage('');
        showToast('Broadcast Sent to Neural Grid');
    };

    const handleAddTask = () => {
        if(!newTaskTitle || !newTaskLink) return;
        const task: AirdropTask = {
            id: 'pt_' + Date.now(),
            title: newTaskTitle,
            reward: parseInt(newTaskReward),
            icon: 'PARTNER',
            isCompleted: false,
            link: newTaskLink,
            isPartner: true
        };
        addPartnerTask(task);
        showToast('Task Deployed');
        setNewTaskTitle(''); setNewTaskLink('');
    };

    const handleAddBanner = () => {
        if(!newBannerTitle || !newBannerLink) return;
        const banner: BannerConfig = {
            id: 'bn_' + Date.now(),
            title: newBannerTitle,
            subtitle: newBannerSub,
            link: newBannerLink,
            colorFrom: '#00d9ff',
            colorTo: '#8b5cf6',
            active: true
        };
        addBanner(banner);
        showToast('Banner Live');
        setNewBannerTitle(''); setNewBannerSub(''); setNewBannerLink('');
    };

    const filteredUsers = (users || []).filter(u => u.id?.toLowerCase().includes(searchUser.toLowerCase()));

    return (
        <div className="fixed inset-0 z-[300] bg-[#0a0a0a] font-mono flex flex-col text-white overflow-hidden">
            {/* Admin Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

            <div className="p-4 border-b border-red-500/30 bg-red-950/20 flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-red-500 text-white p-1 rounded-md"><ShieldIcon className="w-5 h-5" /></div>
                    <h1 className="font-bold text-lg tracking-widest uppercase text-white">Admin_Central_v9</h1>
                </div>
                <button onClick={onClose} className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-all uppercase rounded-lg">Exit Terminal</button>
            </div>

            <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar bg-white/5 z-10">
                {['SYSTEM', 'FINANCE', 'APPROVALS', 'BROADCAST', 'USERS', 'CAMPAIGNS'].map((tab) => (
                    <button key={tab} onClick={() => { setActiveTab(tab as any); triggerHaptic('light'); }} className={`px-6 py-4 text-[10px] font-black transition-colors border-r border-white/10 whitespace-nowrap uppercase ${activeTab === tab ? 'bg-white text-black' : 'hover:bg-white/10 text-slate-400'}`}>{tab}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar pb-32">
                
                {/* CAMPAIGNS TAB */}
                {activeTab === 'CAMPAIGNS' && (
                    <div className="space-y-8">
                        {/* Task Manager */}
                        <div className="border border-white/10 p-6 rounded-xl bg-black/40">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase"><ActivityIcon className="w-4 h-4 text-brand-green"/> Partner Tasks (Airdrop)</h3>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                <input type="text" value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} placeholder="Title" className="col-span-3 bg-black border border-white/20 p-2 rounded text-xs text-white" />
                                <input type="text" value={newTaskLink} onChange={e=>setNewTaskLink(e.target.value)} placeholder="Link" className="col-span-2 bg-black border border-white/20 p-2 rounded text-xs text-white" />
                                <input type="number" value={newTaskReward} onChange={e=>setNewTaskReward(e.target.value)} placeholder="Reward" className="col-span-1 bg-black border border-white/20 p-2 rounded text-xs text-white" />
                            </div>
                            <button onClick={handleAddTask} className="w-full py-3 bg-green-600 hover:bg-green-500 text-black font-black uppercase text-xs rounded shadow-lg flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4"/> Add Task</button>
                            
                            <div className="mt-4 space-y-2">
                                {partnerTasks.map(t => (
                                    <div key={t.id} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-xs">{t.title}</span>
                                        <button onClick={() => removePartnerTask(t.id)} className="text-[10px] text-red-500 font-bold px-2 border border-red-500/30 rounded">DEL</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Banner Manager */}
                        <div className="border border-white/10 p-6 rounded-xl bg-black/40">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2 uppercase"><BarChartIcon className="w-4 h-4 text-brand-purple"/> Ad Banners</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <input type="text" value={newBannerTitle} onChange={e=>setNewBannerTitle(e.target.value)} placeholder="Main Title" className="bg-black border border-white/20 p-2 rounded text-xs text-white" />
                                <input type="text" value={newBannerSub} onChange={e=>setNewBannerSub(e.target.value)} placeholder="Subtitle" className="bg-black border border-white/20 p-2 rounded text-xs text-white" />
                                <input type="text" value={newBannerLink} onChange={e=>setNewBannerLink(e.target.value)} placeholder="Link" className="col-span-2 bg-black border border-white/20 p-2 rounded text-xs text-white" />
                            </div>
                            <button onClick={handleAddBanner} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs rounded shadow-lg flex items-center justify-center gap-2"><PlusIcon className="w-4 h-4"/> Add Banner</button>
                            
                            <div className="mt-4 space-y-2">
                                {activeBanners.map(b => (
                                    <div key={b.id} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                                        <span className="text-xs">{b.title}</span>
                                        <button onClick={() => removeBanner(b.id)} className="text-[10px] text-red-500 font-bold px-2 border border-red-500/30 rounded">DEL</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'SYSTEM' && (
                    <div className="space-y-6">
                        <div className="border border-white/10 p-6 rounded-xl bg-black/50">
                            <h3 className="text-brand-cyan font-bold mb-4 flex items-center gap-2 uppercase"><ActivityIcon className="w-4 h-4"/> Global_Protocols</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                                    <span className="text-xs font-bold">Maintenance Mode</span>
                                    <button onClick={() => toggleMaintenance(!maintenanceMode)} className={`px-4 py-2 text-[10px] font-black rounded border ${maintenanceMode ? 'border-red-500 bg-red-500 text-white shadow-[0_0_15px_#ef4444]' : 'border-white/20 text-slate-400'}`}>{maintenanceMode ? 'ACTIVE' : 'DISABLED'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'BROADCAST' && (
                    <div className="space-y-6">
                        <div className="border border-white/10 p-6 rounded-xl bg-black/40">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase"><BellIcon className="w-4 h-4 text-brand-purple"/> Global_Broadcast_Unit</h3>
                            
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    {['INFO', 'ALERT', 'SUCCESS'].map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setBcType(type as any)}
                                            className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase border transition-all ${bcType === type ? 'bg-white text-black' : 'bg-black border-white/20 text-slate-500'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                
                                <textarea 
                                    value={bcMessage}
                                    onChange={(e) => setBcMessage(e.target.value)}
                                    placeholder="Type systemic message..."
                                    className="w-full h-32 bg-black border border-white/20 rounded-xl p-4 text-xs font-mono text-white focus:border-brand-cyan outline-none resize-none"
                                />
                                
                                <button 
                                    onClick={handleSendBroadcast}
                                    className="w-full py-4 bg-brand-cyan text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
                                >
                                    <SendIcon className="w-4 h-4" /> Transmit Signal
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'USERS' && (
                    <div className="space-y-6">
                        <div className="relative mb-4">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Search by Device ID..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-white/30"
                            />
                        </div>
                        <div className="space-y-3">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="border border-white/10 p-4 rounded-xl bg-black/40 hover:bg-white/5 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] text-white font-bold mb-1">ID: {user.id}</p>
                                            <p className="text-[8px] text-slate-500 uppercase font-mono">Last Seen: {user.last_active ? new Date(user.last_active).toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${user.subscription_tier === 'WHALE' ? 'border-purple-500 text-purple-400' : user.subscription_tier === 'PRO' ? 'border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500'}`}>
                                            {user.subscription_tier || 'FREE'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateUserTierDirectly(user.id, 'FREE')} className="flex-1 py-2 bg-white/5 border border-white/10 text-[8px] font-black hover:bg-white/10 rounded">SET_FREE</button>
                                        <button onClick={() => updateUserTierDirectly(user.id, 'PRO')} className="flex-1 py-2 bg-cyan-900/20 border border-cyan-500/30 text-[8px] font-black hover:bg-cyan-900/40 text-cyan-400 rounded">SET_PRO</button>
                                        <button onClick={() => updateUserTierDirectly(user.id, 'WHALE')} className="flex-1 py-2 bg-purple-900/20 border border-purple-500/30 text-[8px] font-black hover:bg-purple-900/40 text-purple-400 rounded">SET_WHALE</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'FINANCE' && (
                    <div className="space-y-6">
                        <div className="border border-white/10 p-6 rounded-xl bg-black/40">
                            <h3 className="text-white font-bold mb-6 flex items-center gap-2 uppercase"><LinkIcon className="w-4 h-4"/> Treasury_Config</h3>
                            <div className="mb-6">
                                <label className="text-[10px] uppercase text-slate-500 mb-2 block font-black">Deposit Wallet (Admin Receiver)</label>
                                <input type="text" value={adminWallet} onChange={(e) => setAdminWallet(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-lg text-white text-xs focus:outline-none focus:border-brand-cyan font-mono" placeholder="UQ..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div><label className="text-[10px] uppercase text-cyan-500 mb-2 block font-black">PRO Price ($)</label><input type="number" value={proPrice} onChange={(e) => setProPrice(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-lg text-white text-xs focus:outline-none" /></div>
                                <div><label className="text-[10px] uppercase text-purple-500 mb-2 block font-black">WHALE Price ($)</label><input type="number" value={whalePrice} onChange={(e) => setWhalePrice(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-lg text-white text-xs focus:outline-none" /></div>
                            </div>
                            <div className="mb-6">
                                <label className="text-[10px] uppercase text-green-500 mb-2 block font-black">XP Cost per Day (PRO)</label>
                                <input type="number" value={xpCost} onChange={(e) => setXpCost(e.target.value)} className="w-full bg-black border border-white/20 p-4 rounded-lg text-white text-xs focus:outline-none" />
                            </div>
                            <button onClick={handleUpdateFinance} className="w-full py-4 bg-white text-black font-black hover:bg-slate-200 transition-colors uppercase text-xs rounded-lg shadow-lg">Commit Financials</button>
                        </div>
                    </div>
                )}

                {activeTab === 'APPROVALS' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2 uppercase"><ZapIcon className="w-4 h-4"/> Live_Queue</h3>
                            <button onClick={() => fetchPendingSubscriptions()} className="text-[8px] border border-white/20 px-3 py-1 hover:bg-white/10 uppercase rounded">Refresh DB</button>
                        </div>
                        {(!settings?.pendingSubRequests || settings.pendingSubRequests.length === 0) ? (
                            <p className="text-slate-500 text-xs italic text-center py-10 border border-dashed border-white/10 rounded-xl">No active requests in grid.</p>
                        ) : (
                            settings.pendingSubRequests.map(req => (
                                <div key={req.id} className={`p-4 border rounded-xl flex flex-col gap-3 ${req.status === 'PENDING' ? 'border-yellow-500/50 bg-yellow-500/5' : req.status === 'APPROVED' ? 'border-green-500/50 bg-green-500/5 opacity-50' : 'border-red-500/50 bg-red-500/5 opacity-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-white font-bold">{req.planId} | {req.method}</p>
                                            <p className="text-[8px] text-slate-400 font-mono">UID: {req.userId?.slice(0,12)}...</p>
                                        </div>
                                        <span className={`text-[10px] font-black ${req.status === 'APPROVED' ? 'text-green-400' : req.status === 'PENDING' ? 'text-yellow-400 animate-pulse' : 'text-red-400'}`}>{req.status}</span>
                                    </div>
                                    
                                    <div className="bg-black/60 p-3 rounded border border-white/10">
                                        <p className="text-[8px] text-slate-500 uppercase font-black">Transaction ID:</p>
                                        <p className="text-[10px] text-brand-cyan font-mono break-all">{req.txHash || 'NONE_PROVIDED'}</p>
                                    </div>

                                    {req.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => processSubscriptionRequest(req.id, true)} className="flex-1 py-3 bg-green-600 text-black text-[10px] font-black rounded hover:bg-green-500 transition-colors shadow-lg">APPROVE</button>
                                            <button onClick={() => processSubscriptionRequest(req.id, false)} className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black rounded hover:bg-red-500 transition-colors shadow-lg">DENY</button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
