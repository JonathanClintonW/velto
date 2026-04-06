import api from '@/lib/api';
import type {
    LeadProfile, PointsSummary, PointTransaction, Reward,
    Redemption, ReferralInfo, Receipt, TierProgress, Pagination
} from '@/types';

// ── Profile ──────────────────────────────────────────────────────────
export async function getProfile() {
    const res = await api.get('/lead-portal/profile');
    return res.data as { success: boolean; data: LeadProfile };
}

// ── Points ───────────────────────────────────────────────────────────
export async function getPointsSummary() {
    const res = await api.get('/lead-portal/points');
    return res.data as { success: boolean; data: PointsSummary };
}

// ── Transactions ─────────────────────────────────────────────────────
export async function getTransactions(params: { page?: number; limit?: number; type?: string }) {
    const res = await api.get('/lead-portal/transactions', { params });
    return res.data as { success: boolean; data: PointTransaction[]; pagination: Pagination };
}

// ── Referral ─────────────────────────────────────────────────────────
export async function getReferralInfo() {
    const res = await api.get('/lead-portal/referral');
    return res.data as { success: boolean; data: ReferralInfo };
}

// ── Rewards ──────────────────────────────────────────────────────────
export async function getRewards(params: { page?: number; limit?: number; category?: string; type?: string; featured?: string }) {
    const res = await api.get('/lead-portal/rewards', { params });
    return res.data as { success: boolean; data: Reward[]; pagination: Pagination };
}

// ── Redeem ───────────────────────────────────────────────────────────
export async function redeemReward(data: { reward_id: string; variant_id?: string; delivery_address?: string; notes?: string }) {
    const res = await api.post('/lead-portal/redeem', data);
    return res.data as {
        success: boolean;
        message: string;
        data: {
            redemption_id: string;
            slug: string;
            status: string;
            points_spent: number;
            remaining_points: number;
            digital_code?: string;
        };
    };
}

// ── Redemptions ──────────────────────────────────────────────────────
export async function getRedemptions(params: { page?: number; limit?: number; status?: string }) {
    const res = await api.get('/lead-portal/redemptions', { params });
    return res.data as { success: boolean; data: Redemption[]; pagination: Pagination };
}

// ── Submit receipt ───────────────────────────────────────────────────
export async function submitReceipt(data: {
    receipt?: File;
    receipt_type?: string;
    merchant_name?: string;
    purchase_amount?: number;
    purchase_date?: string;
    notes?: string;
}) {
    const formData = new FormData();
    if (data.receipt) formData.append('receipt', data.receipt);
    if (data.receipt_type) formData.append('receipt_type', data.receipt_type);
    if (data.merchant_name) formData.append('merchant_name', data.merchant_name);
    if (data.purchase_amount !== undefined) formData.append('purchase_amount', String(data.purchase_amount));
    if (data.purchase_date) formData.append('purchase_date', data.purchase_date);
    if (data.notes) formData.append('notes', data.notes);

    const res = await api.post('/lead-portal/submit-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data as { success: boolean; message: string; data: { id: string; slug: string; status: string } };
}

// ── Receipts ─────────────────────────────────────────────────────────
export async function getReceipts(params: { page?: number; limit?: number; status?: string }) {
    const res = await api.get('/lead-portal/receipts', { params });
    return res.data as { success: boolean; data: Receipt[]; pagination: Pagination };
}

// ── Tiers ────────────────────────────────────────────────────────────
export async function getTierProgress() {
    const res = await api.get('/lead-portal/tiers');
    return res.data as { success: boolean; data: TierProgress };
}
