'use client';

import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Particles from '@/components/ui/Particles';

export default function ReferralWelcomePage() {
    const router = useRouter();
    const { project: projectSlug } = router.query;

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
                    className="w-20 h-20 bg-turquoise/10 border-2 border-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <svg className="w-10 h-10 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold text-white mb-3"
                >
                    Welcome Aboard!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-light-gray mb-6"
                >
                    Your account has been created successfully. You&apos;ll start earning bonus points right away!
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                >
                    <div className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-4">
                        <p className="text-sm text-light-gray">
                            Thank you for joining through a referral. Both you and your referrer will receive bonus points!
                        </p>
                    </div>

                    <p className="text-xs text-light-gray mt-4">
                        You can close this page now.
                    </p>
                </motion.div>

                <p className="text-xs text-dark-gray mt-6">
                    Powered by <span className="text-turquoise">Velto</span>
                </p>
            </motion.div>
        </section>
    );
}
