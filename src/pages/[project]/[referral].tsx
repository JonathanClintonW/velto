'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Particles from '@/components/ui/Particles';
import { validateReferral, applyReferral } from '@/services/referral-service';
import { createReferralLead } from '@/services/lead-service';
import { getPublicProjectBySlug } from '@/services/project-service';
import type { Project } from '@/types';

export default function ReferralPage() {
    const router = useRouter();
    const { project: projectSlug, referral: referralParam } = router.query;
    const referralCode = (router.query.ref as string) || referralParam;

    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<Project | null>(null);
    const [referrerName, setReferrerName] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        agreeToTerms: false
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [membershipNumber, setMembershipNumber] = useState<string | null>(null);
    const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!success || !projectSlug) return;

        redirectTimerRef.current = setTimeout(() => {
            router.push(`/${projectSlug}/welcome`);
        }, 3000);

        return () => {
            if (redirectTimerRef.current) {
                clearTimeout(redirectTimerRef.current);
            }
        };
    }, [success, projectSlug, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (!projectSlug || !referralCode) return;

            try {
                setLoading(true);

                const projectResponse = await getPublicProjectBySlug(projectSlug as string);

                if (!projectResponse.success) {
                    setError('Project not found');
                    setLoading(false);
                    return;
                }

                setProject(projectResponse.data.project);

                const referralResponse = await validateReferral(
                    referralCode as string,
                    projectSlug as string
                );

                if (!referralResponse.success) {
                    setError('Invalid or expired referral code');
                    setLoading(false);
                    return;
                }

                setReferrerName(referralResponse.data.referrer_name);
                setLoading(false);

            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load referral information');
                setLoading(false);
            }
        };

        fetchData();
    }, [projectSlug, referralCode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.agreeToTerms) {
            setError('Please agree to the terms and conditions');
            return;
        }

        if (!formData.email) {
            setError('Email address is required');
            return;
        }

        if (!formData.phone) {
            setError('Phone number is required');
            return;
        }

        if (!project?.crm?.id) {
            setError('Invalid project configuration. Please contact support.');
            return;
        }

        setSubmitting(true);

        try {
            const applyResponse = await applyReferral(
                referralCode as string,
                formData.email || undefined,
                formData.phone || undefined,
                projectSlug as string
            );

            if (!applyResponse.success) {
                throw new Error(applyResponse.error || 'Failed to apply referral');
            }

            const leadResponse = await createReferralLead({
                crm_id: project.crm.id,
                firstname: formData.firstname,
                lastname: formData.lastname,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                source: 'referral',
                referral_source: referralCode as string,
                status: 'new',
                qualification: 'warm',
                gdpr_consent: formData.agreeToTerms,
                marketing_opt_in: formData.agreeToTerms
            });

            if (!leadResponse.success) {
                throw new Error(leadResponse.error || 'Failed to create account');
            }

            if (leadResponse.data?.membership_number) {
                setMembershipNumber(leadResponse.data.membership_number);
            }

            setSuccess(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <section className="min-h-screen bg-black flex items-center justify-center p-4">
                <Particles count={20} />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 border-4 border-turquoise/30 border-t-turquoise rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-light-gray">Loading referral information...</p>
                </motion.div>
            </section>
        );
    }

    if (error && !project) {
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
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Referral</h1>
                    <p className="text-light-gray">{error}</p>
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
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome Aboard!</h1>
                    <p className="text-light-gray mb-4">
                        Your account has been created successfully. You and {referrerName} will receive bonus points!
                    </p>
                    {membershipNumber && (
                        <p className="text-sm text-light-gray mb-3">
                            Your membership number: <span className="text-turquoise font-semibold">{membershipNumber}</span>
                        </p>
                    )}
                    <div className="flex items-center justify-center gap-2 text-sm text-turquoise">
                        <div className="w-4 h-4 border-2 border-turquoise/30 border-t-turquoise rounded-full animate-spin" />
                        Redirecting...
                    </div>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Join {project?.name || 'Our Program'}
                    </h1>
                    <p className="text-light-gray text-sm mb-4">
                        {project?.description || 'Sign up to start earning rewards'}
                    </p>
                    {referrerName && (
                        <div className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-3 mb-4">
                            <p className="text-sm text-light-gray">
                                You were invited by{' '}
                                <span className="text-turquoise font-semibold capitalize">{referrerName}</span>
                            </p>
                            <p className="text-xs text-light-gray mt-1">
                                Both of you will receive bonus points when you sign up!
                            </p>
                        </div>
                    )}
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstname" className="block text-sm font-medium text-light-gray mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                autoComplete="off"
                                placeholder="First Name"
                                required
                                className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastname" className="block text-sm font-medium text-light-gray mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                autoComplete="off"
                                placeholder="Last Name"
                                className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-gray mb-2">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="your@email.com"
                            required
                            className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-light-gray mb-2">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="off"
                            placeholder="+1234567890"
                            required
                            className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise"
                        />
                    </div>

                    <div className="flex items-start gap-2">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            name="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            autoComplete="off"
                            className="aspect-square appearance-none w-4 h-4 bg-turquoise/10 border border-turquoise rounded-sm animate checked:bg-turquoise checked:border-turquoise focus:outline-none"
                            required
                        />
                        <label htmlFor="agreeToTerms" className="text-xs text-light-gray">
                            I agree to receive marketing communications and have read the{' '}
                            <a href="/privacy-policy" className="text-turquoise hover:underline">Privacy Policy</a>
                            {' '}and{' '}
                            <a href="/terms-of-service" className="text-turquoise hover:underline">Terms of Service</a>
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Creating Account...
                            </span>
                        ) : (
                            'Join Now & Earn Bonus Points'
                        )}
                    </Button>
                </form>

                <p className="text-xs text-center text-light-gray mt-6">
                    Powered by <span className="text-turquoise">Velto</span>
                </p>
            </motion.div>
        </section>
    );
}
