'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { claimPoints } from '@/services/qrgenerator-service';

type Mode = 'manual' | 'scan' | 'upload';

export default function ClaimPage() {
    const { lead, refreshProfile } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<{ message: string; points: number } | null>(null);
    const [mode, setMode] = useState<Mode>('manual');
    const [scanning, setScanning] = useState(false);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [scanningFile, setScanningFile] = useState(false);
    const scannerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const html5QrRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null);

    const stopScanner = useCallback(async () => {
        if (html5QrRef.current) {
            try {
                const state = html5QrRef.current.getState();
                if (state === 2) {
                    await html5QrRef.current.stop();
                }
            } catch { /* ignore */ }
            html5QrRef.current = null;
        }
        setScanning(false);
    }, []);

    const handleClaim = useCallback(async (slug: string) => {
        if (!slug.trim()) return;

        setError('');
        setSuccess(null);
        setLoading(true);

        try {
            const identifier = lead?.email || lead?.phone || '';
            const res = await claimPoints(slug.trim(), identifier);
            if (res.success) {
                setSuccess({ message: res.message || 'Points claimed!', points: res.data?.points_awarded || 0 });
                setCode('');
                await refreshProfile();
            } else {
                setError(res.error || 'Failed to claim points.');
            }
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Failed to claim points.';
            setError(msg || 'Failed to claim points.');
        } finally {
            setLoading(false);
        }
    }, [lead, refreshProfile]);

    const startScanner = useCallback(async () => {
        if (!scannerRef.current) return;

        setError('');
        setSuccess(null);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            html5QrRef.current = scanner;
            setScanning(true);

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 220, height: 220 } },
                (decodedText) => {
                    let slug = decodedText;
                    try {
                        const url = new URL(decodedText);
                        const parts = url.pathname.split('/').filter(Boolean);
                        if (parts.length >= 2 && parts[0] === 'claim') {
                            slug = parts[1];
                        } else if (parts.length >= 1) {
                            slug = parts[parts.length - 1];
                        }
                    } catch {
                        // Not a URL - use as-is
                    }

                    stopScanner();
                    setCode(slug);
                    handleClaim(slug);
                },
                () => { /* ignore scan failures */ }
            );
        } catch {
            setError('Unable to access camera. Please check permissions or enter the code manually.');
            setScanning(false);
        }
    }, [stopScanner, handleClaim]);

    const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setSuccess(null);
        setScanningFile(true);

        // Show preview
        const previewUrl = URL.createObjectURL(file);
        setUploadPreview(previewUrl);

        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-file-scanner', /* verbose= */ false);
            const decodedText = await scanner.scanFile(file, /* showImage= */ false);

            let slug = decodedText;
            try {
                const url = new URL(decodedText);
                const parts = url.pathname.split('/').filter(Boolean);
                if (parts.length >= 2 && parts[0] === 'claim') {
                    slug = parts[1];
                } else if (parts.length >= 1) {
                    slug = parts[parts.length - 1];
                }
            } catch {
                // Not a URL - use as-is
            }

            setCode(slug);
            await handleClaim(slug);
        } catch {
            setError('Could not read QR code from this image. Please try a clearer photo.');
        } finally {
            setScanningFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [handleClaim]);

    useEffect(() => {
        if (mode === 'scan') {
            startScanner();
        } else {
            stopScanner();
        }
        if (mode !== 'upload') {
            if (uploadPreview) URL.revokeObjectURL(uploadPreview);
            setUploadPreview(null);
        }
        return () => { stopScanner(); };
    }, [mode, startScanner, stopScanner]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleClaim(code);
    };

    return (
        <DashboardLayout title="Claim Points">
            <div className="space-y-4">
                {/* Mode Toggle */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            mode === 'manual' ? 'bg-turquoise text-black' : 'text-dark-gray hover:text-white'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Code
                    </button>
                    <button
                        onClick={() => setMode('scan')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            mode === 'scan' ? 'bg-turquoise text-black' : 'text-dark-gray hover:text-white'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Scan
                    </button>
                    <button
                        onClick={() => setMode('upload')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            mode === 'upload' ? 'bg-turquoise text-black' : 'text-dark-gray hover:text-white'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload
                    </button>
                </div>

                {mode === 'manual' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-turquoise/10 border-2 border-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <h2 className="text-white font-bold text-lg">Enter QR Code</h2>
                            <p className="text-dark-gray text-sm mt-1">
                                Enter the code from a QR scan or promotional material
                            </p>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter code"
                                className="w-full px-3 py-2 bg-darker-gray text-white rounded-lg text-center text-lg tracking-wider placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-turquoise"
                                autoFocus
                            />

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-4 text-center"
                                >
                                    <p className="text-turquoise font-bold text-2xl">+{success.points}</p>
                                    <p className="text-light-gray text-sm">{success.message}</p>
                                </motion.div>
                            )}

                            <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                                Claim Points
                            </Button>
                        </form>
                    </motion.div>
                )}

                {mode === 'scan' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-4 overflow-hidden"
                    >
                        <div
                            id="qr-reader"
                            ref={scannerRef}
                            className="w-full rounded-lg overflow-hidden"
                            style={{ minHeight: scanning ? 280 : 0 }}
                        />

                        {!scanning && !error && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise mb-3" />
                                <p className="text-dark-gray text-sm">Starting camera...</p>
                            </div>
                        )}

                        {error && (
                            <div className="text-center py-8">
                                <p className="text-red-400 text-sm mb-4">{error}</p>
                                <Button variant="ghost" onClick={() => { setError(''); setMode('manual'); }}>
                                    Enter code manually
                                </Button>
                            </div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-4 text-center mt-4"
                            >
                                <p className="text-turquoise font-bold text-2xl">+{success.points}</p>
                                <p className="text-light-gray text-sm">{success.message}</p>
                            </motion.div>
                        )}

                        {scanning && (
                            <p className="text-dark-gray text-xs text-center mt-3">
                                Point your camera at a QR code
                            </p>
                        )}
                    </motion.div>
                )}

                {mode === 'upload' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card rounded-xl p-6"
                    >
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-turquoise/10 border-2 border-turquoise/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-7 h-7 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-white font-bold text-lg">Upload QR Image</h2>
                            <p className="text-dark-gray text-sm mt-1">
                                Upload a photo or screenshot of a QR code
                            </p>
                        </div>

                        <div id="qr-file-scanner" className="hidden" />

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {!uploadPreview && !success && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={scanningFile}
                                className="w-full border-2 border-dashed border-dark-gray/50 hover:border-turquoise/50 rounded-xl p-8 transition-colors group"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 bg-white/5 group-hover:bg-turquoise/10 rounded-full flex items-center justify-center transition-colors">
                                        <svg className="w-6 h-6 text-dark-gray group-hover:text-turquoise transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">Tap to select image</p>
                                        <p className="text-dark-gray text-xs mt-1">PNG, JPG, or screenshot</p>
                                    </div>
                                </div>
                            </button>
                        )}

                        {uploadPreview && (
                            <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden bg-darker-gray flex items-center justify-center p-4">
                                    <img
                                        src={uploadPreview}
                                        alt="QR code"
                                        className="max-h-48 rounded-lg object-contain"
                                    />
                                    {scanningFile && (
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-turquoise" />
                                            <p className="text-white text-sm">Reading QR code...</p>
                                        </div>
                                    )}
                                </div>
                                {!scanningFile && !success && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            URL.revokeObjectURL(uploadPreview);
                                            setUploadPreview(null);
                                            setError('');
                                            fileInputRef.current?.click();
                                        }}
                                        className="w-full"
                                    >
                                        Try another image
                                    </Button>
                                )}
                            </div>
                        )}

                        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-turquoise/5 border border-turquoise/20 rounded-lg p-4 text-center mt-4"
                            >
                                <p className="text-turquoise font-bold text-2xl">+{success.points}</p>
                                <p className="text-light-gray text-sm">{success.message}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
