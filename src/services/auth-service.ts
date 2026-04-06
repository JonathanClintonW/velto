import api from '@/lib/api';
import type { LeadProfile, ProjectOption } from '@/types';

export async function requestOtp(email: string) {
    const res = await api.post('/lead-auth/request-otp', { email });
    return res.data as { success: boolean; message: string };
}

export async function verifyOtp(email: string, otp: string) {
    const res = await api.post('/lead-auth/verify-otp', { email, otp });
    return res.data as {
        success: boolean;
        data: {
            token: string;
            requiresProjectSelection: boolean;
            lead?: LeadProfile;
            project?: { id: string; name: string; slug: string } | null;
            projects?: ProjectOption[];
        };
    };
}

export async function selectProject(token: string, leadId: string) {
    const res = await api.post('/lead-auth/select-project', { token, leadId });
    return res.data as {
        success: boolean;
        data: {
            token: string;
            lead: LeadProfile;
            project: { id: string; name: string; slug: string } | null;
        };
    };
}

export async function checkSession() {
    const res = await api.get('/lead-auth/session');
    return res.data as {
        success: boolean;
        data: {
            lead: LeadProfile;
            project: { id: string; name: string; slug: string } | null;
        };
    };
}
