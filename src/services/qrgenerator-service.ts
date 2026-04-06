type ClaimPointsResponse =
    | {
        success: true;
        data: {
            points_awarded: number;
            transaction_id: string;
            current_balance: number;
            redirect_url?: string;
        };
        message: string;
    }
    | { success: false; error: string };

export async function claimPoints(slug: string, identifier: string): Promise<ClaimPointsResponse> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/qr-generator/claim-points/${slug}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ identifier })
        });

        const data = await response.json();

        if (data.success) {
            return {
                success: true,
                data: data.data,
                message: data.message
            };
        } else {
            return {
                success: false,
                error: data.error || 'Failed to claim points'
            };
        }
    } catch (error: unknown) {
        let errorMsg = 'Network error. Please try again.';
        if (error instanceof Error) {
            errorMsg = error.message;
        }
        return {
            success: false,
            error: errorMsg
        };
    }
}
