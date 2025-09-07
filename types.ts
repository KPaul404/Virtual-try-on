
export interface ProcessStep {
    id: number;
    status: 'processing' | 'complete' | 'error' | 'warning';
    title: string;
    description: string;
    imageUrl?: string;
}
