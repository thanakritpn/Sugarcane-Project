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
        soil: string[];
        pest: string[];
        disease: string[];
    };
    loading: boolean;
    error: string | null;
}

const initialState: VarietiesState = {
    items: [],
    filteredItems: [],
    filters: {
        soil: [],
        pest: [],
        disease: [],
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
            const { filterType, value } = action.payload;
            const filterArray = state.filters[filterType];
            
            if (filterArray.includes(value)) {
                // Remove if already selected
                state.filters[filterType] = filterArray.filter(item => item !== value);
            } else {
                // Add if not selected
                state.filters[filterType].push(value);
            }
            console.log('🔍 Toggled filter:', filterType, 'Current values:', state.filters[filterType]);
        },
        applyFilters: (state) => {
            console.log('🎯 Applying filters:', state.filters);
            console.log('📊 Total items before filter:', state.items.length);
            let filtered = state.items;

            if (state.filters.soil.length > 0) {
                console.log('🌱 Filtering by soil:', state.filters.soil);
                const beforeCount = filtered.length;
                filtered = filtered.filter(item => state.filters.soil.includes(item.soil_type));
                console.log(`  ✓ Soil filter: ${beforeCount} → ${filtered.length} items`);
            }
            if (state.filters.pest.length > 0) {
                console.log('🐛 Filtering by pest:', state.filters.pest);
                const beforeCount = filtered.length;
                filtered = filtered.filter(item => item.pest.some(p => state.filters.pest.includes(p)));
                console.log(`  ✓ Pest filter: ${beforeCount} → ${filtered.length} items`);
            }
            if (state.filters.disease.length > 0) {
                console.log('🦠 Filtering by disease:', state.filters.disease);
                const beforeCount = filtered.length;
                filtered = filtered.filter(item => item.disease.some(d => state.filters.disease.includes(d)));
                console.log(`  ✓ Disease filter: ${beforeCount} → ${filtered.length} items`);
            }

            console.log('✅ Final filtered items:', filtered.length);
            state.filteredItems = filtered;
        },
        resetFilters: (state) => {
            state.filters = { soil: [], pest: [], disease: [] };
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
