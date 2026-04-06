import api from '@/lib/api';

type LeadMutationResponse =
    | { success: true; data: { membership_number?: string } }
    | { success: false; error: string; data: null };

export async function createReferralLead(leadData: {
    crm_id: string;
    firstname: string;
    lastname?: string;
    email?: string;
    phone?: string;
    source?: string;
    referral_source?: string;
    status?: string;
    qualification?: string;
    gdpr_consent?: boolean;
    marketing_opt_in?: boolean;
}): Promise<LeadMutationResponse> {
    try {
        const response = await api.post('/leads/referral/create', leadData);

        if (response.data.success) {
            return {
                success: true,
                data: response.data.data.lead
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Failed to create lead',
                data: null
            };
        }
    } catch (error: unknown) {
        let errorMsg = 'An error occurred';
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
            errorMsg = (error.response as { data?: { error?: string } }).data?.error || errorMsg;
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }
        return {
            success: false,
            error: errorMsg,
            data: null
        };
    }
}
