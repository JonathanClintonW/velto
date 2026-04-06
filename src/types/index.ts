export interface CRM {
    id: string;
    project_id: string;
    active: boolean;
    loyalty_enabled?: boolean;
    point_system?: string;
    tier_system?: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    companyId: string;
    name: string;
    slug: string;
    description?: string;
    status: string;
    settings?: string;
    createdAt: string;
    updatedAt: string;
    crm?: CRM;
}

// ── Lead / Member ────────────────────────────────────────────────────
export interface LeadTier {
    id: string;
    name: string;
    slug?: string;
    color?: string;
    icon?: string;
    minimum_points?: number;
    point_multiplier: number;
    benefits?: string[] | null;
    is_current?: boolean;
    is_achieved?: boolean;
}

export interface LeadProfile {
    id: string;
    firstname: string;
    lastname?: string;
    email?: string;
    phone?: string;
    membership_number?: string;
    loyalty_points: number;
    total_points_earned: number;
    total_points_spent: number;
    tier: LeadTier | null;
    tier_achieved_at?: string;
    created_at: string;
    project?: { id: string; name: string; slug: string } | null;
}

export interface ProjectOption {
    leadId: string;
    crmId: string;
    project: { id: string; name: string; slug: string };
    points: number;
    tier: string | null;
}

// ── Points & Transactions ────────────────────────────────────────────
export interface PointTransaction {
    id: string;
    slug: string;
    type: 'earned' | 'spent' | 'expired' | 'bonus' | 'refund' | 'adjustment' | 'purchase';
    points: number;
    description: string;
    reference_type?: string;
    earning_rule?: { name: string; type: string } | null;
    expires_at?: string;
    created_at: string;
}

export interface PointsSummary {
    balance: number;
    total_earned: number;
    total_spent: number;
    expiring_soon: number;
    current_tier: LeadTier | null;
    tiers: LeadTier[];
    recent_transactions: PointTransaction[];
}

// ── Rewards ──────────────────────────────────────────────────────────
export interface RewardVariant {
    id: string;
    name: string;
    sku?: string;
    points_cost: number;
    stock_quantity?: number;
    variant_data?: Record<string, string> | null;
}

export interface Reward {
    id: string;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    type: string;
    category?: string;
    points_cost: number;
    cash_value?: number;
    image_url?: string;
    featured: boolean;
    stock_quantity?: number;
    unlimited_stock: boolean;
    tier_required?: string;
    tier_color?: string;
    terms_conditions?: string;
    usage_instructions?: string;
    booking_required: boolean;
    can_afford: boolean;
    variants: RewardVariant[];
}

// ── Redemptions ──────────────────────────────────────────────────────
export interface Redemption {
    id: string;
    slug: string;
    points_spent: number;
    status: string;
    description?: string;
    fulfillment_method: string;
    tracking_number?: string;
    digital_code?: string;
    voucher_code?: string;
    booking_reference?: string;
    scheduled_date?: string;
    notes?: string;
    expiry_date?: string;
    redeemed_at: string;
    approved_at?: string;
    delivered_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    cancelled_reason?: string;
    created_at: string;
    reward: {
        name: string;
        slug: string;
        type: string;
        image_url?: string;
        category?: string;
        points_cost: number;
    };
    variant?: { name: string; sku?: string } | null;
}

// ── Referral ─────────────────────────────────────────────────────────
export interface ReferralInfo {
    referral_code: string | null;
    stats: {
        total: number;
        successful: number;
        points_earned: number;
    };
    earning_rule: {
        points_for_referrer: number;
        points_for_referred: number;
    } | null;
    referrals: {
        id: string;
        status: string;
        referrer_points: number;
        referred_name: string | null;
        created_at: string;
    }[];
}

// ── Receipt ──────────────────────────────────────────────────────────
export interface Receipt {
    id: string;
    slug: string;
    receipt_type: string;
    merchant_name?: string;
    purchase_amount?: number;
    purchase_date?: string;
    status: string;
    points_awarded: number;
    rejection_reason?: string;
    created_at: string;
}

// ── Tier Progress ────────────────────────────────────────────────────
export interface TierProgress {
    current_tier: LeadTier | null;
    next_tier: {
        id: string;
        name: string;
        color?: string;
        minimum_points: number;
        points_needed: number;
    } | null;
    all_tiers: LeadTier[];
}

// ── Pagination ───────────────────────────────────────────────────────
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
