import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { claimPoints } from '@/services/qrgenerator-service';
import Button from '@/components/ui/Button';
import Particles from '@/components/ui/Particles';

interface QrCodeData {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    data: string;
    earning_rule: {
        id: string;
        name: string;
        points_amount: number;
        active: boolean;
        start_date: string | null;
        end_date: string | null;
        max_daily_points: number | null;
        max_total_redemptions: number | null;
        points_expire_days: number | null;
    } | null;
    active: boolean;
    expired_at: string | null;
}

interface ClaimPointsPageProps {
    qrCode: QrCodeData | null;
    error: string | null;
    redirectUrl: string | null;
}

export default function ClaimPointsPage({ qrCode, error: initialError, redirectUrl }: ClaimPointsPageProps) {
    const router = useRouter();
    const { slug } = router.query;

    const [identifier, setIdentifier] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(initialError || '');
    const [success, setSuccess] = useState<{
        message: string;
        points: number;
        redirect_url?: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug || typeof slug !== 'string') return;

        setError('');
        setSubmitting(true);

        try {
            const response = await claimPoints(slug, identifier);

            if (response.success) {
                setSuccess({
                    message: response.message,
                    points: response.data.points_awarded,
                    redirect_url: response.data.redirect_url
                });

                if (response.data.redirect_url) {
                    setTimeout(() => {
                        window.location.href = response.data.redirect_url!;
                    }, 3000);
                }
            } else {
                setError(response.error || 'Failed to claim points');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    };

    const isRuleActive = () => {
        if (!qrCode?.earning_rule) return false;

        const now = new Date();
        if (!qrCode.earning_rule.active) return false;

        if (qrCode.earning_rule.start_date && now < new Date(qrCode.earning_rule.start_date)) {
            return false;
        }

        if (qrCode.earning_rule.end_date && now > new Date(qrCode.earning_rule.end_date)) {
            return false;
        }

        return true;
    };

    if (error && !qrCode) {
        return (
            <section className="min-h-screen bg-black flex items-center justify-center p-4">
                <Particles count={20} />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-lg shadow-md p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
                    <p className="text-light-gray">{error}</p>
                </motion.div>
            </section>
        );
    }

    if (!qrCode?.earning_rule || !isRuleActive()) {
        return (
            <section className="min-h-screen bg-black flex items-center justify-center p-4">
                <Particles count={20} />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-lg shadow-md p-8 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Points Unavailable</h1>
                    <p className="text-light-gray">This point earning campaign is no longer active.</p>
                </motion.div>
            </section>
        );
    }

    if (success) {
        return (
            <section className="min-h-screen bg-black flex items-center justify-center p-4">
                <Particles count={20} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card rounded-lg shadow-md p-8 max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-16 h-16 bg-turquoise/10 border-2 border-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <svg className="w-8 h-8 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white mb-2">Success!</h1>
                    <p className="text-light-gray mb-6">{success.message}</p>

                    <div className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <svg className="w-6 h-6 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                            </svg>
                            <p className="text-turquoise text-2xl font-bold">{success.points} Points</p>
                        </div>
                        <p className="text-xs text-light-gray">awarded to your account</p>
                    </div>

                    {success.redirect_url ? (
                        <>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <svg className="animate-spin h-4 w-4 text-turquoise" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <p className="text-sm text-light-gray">Redirecting in 3 seconds...</p>
                            </div>
                            <a
                                href={success.redirect_url}
                                className="inline-block bg-turquoise text-black px-6 py-3 rounded-lg font-semibold hover:bg-turquoise/80 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise"
                            >
                                Continue Now →
                            </a>
                        </>
                    ) : (
                        <p className="text-sm text-light-gray">
                            Thank you! Your points have been awarded.
                        </p>
                    )}

                    <p className="text-xs text-dark-gray mt-6">
                        Powered by <span className="text-turquoise">Velto</span>
                    </p>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-black flex items-center justify-center p-4">
            <Particles count={20} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-lg shadow-md p-8 max-w-md w-full"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-turquoise/10 border-2 border-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{qrCode.name}</h1>
                    <p className="text-light-gray text-sm">{qrCode.description || 'Scan and earn loyalty points'}</p>
                </div>

                <div className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-4 text-center mb-6">
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-xl font-bold text-white">
                            Earn <span className="text-turquoise">{qrCode.earning_rule.points_amount}</span> Points
                        </p>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg p-3 mb-4 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-light-gray mb-2">
                            Email or Phone Number
                        </label>
                        <input
                            type="text"
                            id="identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="off"
                            placeholder="your@email.com or +1234567890"
                            required
                            className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className='flex-1'
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Claim Points'
                            )}
                        </Button>

                        {redirectUrl && (
                            <Button
                                type="button"
                                onClick={handleSkip}
                                disabled={submitting}
                                variant="secondary"
                                className='flex-1'
                            >
                                Skip
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                                </svg>
                            </Button>
                        )}
                    </div>
                </form>

                <div className="mt-6 p-4 bg-turquoise/10 border border-turquoise/20 rounded-lg">
                    <p className="text-sm text-light-gray mb-2">
                        <strong className="text-white">{qrCode.earning_rule.name}</strong>
                    </p>
                    <p className="text-xs text-light-gray mb-3">
                        Enter your email or phone number to claim your loyalty points.
                    </p>

                    {(qrCode.earning_rule.max_daily_points || qrCode.earning_rule.max_total_redemptions || qrCode.earning_rule.points_expire_days) && (
                        <div className="mt-3 pt-3 border-t border-turquoise/10 space-y-1 text-xs text-light-gray">
                            {qrCode.earning_rule.max_daily_points && (
                                <p>Daily Limit: {qrCode.earning_rule.max_daily_points} points/day</p>
                            )}
                            {qrCode.earning_rule.max_total_redemptions && (
                                <p>Max Uses: {qrCode.earning_rule.max_total_redemptions} per member</p>
                            )}
                            {qrCode.earning_rule.points_expire_days && (
                                <p>Points Expiry: {qrCode.earning_rule.points_expire_days} days</p>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-center text-dark-gray mt-6">
                    Powered by <span className="text-turquoise">Velto</span>
                </p>
            </motion.div>
        </section>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as { slug: string };

    try {
        const backendUrl = process.env.NEXT_PUBLIC_STATIC_URL;
        const response = await fetch(`${backendUrl}/api/qr-generator/redirect/${slug}?preview=true`);

        if (!response.ok) {
            return {
                props: {
                    qrCode: null,
                    error: 'QR code not found',
                    redirectUrl: null
                }
            };
        }

        const data = await response.json();
        const qrCodeData = data.data?.qrCode;

        let redirectUrl = null;
        if (qrCodeData?.data) {
            const originalData = typeof qrCodeData.data === 'string'
                ? JSON.parse(qrCodeData.data)
                : qrCodeData.data;

            switch (qrCodeData.type) {
                case 'url':
                    redirectUrl = originalData.url;
                    break;
                case 'email':
                    let emailString = `mailto:${originalData.email}`;
                    if (originalData.emailSubject || originalData.emailMessage) {
                        const params = [];
                        if (originalData.emailSubject) params.push(`subject=${encodeURIComponent(originalData.emailSubject)}`);
                        if (originalData.emailMessage) params.push(`body=${encodeURIComponent(originalData.emailMessage)}`);
                        emailString += `?${params.join('&')}`;
                    }
                    redirectUrl = emailString;
                    break;
                case 'phone':
                    redirectUrl = `tel:${originalData.phone}`;
                    break;
                case 'sms':
                    redirectUrl = `sms:${originalData.smsPhone}?body=${encodeURIComponent(originalData.smsMessage || '')}`;
                    break;
                case 'location':
                    redirectUrl = `https://www.google.com/maps?q=${originalData.latitude},${originalData.longitude}`;
                    break;
            }
        }

        return {
            props: {
                qrCode: qrCodeData || null,
                error: null,
                redirectUrl
            }
        };
    } catch (error) {
        return {
            props: {
                qrCode: null,
                error: 'Failed to load QR code information',
                redirectUrl: null
            }
        };
    }
};
