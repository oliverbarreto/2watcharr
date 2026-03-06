import { LabcastARRIntegration } from '../domain/models';

export interface LabcastARRCreateEpisodeRequest {
    channel_id: number;
    video_url: string;
    tags?: string[];
    audio_language?: string;
    audio_quality?: string;
}

export interface LabcastARRBulkCreateRequest {
    channel_id: number;
    video_urls: string[];
    tags?: string[];
    audio_language?: string;
    audio_quality?: string;
}

export interface LabcastARREpisodeResponse {
    id: number;
    channel_id: number;
    video_id: string;
    video_url: string;
    title: string;
    status: string;
    // ... other fields as needed
}

export interface LabcastARRBulkResponse {
    results: {
        video_url: string;
        success: boolean;
        episode_id: number | null;
        error: string | null;
    }[];
    created: number;
    failed: number;
}

export class LabcastARRClient {
    private apiUrl: string;
    private apiToken: string;

    constructor(integration: Pick<LabcastARRIntegration, 'apiUrl' | 'apiToken'>) {
        this.apiUrl = integration.apiUrl.replace(/\/$/, '');
        this.apiToken = integration.apiToken;
    }


    /**
     * Test connection to LabcastARR
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/health/`, {
                headers: {
                    'X-Integration-Token': this.apiToken,
                },
            });
            return response.ok;
        } catch (error) {
            console.error('LabcastARR Connection Test Error:', error);
            return false;
        }
    }

    /**
     * Create a single episode in LabcastARR
     */
    async createEpisode(request: LabcastARRCreateEpisodeRequest): Promise<LabcastARREpisodeResponse> {
        const response = await fetch(`${this.apiUrl}/v1/integration/episodes`, {
            method: 'POST',
            headers: {
                'X-Integration-Token': this.apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create episode in LabcastARR');
        }

        return await response.json();
    }

    /**
     * Create multiple episodes in LabcastARR (Bulk)
     */
    async createEpisodesBulk(request: LabcastARRBulkCreateRequest): Promise<LabcastARRBulkResponse> {
        const response = await fetch(`${this.apiUrl}/v1/integration/episodes/bulk`, {
            method: 'POST',
            headers: {
                'X-Integration-Token': this.apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to bulk create episodes in LabcastARR');
        }

        return await response.json();
    }
}
