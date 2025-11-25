import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export interface Variety {
    _id?: string;
    id: number;
    name: string;
    description?: string;  // คำอธิบายพันธุ์อ้อย
    soil_type: string;
    pest: string[];  // เปลี่ยนเป็น array
    disease: string[];  // เปลี่ยนเป็น array
    yield: string;
    age: string;
    sweetness: string;
    variety_image: string;
    parent_varieties?: string;
    growth_characteristics?: string[];
    planting_tips?: string[];
    suitable_for?: string[];
}

interface VarietiesState {
    items: Variety[];
    filteredItems: Variety[];
    filters: {
        soil: string;
        pest: string;
        disease: string;
    };
    loading: boolean;
    error: string | null;
}

const initialState: VarietiesState = {
    items: [],
    filteredItems: [],
    filters: {
        soil: '',
        pest: '',
        disease: '',
    },
    loading: false,
    error: null,
};

// ==================== Async Thunks ====================

// Fetch all varieties from API
export const fetchVarieties = createAsyncThunk(
    'varieties/fetchAll',
    async () => {
        console.log('📡 Fetching all varieties...');
        const data = await api.getAllVarieties();
        console.log('✅ Fetched varieties:', data.length);
        // Convert _id to id for frontend compatibility
        return data.map((item: any, index) => ({
            ...item,
            id: item._id || index + 1
        }));
    }
);

// Search varieties with filters
export const searchVarietiesAsync = createAsyncThunk(
    'varieties/search',
    async (filters: { soil?: string; pest?: string; disease?: string }) => {
        console.log('🔎 Searching varieties with filters:', filters);
        const data = await api.searchVarieties(filters);
        console.log('✅ Search results:', data.length, 'varieties found');
        return data.map((item: any, index) => ({
            ...item,
            id: item._id || index + 1
        }));
    }
);

// ==================== Slice ====================

const varietiesSlice = createSlice({
    name: 'varieties',
    initialState,
    reducers: {
        setFilter: (state, action: PayloadAction<{ filterType: 'soil' | 'pest' | 'disease'; value: string }>) => {
            console.log('🔍 Setting filter:', action.payload.filterType, '=', action.payload.value);
            state.filters[action.payload.filterType] = action.payload.value;
        },
        applyFilters: (state) => {
            console.log('🎯 Applying filters:', state.filters);
            console.log('📊 Total items before filter:', state.items.length);
            let filtered = state.items;

            if (state.filters.soil) {
                console.log('🌱 Filtering by soil:', state.filters.soil);
                const beforeCount = filtered.length;
                filtered = filtered.filter(item => item.soil_type === state.filters.soil);
                console.log(`  ✓ Soil filter: ${beforeCount} → ${filtered.length} items`);
            }
            if (state.filters.pest) {
                console.log('🐛 Filtering by pest:', state.filters.pest);
                const beforeCount = filtered.length;
                filtered = filtered.filter(item => item.pest.includes(state.filters.pest));
                console.log(`  ✓ Pest filter: ${beforeCount} → ${filtered.length} items`);
            }
            if (state.filters.disease) {
                console.log('🦠 Filtering by disease:', state.filters.disease);
                const beforeCount = filtered.length;
                filtered = filtered.filter(item => item.disease.includes(state.filters.disease));
                console.log(`  ✓ Disease filter: ${beforeCount} → ${filtered.length} items`);
            }

            console.log('✅ Final filtered items:', filtered.length);
            state.filteredItems = filtered;
        },
        resetFilters: (state) => {
            state.filters = { soil: '', pest: '', disease: '' };
            state.filteredItems = state.items;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch varieties
            .addCase(fetchVarieties.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVarieties.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.filteredItems = action.payload;
            })
            .addCase(fetchVarieties.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch varieties';
            })
            // Search varieties
            .addCase(searchVarietiesAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchVarietiesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.filteredItems = action.payload;
            })
            .addCase(searchVarietiesAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to search varieties';
            });
    },
});

export const { setFilter, applyFilters, resetFilters } = varietiesSlice.actions;
export default varietiesSlice.reducer;
