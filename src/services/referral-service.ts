import api from '@/lib/api';

type ValidateReferralResponse =
    | { success: true; data: { referrer_name: string; valid: boolean } }
    | { success: false; error: string };

type ApplyReferralResponse =
    | { success: true; message: string; data: { referrer_name: string } }
    | { success: false; error: string };

export async function validateReferral(referral_code: string, project_slug: string): Promise<ValidateReferralResponse> {
    try {
        const response = await api.post('/referral/public/validate', {
            referral_code,
            project_slug
        });

        if (response.data.success) {
            return {
                success: true,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Failed to validate referral code'
            };
        }
    } catch (error: unknown) {
        let errorMsg = 'Network error';
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
            errorMsg = (error.response as { data?: { error?: string } }).data?.error || errorMsg;
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }
        return {
            success: false,
            error: errorMsg
        };
    }
}

export async function applyReferral(
    referral_code: string,
    referred_email: string | undefined,
    referred_phone: string | undefined,
    project_slug: string
): Promise<ApplyReferralResponse> {
    try {
        const response = await api.post('/referral/public/apply', {
            referral_code,
            referred_email,
            referred_phone,
            project_slug
        });

        if (response.data.success) {
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } else {
            return {
                success: false,
                error: response.data.error || 'Failed to apply referral'
            };
        }
    } catch (error: unknown) {
        let errorMsg = 'Network error';
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
            errorMsg = (error.response as { data?: { error?: string } }).data?.error || errorMsg;
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }
        return {
            success: false,
            error: errorMsg
        };
    }
}
