import axios from 'axios';

export class DataIntegrationService {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    async syncData(data: any): Promise<void> {
        try {
            await axios.post(`${this.apiUrl}/sync`, data);
        } catch (error) {
            console.error('Error syncing data:', error);
            throw new Error('Data synchronization failed');
        }
    }

    async fetchWebsiteContent(): Promise<any> {
        try {
            const response = await axios.get(`${this.apiUrl}/content`);
            return response.data;
        } catch (error) {
            console.error('Error fetching website content:', error);
            throw new Error('Failed to fetch website content');
        }
    }
}