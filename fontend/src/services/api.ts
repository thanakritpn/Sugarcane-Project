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
    soil_type?: string | string[];
    pest?: string | string[];
    disease?: string | string[];
    name?: string;
}): Promise<Variety[]> => {
    const params = new URLSearchParams();
    if (filters.soil_type) {
        const soilTypes = Array.isArray(filters.soil_type) ? filters.soil_type : [filters.soil_type];
        soilTypes.forEach(st => params.append('soil_type', st));
    }
    if (filters.pest) {
        const pests = Array.isArray(filters.pest) ? filters.pest : [filters.pest];
        pests.forEach(p => params.append('pest', p));
    }
    if (filters.disease) {
        const diseases = Array.isArray(filters.disease) ? filters.disease : [filters.disease];
        diseases.forEach(d => params.append('disease', d));
    }
    if (filters.name) params.append('name', filters.name);

    const url = `/varieties/search?${params.toString()}`;
    console.log('🌐 API Request URL:', url);
    console.log('📦 Filters sent:', filters);

    const response = await api.get<Variety[]>(url);
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

// ==================== FAVORITE APIs ====================

// Get user's favorites (return full Variety objects)
export const getUserFavorites = async (userId: string): Promise<Variety[]> => {
    const response = await api.get<{ message: string; data: Variety[] }>(`/favorites/${userId}`);
    return response.data.data;
};

// Add favorite
export const addFavorite = async (userId: string, varietyId: string): Promise<void> => {
    await api.post('/favorites', { userId, varietyId });
};

// Remove favorite
export const removeFavorite = async (userId: string, varietyId: string): Promise<void> => {
    await api.delete(`/favorites/${userId}/${varietyId}`);
};

// ==================== SEED API (for testing) ====================

// Seed initial data
export const seedData = async (): Promise<void> => {
    await api.post('/seed');
};

// ==================== SHOP APIs ====================

export interface ShopInventoryItem {
    _id: string;
    shopId: {
        _id: string;
        username: string;
        email: string;
        shopName: string;
        phone: string;
        address: string;
        district: string;
        province: string;
    };
    varietyId: string;
    price: number;
    status: 'available' | 'out_of_stock';
    quantity?: number;
    createdAt: string;
    updatedAt: string;
}

// Get all shops selling a specific variety
export const getShopsSellingVariety = async (varietyId: string): Promise<ShopInventoryItem[]> => {
    const response = await api.get<ShopInventoryItem[]>(`/shop-inventory/variety/${varietyId}`);
    return response.data;
};

// ==================== CART APIs ====================

export interface CartItem {
    _id: string;
    userId: string;
    shopId: {
        _id: string;
        username: string;
        email: string;
        shopName: string;
        phone: string;
        address: string;
        district: string;
        province: string;
    };
    varietyId: {
        _id: string;
        name: string;
        variety_image: string;
    };
    price: number;
    quantity: number;
    status: 'pending' | 'paid' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

// Add item to cart
export const addToCart = async (userId: string, shopId: string, varietyId: string, price: number, quantity: number = 1): Promise<CartItem> => {
    const response = await api.post<{ message: string; data: CartItem }>('/cart', {
        userId,
        shopId,
        varietyId,
        price,
        quantity
    });
    return response.data.data;
};

// Get user's cart
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
    const response = await api.get<{ message: string; data: CartItem[] }>(`/cart/${userId}`);
    return response.data.data;
};

// Update cart item
export const updateCartItem = async (cartId: string, quantity?: number, status?: string): Promise<CartItem> => {
    const response = await api.put<{ message: string; data: CartItem }>(`/cart/${cartId}`, {
        quantity,
        status
    });
    return response.data.data;
};

// Remove item from cart
export const removeFromCart = async (cartId: string): Promise<void> => {
    await api.delete(`/cart/${cartId}`);
};

// Clear user's entire cart
export const clearCart = async (userId: string): Promise<void> => {
    await api.delete(`/cart-clear/${userId}`);
};

export default api;
