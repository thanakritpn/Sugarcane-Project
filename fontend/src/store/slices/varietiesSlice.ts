import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../services/api';

export interface Variety {
    _id?: string;
    id: number;
    name: string;
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
        const data = await api.getAllVarieties();
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
        const data = await api.searchVarieties(filters);
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
            state.filters[action.payload.filterType] = action.payload.value;
        },
        applyFilters: (state) => {
            let filtered = state.items;

            if (state.filters.soil) {
                filtered = filtered.filter(item => item.soil_type === state.filters.soil);
            }
            if (state.filters.pest) {
                filtered = filtered.filter(item => item.pest.includes(state.filters.pest));
            }
            if (state.filters.disease) {
                filtered = filtered.filter(item => item.disease.includes(state.filters.disease));
            }

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
