'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { getTierProgress } from '@/services/portal-service';
import type { TierProgress } from '@/types';

export default function ProfilePage() {
    const { lead, project, logout } = useAuth();
    const router = useRouter();
    const [tierProgress, setTierProgress] = useState<TierProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getTierProgress();
                if (res.data) setTierProgress(res.data);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/sign-in');
    };

    if (loading) {
        return (
            <DashboardLayout title="Profile">
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Profile">
            <div className="space-y-4">
                {/* Avatar & Name */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-xl p-6 text-center"
                >
                    <div className="w-20 h-20 bg-turquoise/10 border-2 border-turquoise/30 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-turquoise text-2xl font-bold">
                            {(lead?.firstname?.[0] || lead?.email?.[0] || '?').toUpperCase()}
                        </span>
                    </div>
                    <h2 className="text-white font-bold text-lg">
                        {lead?.firstname || ''} {lead?.lastname || ''}
                    </h2>
                    <p className="text-dark-gray text-sm">{lead?.email}</p>
                    {lead?.membership_number && (
                        <p className="text-dark-gray text-xs mt-1 font-mono">
                            #{lead.membership_number}
                        </p>
                    )}
                </motion.div>

                {/* Tier Info */}
                {tierProgress && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="glass-card rounded-xl p-5"
                    >
                        <h3 className="text-white font-semibold mb-3">Loyalty Tier</h3>

                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                style={{
                                    backgroundColor: tierProgress.current_tier?.color ? `${tierProgress.current_tier.color}20` : 'rgba(5,245,176,0.1)',
                                    color: tierProgress.current_tier?.color || '#05f5b0',
                                    border: `2px solid ${tierProgress.current_tier?.color || '#05f5b0'}40`
                                }}
                            >
                                {tierProgress.current_tier?.name?.[0] || '—'}
                            </div>
                            <div>
                                <p className="text-white font-medium">{tierProgress.current_tier?.name || 'No Tier'}</p>
                                <p className="text-dark-gray text-xs">
                                    {lead?.loyalty_points?.toLocaleString() || 0} points
                                </p>
                            </div>
                        </div>

                        {tierProgress.next_tier && (
                            <div>
                                <div className="flex justify-between text-xs text-dark-gray mb-1">
                                    <span>Progress to {tierProgress.next_tier.name}</span>
                                    <span>{tierProgress.next_tier.points_needed?.toLocaleString() || 0} pts needed</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-turquoise"
                                        style={{
                                            width: `${tierProgress.next_tier.minimum_points > 0
                                                ? Math.min(((lead?.loyalty_points || 0) / tierProgress.next_tier.minimum_points) * 100, 100)
                                                : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {tierProgress.current_tier?.benefits && tierProgress.current_tier.benefits.length > 0 && (
                            <div className="mt-4">
                                <p className="text-light-gray text-xs font-medium mb-2">Your Benefits</p>
                                <ul className="space-y-1">
                                    {tierProgress.current_tier.benefits.map((b: string, i: number) => (
                                        <li key={i} className="text-dark-gray text-xs flex items-start gap-2">
                                            <svg className="w-3 h-3 text-turquoise mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Points Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card rounded-xl p-5"
                >
                    <h3 className="text-white font-semibold mb-3">Points Overview</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                            <p className="text-turquoise font-bold text-lg">
                                {lead?.loyalty_points?.toLocaleString() || 0}
                            </p>
                            <p className="text-dark-gray text-xs">Balance</p>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-lg">
                                {lead?.total_points_earned?.toLocaleString() || 0}
                            </p>
                            <p className="text-dark-gray text-xs">Earned</p>
                        </div>
                        <div className="text-center">
                            <p className="text-light-gray font-bold text-lg">
                                {lead?.total_points_spent?.toLocaleString() || 0}
                            </p>
                            <p className="text-dark-gray text-xs">Spent</p>
                        </div>
                    </div>
                </motion.div>

                {/* Project Info */}
                {project && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card rounded-xl p-5"
                    >
                        <h3 className="text-white font-semibold mb-2">Project</h3>
                        <p className="text-light-gray text-sm">{project.name}</p>
                    </motion.div>
                )}

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-xl p-5"
                >
                    <h3 className="text-white font-semibold mb-3">Contact Info</h3>
                    <div className="space-y-2 text-sm">
                        {lead?.phone && (
                            <div className="flex justify-between">
                                <span className="text-dark-gray">Phone</span>
                                <span className="text-light-gray">{lead.phone}</span>
                            </div>
                        )}
                        {lead?.email && (
                            <div className="flex justify-between">
                                <span className="text-dark-gray">Email</span>
                                <span className="text-light-gray">{lead.email}</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Logout */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <Button variant="danger" onClick={handleLogout} className="w-full">
                        Sign Out
                    </Button>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
