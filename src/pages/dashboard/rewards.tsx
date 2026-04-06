'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getRewards, redeemReward } from '@/services/portal-service';
import type { Reward } from '@/types';

export default function RewardsPage() {
    const { lead, refreshProfile } = useAuth();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [redeeming, setRedeeming] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            const res = await getRewards({ limit: 50 });
            if (res.success) setRewards(res.data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const handleRedeem = async (reward: Reward, variantId?: string) => {
        setRedeeming(true);
        setMessage(null);

        try {
            const res = await redeemReward({ reward_id: reward.id, variant_id: variantId });
            if (res.success) {
                setMessage({ type: 'success', text: res.message });
                setSelectedReward(null);
                await refreshProfile();
                loadRewards();
            }
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Redemption failed. Please try again.';
            setMessage({ type: 'error', text: msg || 'Redemption failed.' });
        } finally {
            setRedeeming(false);
        }
    };

    return (
        <DashboardLayout title="Rewards">
            <div className="space-y-4">
                {/* Balance banner */}
                <div className="flex items-center justify-between bg-turquoise/5 border border-turquoise/20 rounded-lg p-3">
                    <span className="text-light-gray text-sm">Your balance</span>
                    <span className="text-turquoise font-bold">{(lead?.loyalty_points ?? 0).toLocaleString()} pts</span>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg border text-sm ${
                        message.type === 'success'
                            ? 'bg-turquoise/5 border-turquoise/20 text-turquoise'
                            : 'bg-red-500/5 border-red-500/20 text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise" />
                    </div>
                ) : rewards.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-dark-gray">No rewards available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {rewards.map((reward, i) => (
                            <motion.div
                                key={reward.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="glass-card rounded-lg overflow-hidden"
                            >
                                {reward.image_url ? (
                                    <img
                                        src={reward.image_url}
                                        alt={reward.name}
                                        className="w-full h-24 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-24 bg-white/5 flex items-center justify-center">
                                        {reward.type === 'digital' ? (
                                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        ) : reward.type === 'e_voucher' ? (
                                            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                                        ) : reward.type === 'experience' ? (
                                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        ) : (
                                            <svg className="w-8 h-8 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                        )}
                                    </div>
                                )}
                                <div className="p-3">
                                    <div className="flex items-start justify-between gap-1 mb-1">
                                        <h3 className="text-white font-medium text-sm line-clamp-1">{reward.name}</h3>
                                        {reward.featured && (
                                            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        )}
                                    </div>
                                    {reward.short_description && (
                                        <p className="text-dark-gray text-xs line-clamp-2 mb-2">{reward.short_description}</p>
                                    )}
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <span className={`font-bold text-sm ${reward.can_afford ? 'text-turquoise' : 'text-dark-gray'}`}>
                                            {reward.points_cost.toLocaleString()} pts
                                        </span>
                                        {reward.tier_required && (
                                            <span className="text-[10px] px-1 py-0.5 rounded-full bg-white/5 text-dark-gray">
                                                {reward.tier_required}
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        variant={reward.can_afford ? 'primary' : 'ghost'}
                                        onClick={() => setSelectedReward(reward)}
                                        disabled={!reward.can_afford || (!reward.unlimited_stock && reward.stock_quantity === 0)}
                                        className="w-full !text-xs !py-1.5"
                                    >
                                        {!reward.can_afford ? 'Not enough' : (!reward.unlimited_stock && reward.stock_quantity === 0) ? 'Sold out' : 'Redeem'}
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Redeem confirmation modal */}
            {selectedReward && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setSelectedReward(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-xl p-6 max-w-sm w-full"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-white font-bold text-lg mb-1">Confirm Redemption</h3>
                        <p className="text-light-gray text-sm mb-4">{selectedReward.name}</p>

                        {selectedReward.description && (
                            <p className="text-dark-gray text-xs mb-4">{selectedReward.description}</p>
                        )}

                        {selectedReward.variants.length > 0 && (
                            <div className="mb-4">
                                <p className="text-light-gray text-xs mb-2">Select variant:</p>
                                <div className="space-y-2">
                                    {selectedReward.variants.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => handleRedeem(selectedReward, v.id)}
                                            disabled={redeeming}
                                            className="w-full flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <span className="text-white text-sm">{v.name}</span>
                                            <span className="text-turquoise text-sm font-medium">{v.points_cost.toLocaleString()} pts</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white/5 rounded-lg p-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-dark-gray">Cost</span>
                                <span className="text-white font-medium">{selectedReward.points_cost.toLocaleString()} pts</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-dark-gray">After redemption</span>
                                <span className="text-turquoise font-medium">
                                    {((lead?.loyalty_points ?? 0) - selectedReward.points_cost).toLocaleString()} pts
                                </span>
                            </div>
                        </div>

                        {selectedReward.terms_conditions && (
                            <p className="text-dark-gray text-xs mb-4">{selectedReward.terms_conditions}</p>
                        )}

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setSelectedReward(null)} className="flex-1">
                                Cancel
                            </Button>
                            {selectedReward.variants.length === 0 && (
                                <Button
                                    variant="primary"
                                    onClick={() => handleRedeem(selectedReward)}
                                    isLoading={redeeming}
                                    className="flex-1"
                                >
                                    Confirm
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
