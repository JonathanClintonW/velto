'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { getPointsSummary } from '@/services/portal-service';
import type { PointsSummary } from '@/types';

export default function DashboardHome() {
    const router = useRouter();
    const { lead } = useAuth();
    const [summary, setSummary] = useState<PointsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPointsSummary()
            .then(res => { if (res.success) setSummary(res.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const quickActions = [
        {
            label: 'Claim Points',
            icon: (
                <svg className="w-6 h-6 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
            ),
            path: '/dashboard/claim',
            color: 'bg-turquoise/10 border-turquoise/20'
        },
        {
            label: 'Redeem Rewards',
            icon: (
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
            ),
            path: '/dashboard/rewards',
            color: 'bg-purple-500/10 border-purple-500/20'
        },
        {
            label: 'My Referral',
            icon: (
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            path: '/dashboard/referral',
            color: 'bg-blue-500/10 border-blue-500/20'
        },
        {
            label: 'Submit Receipt',
            icon: (
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            path: '/dashboard/submit-receipt',
            color: 'bg-amber-500/10 border-amber-500/20'
        },
    ];

    return (
        <DashboardLayout title={lead?.firstname ? `Hi, ${lead.firstname}` : undefined}>
            <div className="space-y-6">
                {/* Points Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-6"
                >
                    <div className="text-center mb-4">
                        <p className="text-dark-gray text-sm mb-1">Available Points</p>
                        <p className="text-turquoise text-4xl font-bold">
                            {loading ? '—' : (summary?.balance ?? lead?.loyalty_points ?? 0).toLocaleString()}
                        </p>
                        {summary?.current_tier && (
                            <p className="text-sm mt-1" style={{ color: summary.current_tier.color || '#05f5b0' }}>
                                {summary.current_tier.name} Member
                                {summary.current_tier.point_multiplier > 1 && (
                                    <span className="text-dark-gray"> · {summary.current_tier.point_multiplier}x multiplier</span>
                                )}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/5 rounded-lg p-2.5">
                            <p className="text-white font-semibold text-sm">
                                {loading ? '—' : (summary?.total_earned ?? 0).toLocaleString()}
                            </p>
                            <p className="text-dark-gray text-xs">Earned</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2.5">
                            <p className="text-white font-semibold text-sm">
                                {loading ? '—' : (summary?.total_spent ?? 0).toLocaleString()}
                            </p>
                            <p className="text-dark-gray text-xs">Spent</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2.5">
                            <p className="text-amber-400 font-semibold text-sm">
                                {loading ? '—' : (summary?.expiring_soon ?? 0).toLocaleString()}
                            </p>
                            <p className="text-dark-gray text-xs">Expiring</p>
                        </div>
                    </div>

                    {/* Tier progress */}
                    {summary && summary.tiers.length > 0 && (() => {
                        const currentIdx = summary.tiers.findIndex(t => t.id === summary.current_tier?.id);
                        const nextTier = currentIdx >= 0 && currentIdx < summary.tiers.length - 1
                            ? summary.tiers[currentIdx + 1]
                            : null;
                        if (!nextTier || !nextTier.minimum_points) return null;
                        const progress = Math.min(100, ((summary.total_earned) / nextTier.minimum_points) * 100);
                        return (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-light-gray">{summary.current_tier?.name || 'No Tier'}</span>
                                    <span className="text-dark-gray">{nextTier.name}</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
                                    <div
                                        className="bg-turquoise rounded-full h-2 transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-dark-gray text-xs mt-1 text-right">
                                    {Math.max(0, nextTier.minimum_points - summary.total_earned).toLocaleString()} pts to go
                                </p>
                            </div>
                        );
                    })()}
                </motion.div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-white font-semibold text-sm mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action, i) => (
                            <motion.button
                                key={action.path}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                onClick={() => router.push(action.path)}
                                className={`p-4 rounded-lg border ${action.color} flex flex-col items-center justify-center text-center transition-all hover:scale-[1.02]`}
                            >
                                {action.icon}
                                <p className="text-white text-sm font-medium mt-2">{action.label}</p>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                {summary && summary.recent_transactions.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
                            <button
                                onClick={() => router.push('/dashboard/history')}
                                className="text-turquoise text-xs hover:text-light-turquoise"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-2">
                            {summary.recent_transactions.map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                            tx.points > 0 ? 'bg-turquoise/10 text-turquoise' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {tx.points > 0 ? '+' : '−'}
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">{tx.description}</p>
                                            <p className="text-dark-gray text-xs">
                                                {new Date(tx.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`font-semibold text-sm ${
                                        tx.points > 0 ? 'text-turquoise' : 'text-red-400'
                                    }`}>
                                        {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Membership Info */}
                {lead?.membership_number && (
                    <div className="text-center pt-2 pb-4">
                        <p className="text-dark-gray text-xs">
                            Member ID: <span className="text-light-gray font-mono">{lead.membership_number}</span>
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
