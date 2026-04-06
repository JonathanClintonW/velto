'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Particles from '@/components/ui/Particles';
import Button from '@/components/ui/Button';
import { requestOtp, verifyOtp } from '@/services/auth-service';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
    const router = useRouter();
    const { setAuth } = useAuth();

    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setError('');
        setLoading(true);

        try {
            const res = await requestOtp(email);
            if (res.success) {
                setStep('otp');
                setMessage(res.message);
            }
        } catch {
            setError('Failed to send code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp.trim()) return;

        setError('');
        setLoading(true);

        try {
            const res = await verifyOtp(email, otp);
            if (res.success) {
                if (res.data.requiresProjectSelection) {
                    // Store temp token and go to project selection
                    localStorage.setItem('velto_select_token', res.data.token);
                    localStorage.setItem('velto_select_projects', JSON.stringify(res.data.projects));
                    router.push('/select-project');
                } else if (res.data.lead) {
                    setAuth(res.data.lead, res.data.project || null, res.data.token);
                    router.push('/dashboard');
                }
            }
        } catch (err: unknown) {
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Invalid code. Please try again.';
            setError(message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setLoading(true);
        try {
            await requestOtp(email);
            setMessage('A new code has been sent to your email.');
            setOtp('');
        } catch {
            setError('Failed to resend code.');
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Velto</h1>
                    <p className="text-light-gray text-sm">Sign in to your rewards account</p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div>
                            <label className="block text-sm text-light-gray mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-turquoise"
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}

                        <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                            Send Login Code
                        </Button>

                        <p className="text-xs text-dark-gray text-center mt-4">
                            We&apos;ll send a one-time code to your email
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-3 mb-4">
                            <p className="text-sm text-light-gray">
                                Code sent to <span className="text-turquoise">{email}</span>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm text-light-gray mb-1.5">Verification Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="w-full px-3 py-2 bg-darker-gray text-white text-center text-2xl tracking-[0.5em] font-mono rounded-lg placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-turquoise"
                                maxLength={6}
                                required
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        {message && !error && <p className="text-turquoise text-sm">{message}</p>}

                        <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                            Verify Code
                        </Button>

                        <div className="flex items-center justify-between text-sm">
                            <button
                                type="button"
                                onClick={() => { setStep('email'); setOtp(''); setError(''); setMessage(''); }}
                                className="text-light-gray hover:text-white"
                            >
                                Change email
                            </button>
                            <button
                                type="button"
                                onClick={handleResend}
                                className="text-turquoise hover:text-light-turquoise"
                                disabled={loading}
                            >
                                Resend code
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-xs text-dark-gray text-center mt-6">
                    Powered by <span className="text-turquoise">Velto</span>
                </p>
            </motion.div>
        </section>
    );
}
