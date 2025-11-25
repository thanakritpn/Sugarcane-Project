import axios from 'axios';
import { Variety } from '../store/slices/varietiesSlice';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ==================== READ APIs ====================

// Get all varieties
export const getAllVarieties = async (): Promise<Variety[]> => {
    const response = await api.get<Variety[]>('/varieties');
    return response.data;
};

// Get variety by ID
export const getVarietyById = async (id: string): Promise<Variety> => {
    const response = await api.get<Variety>(`/varieties/${id}`);
    return response.data;
};

// Search varieties with filters
export const searchVarieties = async (filters: {
    soil?: string;
    pest?: string;
    disease?: string;
}): Promise<Variety[]> => {
    const params = new URLSearchParams();
    if (filters.soil) params.append('soil', filters.soil);
    if (filters.pest) params.append('pest', filters.pest);
    if (filters.disease) params.append('disease', filters.disease);

    const response = await api.get<Variety[]>(`/varieties/search?${params.toString()}`);
    return response.data;
};

// ==================== CREATE API ====================

// Create new variety
export const createVariety = async (variety: Omit<Variety, 'id'>): Promise<Variety> => {
    const response = await api.post<{ message: string; data: Variety }>('/varieties', variety);
    return response.data.data;
};

// ==================== UPDATE API ====================

// Update variety
export const updateVariety = async (id: string, variety: Partial<Variety>): Promise<Variety> => {
    const response = await api.put<{ message: string; data: Variety }>(`/varieties/${id}`, variety);
    return response.data.data;
};

// ==================== DELETE API ====================

// Delete variety
export const deleteVariety = async (id: string): Promise<void> => {
    await api.delete(`/varieties/${id}`);
};

// ==================== SEED API (for testing) ====================

// Seed initial data
export const seedData = async (): Promise<void> => {
    await api.post('/seed');
};

export default api;
