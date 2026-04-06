import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Particles from '@/components/ui/Particles';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, router]);

    return (
        <section className="min-h-screen bg-black flex items-center justify-center p-4">
            <Particles count={25} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center relative z-10"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 bg-turquoise/10 border-2 border-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <svg className="w-10 h-10 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl font-bold text-white mb-3"
                >
                    Velto
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-light-gray text-lg mb-2"
                >
                    Loyalty &amp; Rewards Platform
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-dark-gray text-sm mb-8"
                >
                    by Unknown Studio
                </motion.p>

                <motion.a
                    href="/sign-in"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-turquoise text-black font-semibold rounded-lg hover:bg-turquoise/80 transition-colors shadow-smaller-outer"
                >
                    Sign In
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </motion.a>
            </motion.div>
        </section>
    );
}
