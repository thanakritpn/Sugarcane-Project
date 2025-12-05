import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface for order/cart items
export interface OrderItem {
  _id: string;
  shopId: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
  };
  varietyId: {
    _id: string;
    name: string;
    variety_image?: string;
  };
  price: number;
  quantity: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Get paid orders for a specific shop
export const getShopPaidOrders = async (shopId: string): Promise<OrderItem[]> => {
  try {
    const response = await api.get<{ message: string; data: OrderItem[] }>(`/cart/orders/${shopId}`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching paid orders:', error);
    throw error;
  }
};

export default api;