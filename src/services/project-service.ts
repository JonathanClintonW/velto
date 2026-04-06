import api from '@/lib/api';

type ProjectBySlugResponse =
    | { success: true; data: { project: import('@/types').Project } }
    | { success: false; error: string };

export async function getPublicProjectBySlug(slug: string): Promise<ProjectBySlugResponse> {
    try {
        const response = await api.get(`/project/public/${slug}`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (error: unknown) {
        let errorMsg = 'Failed to fetch project';
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
