'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getReferralInfo } from '@/services/portal-service';
import type { ReferralInfo } from '@/types';

export default function ReferralPage() {
    const { lead, project } = useAuth();
    const [info, setInfo] = useState<ReferralInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        getReferralInfo()
            .then(res => { if (res.success) setInfo(res.data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const referralUrl = info?.referral_code && project?.slug
        ? `${window.location.origin}/${project.slug}/${info.referral_code}`
        : null;

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* fallback */ }
    };

    return (
        <DashboardLayout title="My Referral">
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise" />
                    </div>
                ) : (
                    <>
                        {/* Referral Code Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-xl p-6 text-center"
                        >
                            <h2 className="text-white text-sm font-medium mb-3">Your Referral Code</h2>
                            <div className="bg-white/5 rounded-lg p-4 mb-4">
                                <p className="text-turquoise text-2xl font-bold font-mono tracking-wider">
                                    {info?.referral_code || lead?.membership_number || '—'}
                                </p>
                            </div>

                            {info?.earning_rule && (
                                <p className="text-light-gray text-xs mb-4">
                                    Earn <span className="text-turquoise font-medium">{info.earning_rule.points_for_referrer}</span> pts per referral
                                    {info.earning_rule.points_for_referred > 0 && (
                                        <> · Your friend gets <span className="text-turquoise font-medium">{info.earning_rule.points_for_referred}</span> pts</>
                                    )}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={() => info?.referral_code && handleCopy(info.referral_code)}
                                    className="flex-1"
                                >
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </Button>
                                {referralUrl && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleCopy(referralUrl)}
                                        className="flex-1"
                                    >
                                        Copy Link
                                    </Button>
                                )}
                            </div>
                        </motion.div>

                        {/* Stats */}
                        {info && (
                            <div className="grid grid-cols-3 gap-3">
                                <div className="glass-card rounded-lg p-3 text-center">
                                    <p className="text-white font-bold">{info.stats.total}</p>
                                    <p className="text-dark-gray text-xs">Total</p>
                                </div>
                                <div className="glass-card rounded-lg p-3 text-center">
                                    <p className="text-turquoise font-bold">{info.stats.successful}</p>
                                    <p className="text-dark-gray text-xs">Successful</p>
                                </div>
                                <div className="glass-card rounded-lg p-3 text-center">
                                    <p className="text-white font-bold">{info.stats.points_earned.toLocaleString()}</p>
                                    <p className="text-dark-gray text-xs">Pts Earned</p>
                                </div>
                            </div>
                        )}

                        {/* Referral List */}
                        {info && info.referrals.length > 0 && (
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-3">Referral History</h3>
                                <div className="space-y-2">
                                    {info.referrals.map(r => (
                                        <div
                                            key={r.id}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                        >
                                            <div>
                                                <p className="text-white text-sm">
                                                    {r.referred_name || 'Pending'}
                                                </p>
                                                <p className="text-dark-gray text-xs">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    r.status === 'signed_up' || r.status === 'converted'
                                                        ? 'bg-turquoise/10 text-turquoise'
                                                        : r.status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-400'
                                                        : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {r.status.replace('_', ' ')}
                                                </span>
                                                {r.referrer_points > 0 && (
                                                    <p className="text-turquoise text-xs font-medium mt-0.5">
                                                        +{r.referrer_points} pts
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
