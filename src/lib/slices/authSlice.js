import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "@/lib/axios";

export const register = createAsyncThunk('auth/register', async (credentials, thunkAPI) => {
    try {
        const res = await axios.post('/users/web/register', credentials);
        return res.data
    }catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//重新发送邮箱
export const rendAccountEmail = createAsyncThunk('auth/rendAccountEmail', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/web/users/email/resend`, params);
        // console.log('verifyAccountEmail res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const verifyCode = createAsyncThunk('auth/verifyCode', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/info/verify/code`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const isReadNotify = createAsyncThunk('auth/isReadNotify', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/notify/crud/messages/isRead`);
        console.log('------------ isReadNotify res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const refreshToken = createAsyncThunk('auth/refreshToken', async (params, thunkAPI) => {
    try {
        const res = await axios.get('/users/crud/refreshToken');
        // console.log('refreshCookie = ',res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getAccountBaseInfo = createAsyncThunk('auth/getAccountBaseInfo', async (params, thunkAPI) => {
    try {
        const res = await axios.get('/users/crud/getAccountBaseInfo');
        // console.log('refreshCookie = ',res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const logout = createAsyncThunk('auth/logout', async (params, thunkAPI) => {
    try {
        const res = await axios.get('/users/web/logout');
        // console.log('refreshCookie = ',res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const logoutAll = createAsyncThunk('auth/logoutAll', async (params, thunkAPI) => {
    try {
        const res = await axios.get('/users/web/logoutAll');
        // console.log('refreshCookie = ',res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const sendResetPasswordEmail = createAsyncThunk('auth/sendResetPasswordEmail', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/web/reset/sendResetPasswordEmail`, params);
        //console.log('sendResetPasswordEmail res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/web/reset/password`, {
            userName: params.userName,
            newPwd: params.newPwd,
            email: params.email
        });
        //console.log('resetPassword res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    value: 0,
    isReadMessage: true,
    isReadRemind: true,
    accountInfo: null
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        increment: (state) => {
            state.value += 1;
            console.log('increment state value = ', state.value)
        },
        decrement: (state) => {
            state.value -= 1;
            console.log('decrement state value = ', state.value)
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(isReadNotify.fulfilled, (state, action) => {
            console.log('isReadNotify.fulfilled=>', action)
            if (action.payload && action.payload.data) {
                state.isReadMessage = action.payload.data.readMessage;
                state.isReadRemind = action.payload.data.readRemind;
            }
        })
        .addCase(isReadNotify.rejected, (state, action) => {
            console.log('isReadNotify rejected=>', state)
        })
        .addCase(getAccountBaseInfo.fulfilled, (state, action) =>{
            console.log('getAccountBaseInfo res=', action.payload.data)
            if (action.payload && action.payload.data) {
                state.accountInfo = action.payload.data
            }
        }).addCase(getAccountBaseInfo.rejected, (state, action) => {
            console.log('getAccountBaseInfo rejected=>', state)
        })
    }
})

export const { increment, decrement, incrementByAmount } = authSlice.actions;
