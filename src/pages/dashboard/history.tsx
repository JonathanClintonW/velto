'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { getTransactions, getRedemptions } from '@/services/portal-service';
import type { PointTransaction, Redemption } from '@/types';

type Tab = 'transactions' | 'redemptions';

export default function HistoryPage() {
    const [tab, setTab] = useState<Tab>('transactions');
    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [txPage, setTxPage] = useState(1);
    const [rdPage, setRdPage] = useState(1);
    const [txTotal, setTxTotal] = useState(0);
    const [rdTotal, setRdTotal] = useState(0);
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        if (tab === 'transactions') loadTransactions();
        else loadRedemptions();
    }, [tab, txPage, rdPage, typeFilter]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const res = await getTransactions({ page: txPage, limit: 20, type: typeFilter });
            if (res.success) {
                setTransactions(res.data);
                setTxTotal(res.pagination.totalPages);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const loadRedemptions = async () => {
        setLoading(true);
        try {
            const res = await getRedemptions({ page: rdPage, limit: 20 });
            if (res.success) {
                setRedemptions(res.data);
                setRdTotal(res.pagination.totalPages);
            }
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const txTypes = ['all', 'earned', 'spent', 'bonus', 'refund', 'expired'];

    const statusColors: Record<string, string> = {
        pending: 'bg-amber-500/10 text-amber-400',
        approved: 'bg-blue-500/10 text-blue-400',
        completed: 'bg-turquoise/10 text-turquoise',
        cancelled: 'bg-red-500/10 text-red-400',
        processing: 'bg-blue-500/10 text-blue-400',
        shipped: 'bg-purple-500/10 text-purple-400',
        delivered: 'bg-turquoise/10 text-turquoise',
    };

    return (
        <DashboardLayout title="History">
            <div className="space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => { setTab('transactions'); setTypeFilter('all'); }}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                            tab === 'transactions' ? 'bg-turquoise text-black' : 'text-dark-gray hover:text-white'
                        }`}
                    >
                        Transactions
                    </button>
                    <button
                        onClick={() => setTab('redemptions')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                            tab === 'redemptions' ? 'bg-turquoise text-black' : 'text-dark-gray hover:text-white'
                        }`}
                    >
                        Redemptions
                    </button>
                </div>

                {/* Type filter for transactions */}
                {tab === 'transactions' && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {txTypes.map(t => (
                            <button
                                key={t}
                                onClick={() => { setTypeFilter(t); setTxPage(1); }}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                    typeFilter === t
                                        ? 'bg-turquoise/10 text-turquoise border border-turquoise/30'
                                        : 'bg-white/5 text-dark-gray hover:text-light-gray'
                                }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise" />
                    </div>
                ) : tab === 'transactions' ? (
                    transactions.length === 0 ? (
                        <p className="text-center text-dark-gray py-12">No transactions found.</p>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            tx.points > 0 ? 'bg-turquoise/10 text-turquoise' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {tx.type === 'earned' ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                            ) : tx.type === 'spent' ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                            ) : tx.type === 'bonus' ? (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ) : tx.type === 'refund' ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                            ) : (
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" /></svg>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm truncate">{tx.description}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-dark-gray text-xs">
                                                    {new Date(tx.created_at).toLocaleDateString()}
                                                </p>
                                                {tx.earning_rule && (
                                                    <span className="text-dark-gray text-xs">· {tx.earning_rule.name}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={`font-semibold text-sm flex-shrink-0 ${
                                        tx.points > 0 ? 'text-turquoise' : 'text-red-400'
                                    }`}>
                                        {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                                    </p>
                                </motion.div>
                            ))}

                            {/* Pagination */}
                            {txTotal > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <button
                                        onClick={() => setTxPage(p => Math.max(1, p - 1))}
                                        disabled={txPage <= 1}
                                        className="text-light-gray text-sm disabled:text-darker-gray px-3 py-1"
                                    >
                                        ←
                                    </button>
                                    <span className="text-dark-gray text-sm">{txPage} / {txTotal}</span>
                                    <button
                                        onClick={() => setTxPage(p => Math.min(txTotal, p + 1))}
                                        disabled={txPage >= txTotal}
                                        className="text-light-gray text-sm disabled:text-darker-gray px-3 py-1"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    redemptions.length === 0 ? (
                        <p className="text-center text-dark-gray py-12">No redemptions yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {redemptions.map((rd, i) => (
                                <motion.div
                                    key={rd.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="p-3 bg-white/5 rounded-lg"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                                {rd.reward.image_url ? (
                                                    <img src={rd.reward.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <svg className="w-5 h-5 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white text-sm">{rd.reward.name}</p>
                                                {rd.variant && <p className="text-dark-gray text-xs">{rd.variant.name}</p>}
                                                <p className="text-dark-gray text-xs">{new Date(rd.redeemed_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[rd.status] || 'bg-white/5 text-dark-gray'}`}>
                                                {rd.status}
                                            </span>
                                            <p className="text-red-400 text-xs font-medium mt-1">
                                                -{rd.points_spent.toLocaleString()} pts
                                            </p>
                                        </div>
                                    </div>
                                    {rd.tracking_number && (
                                        <p className="text-light-gray text-xs mt-2">Tracking: {rd.tracking_number}</p>
                                    )}
                                    {rd.digital_code && rd.status === 'completed' && (
                                        <div className="mt-2 bg-turquoise/5 border border-turquoise/20 rounded p-2">
                                            <p className="text-xs text-dark-gray">Code:</p>
                                            <p className="text-turquoise font-mono text-sm">{rd.digital_code}</p>
                                        </div>
                                    )}
                                    {rd.voucher_code && rd.status === 'completed' && (
                                        <div className="mt-2 bg-turquoise/5 border border-turquoise/20 rounded p-2">
                                            <p className="text-xs text-dark-gray">Voucher:</p>
                                            <p className="text-turquoise font-mono text-sm">{rd.voucher_code}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {rdTotal > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-2">
                                    <button
                                        onClick={() => setRdPage(p => Math.max(1, p - 1))}
                                        disabled={rdPage <= 1}
                                        className="text-light-gray text-sm disabled:text-darker-gray px-3 py-1"
                                    >
                                        ←
                                    </button>
                                    <span className="text-dark-gray text-sm">{rdPage} / {rdTotal}</span>
                                    <button
                                        onClick={() => setRdPage(p => Math.min(rdTotal, p + 1))}
                                        disabled={rdPage >= rdTotal}
                                        className="text-light-gray text-sm disabled:text-darker-gray px-3 py-1"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </DashboardLayout>
    );
}
