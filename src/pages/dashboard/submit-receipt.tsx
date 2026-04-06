'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Button from '@/components/ui/Button';
import { submitReceipt } from '@/services/portal-service';

const RECEIPT_TYPES = ['purchase', 'invoice', 'bill', 'proof_of_service', 'other'] as const;

const RECEIPT_TYPE_LABELS: Record<string, string> = {
    purchase: 'Purchase',
    invoice: 'Invoice',
    bill: 'Bill',
    proof_of_service: 'Proof of Service',
    other: 'Other'
};

export default function SubmitReceiptPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        receipt_type: 'purchase' as typeof RECEIPT_TYPES[number],
        merchant_name: '',
        purchase_amount: '',
        purchase_date: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        setFile(selected);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selected);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError('Please upload a receipt image.');
            return;
        }
        if (!form.merchant_name.trim() || !form.purchase_amount) {
            setError('Merchant name and purchase amount are required.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await submitReceipt({
                receipt: file,
                receipt_type: form.receipt_type,
                merchant_name: form.merchant_name.trim(),
                purchase_amount: parseFloat(form.purchase_amount),
                purchase_date: form.purchase_date || undefined,
                notes: form.notes.trim() || undefined
            });

            if (res.success) {
                setSuccess(true);
                setFile(null);
                setPreview(null);
                setForm({ receipt_type: 'purchase', merchant_name: '', purchase_amount: '', purchase_date: '', notes: '' });
            } else {
                setError((res as unknown as { error?: string }).error || 'Failed to submit receipt.');
            }
        } catch (err: unknown) {
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
                : 'Failed to submit receipt.';
            setError(msg || 'Failed to submit receipt.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = 'w-full px-3 py-2 bg-darker-gray text-white rounded-lg placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-turquoise text-sm';

    return (
        <DashboardLayout title="Submit Receipt">
            <div className="space-y-4">
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card rounded-xl p-8 text-center center flex-col"
                    >
                        <div className="w-16 h-16 bg-turquoise/10 border-2 border-turquoise/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-white font-bold text-lg mb-2">Receipt Submitted!</h2>
                        <p className="text-dark-gray text-sm mb-6">
                            Your receipt is pending review. Points will be awarded once verified.
                        </p>
                        <Button variant="primary" onClick={() => setSuccess(false)}>
                            Submit Another
                        </Button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit}
                        className="glass-card rounded-xl p-6 space-y-4"
                    >
                        <div className="text-center mb-2">
                            <h2 className="text-white font-bold text-lg">Upload Receipt</h2>
                            <p className="text-dark-gray text-sm mt-1">
                                Submit your purchase receipt to earn points
                            </p>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-light-gray text-sm mb-1">Receipt Image *</label>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {preview ? (
                                <div className="relative group">
                                    <img
                                        src={preview}
                                        alt="Receipt preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full h-36 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-turquoise/30 transition-colors"
                                >
                                    <svg className="w-8 h-8 text-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-dark-gray text-sm">Tap to upload receipt image</span>
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-light-gray text-sm mb-1">Receipt Type</label>
                            <select
                                name="receipt_type"
                                value={form.receipt_type}
                                onChange={handleChange}
                                className={inputClasses}
                            >
                                {RECEIPT_TYPES.map(t => (
                                    <option key={t} value={t} className="bg-darker-gray text-white">
                                        {RECEIPT_TYPE_LABELS[t]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-light-gray text-sm mb-1">Merchant Name *</label>
                            <input
                                type="text"
                                name="merchant_name"
                                value={form.merchant_name}
                                onChange={handleChange}
                                placeholder="Store name"
                                className={inputClasses}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-light-gray text-sm mb-1">Amount *</label>
                                <input
                                    type="number"
                                    name="purchase_amount"
                                    value={form.purchase_amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-light-gray text-sm mb-1">Date</label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={form.purchase_date}
                                    onChange={handleChange}
                                    className={`${inputClasses} date-input-white`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-light-gray text-sm mb-1">Notes</label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Any additional details..."
                                rows={3}
                                className={`${inputClasses} resize-none`}
                            />
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                            Submit Receipt
                        </Button>
                    </motion.form>
                )}
            </div>
        </DashboardLayout>
    );
}
