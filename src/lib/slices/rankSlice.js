import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

export const getRankList = createAsyncThunk('rank/getRankList', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/info/rank/getRankBy/${params}`);
        console.log('getRankList res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    rankList: [],
    loadingRankList: true
}

export const rankSlice = createSlice({
    name: 'rank',
    initialState,
    reducers: {
        setRankList(state, action) {
            state.rankList = action.payload;
            state.loadingRankList = false
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getRankList.fulfilled, (state, action) => {
            state.loadingRankList = false;
            state.rankList = action.payload.data
        })
            .addCase(getRankList.rejected, (state, action) => {
                state.loadingRankList = false;
            })
            .addCase(getRankList.pending, (state, action) => {
                state.loadingRankList = true;
            })
    }
})

export const {setRankList} = rankSlice.actions
