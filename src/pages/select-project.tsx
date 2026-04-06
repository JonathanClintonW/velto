'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Particles from '@/components/ui/Particles';
import Button from '@/components/ui/Button';
import { selectProject } from '@/services/auth-service';
import { useAuth } from '@/context/AuthContext';
import type { ProjectOption } from '@/types';

export default function SelectProjectPage() {
    const router = useRouter();
    const { setAuth } = useAuth();

    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('velto_select_projects');
        if (!stored) {
            router.replace('/sign-in');
            return;
        }
        try {
            setProjects(JSON.parse(stored));
        } catch {
            router.replace('/sign-in');
        }
    }, [router]);

    const handleSelect = async (option: ProjectOption) => {
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('velto_select_token') || '';
            const res = await selectProject(token, option.leadId);
            if (res.success) {
                localStorage.removeItem('velto_select_token');
                localStorage.removeItem('velto_select_projects');
                setAuth(res.data.lead, res.data.project, res.data.token);
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Failed to select project.';
            setError(message || 'Failed to select project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-black flex items-center justify-center p-4">
            <Particles count={20} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-lg p-8 max-w-md w-full relative z-10"
            >
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">Select a Program</h1>
                    <p className="text-light-gray text-sm">Your email is linked to multiple programs</p>
                </div>

                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <div className="space-y-3">
                    {projects.map((option) => (
                        <motion.button
                            key={option.leadId}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(option)}
                            disabled={loading}
                            className="w-full text-left p-4 bg-white/5 border border-white/10 rounded-lg hover:border-turquoise/30 transition-all duration-200 disabled:opacity-50"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">{option.project.name}</p>
                                    {option.tier && (
                                        <p className="text-turquoise text-xs mt-0.5">{option.tier}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-turquoise font-bold">{option.points.toLocaleString()}</p>
                                    <p className="text-dark-gray text-xs">points</p>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <Button
                    variant="ghost"
                    onClick={() => {
                        localStorage.removeItem('velto_select_token');
                        localStorage.removeItem('velto_select_projects');
                        router.push('/sign-in');
                    }}
                    className="w-full mt-4"
                >
                    Back to Sign In
                </Button>

                <p className="text-xs text-dark-gray text-center mt-6">
                    Powered by <span className="text-turquoise">Velto</span>
                </p>
            </motion.div>
        </section>
    );
}
