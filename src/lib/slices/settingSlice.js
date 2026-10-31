import {createSlice, current, createAsyncThunk} from '@reduxjs/toolkit'
import axios from "@/lib/axios";


// 更新用户信息
export const updateAccountBaseInfo = createAsyncThunk('auth/updateAccountBaseInfo', async (params, thunkAPI) => {
    try {
        // console.log('thunkAPI=>', thunkAPI.getState().auth)
        // const {accessToken} = thunkAPI.getState().auth;
        const res = await axios.post('/users/crud/updateAccountBaseInfo', params);
        console.log('updateAccountBaseInfo res => ', res)
        if (res.data.status === 0) {
            return res.data;
        } else {
            return thunkAPI.rejectWithValue({errorMsg: res.data.message});
        }

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 获取用户信息
export const getAccountBaseInfo = createAsyncThunk('account/getAccountBaseInfo', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/crud/getAccountBaseInfo`);
        if (res.data.status === 0) {
            return res.data;
        } else {
            return thunkAPI.rejectWithValue({errorMsg: res.data.message});
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 上传用户头像
export const uploadAvatar = createAsyncThunk('account/uploadAvatar', async (params, thunkAPI) => {
    try {
        console.log('params=>', params)
        // const {me} = thunkAPI.getState().auth;
        const newparams = {
            avatar: params.avatar,
            // userName: me.name
        }
        const res = await axios.post('/users/crud/uploadAvatar', newparams);
        console.log('updateAccountBaseInfo res => ', res)
        if (res.data.status === 0) {
            return res.data;
        }
        return thunkAPI.rejectWithValue({errorMsg: res.data.message});

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 修改用户名
export const updateAccountName = createAsyncThunk('account/updateAccountName', async (params, thunkAPI) => {
    try {
        // console.log('params=>', params)
        // const {me} = thunkAPI.getState().auth;
        const newparams = {
            newUserName: params.newName
        }
        const res = await axios.post('/users/crud/updateAccountUserName', newparams);
        console.log('updateAccountName res => ', res)
        if (res.data.status === 0) {
            // Cookies.remove('auth.me') // fail!
            // Cookies.remove('auth.isLogin') // fail!
            // Cookies.remove('auth.accessToken') // fail!

            return res
        }
        return thunkAPI.rejectWithValue({errorMsg: res.data.message});

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 修改账户密码
export const updateAccountPassword = createAsyncThunk('account/updateAccountPassword', async (params, thunkAPI) => {
    try {
        console.log('params=>', params)
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            oldPwd: params.oldPwd,
            newPwd: params.newPwd,
            // userName: me.name
        }
        const res = await axios.post('/users/crud/updateAccountPassword', newParams);
        console.log('updateAccountPassword res => ', res)
        if (res.data.status === 0) {
            // Cookies.remove('auth.me') // fail!
            // Cookies.remove('auth.isLogin') // fail!
            // Cookies.remove('auth.accessToken') // fail!
            return res.data;
        }
        return thunkAPI.rejectWithValue({errorMsg: res.data.message});

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 修改账户通知与提醒
export const updateAccountNotice = createAsyncThunk('account/updateAccountNotice', async (params, thunkAPI) => {
    try {
        console.log('params=>', params)
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            notices: params.notices,
            // userName: me.name
        }
        const res = await axios.post('/users/crud/updateAccountNotice', newParams);
        console.log('updateAccountNotice res => ', res)
        // if (res.data.status === 0) {
        //     return {
        //         ...res.data,
        //         notices: params.notices
        //     };
        // }
        return thunkAPI.rejectWithValue({errorMsg: res.data.message});

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 发送更新邮件
export const sendUpdateAccountEmail = createAsyncThunk('account/sendUpdateAccountEmail', async (params, thunkAPI) => {
    try {
        console.log('params=>', params)
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            newEmail: params.newEmail,
            // captchaVerifyParam: params.captchaVerifyParam
        }
        const res = await axios.post('/users/crud/sendUpdateAccountEmail', newParams);
        console.log('updateAccountEmail res => ', res)
        if (res.data.status === 0) {
            return res.data
        }
        return thunkAPI.rejectWithValue({errorMsg: res.data.message});

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 验证账户的更新邮箱的邮件
export const verifyAccountUpdateEmail = createAsyncThunk('account/verifyAccountUpdateEmail', async (params, thunkAPI) => {
    try {
        const newParams = {
            userName: params.userName,
            code: params.code
        }
        const res = await axios.post('/users/info/update/email/verified', newParams);
        console.log('updateAccountEmail res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 更新平台外观
export const updateAccountAppearance = createAsyncThunk('account/updateAccountAppearance', async (params, thunkAPI) => {
    try {
        const res = await axios.post('/users/crud/updateAccountAppearance', params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    errorMsg: '',
    accountUserInfo: null,
    tabs: [{
            key: "profile",
            label: "基本信息",
            icon: 'UserOutlined',
            choosed: false,
            url: "/setting/profile"
        },
        {
            key: "account",
            label: "账号",
            icon: 'SettingOutlined',
            choosed: false,
            url: "/setting/account"
        },
        {
            key: "security",
            label: "账号安全",
            icon: 'LockOutlined',
            choosed: false,
            url: "/setting/security"
        },
        {
            key: "email",
            label: "邮箱",
            icon: 'MailOutlined',
            choosed: false,
            url: "/setting/email"
        },
        // {
        //     key: "notice",
        //     label: "消息",
        //     icon: 'BellOutlined',
        //     choosed: false,
        //     url: "/setting/notice"
        // },
        {
            key: "appearance",
            label: "外观",
            icon: 'BgColorsOutlined',
            choosed: false,
            url: "/setting/appearance"
        }]
}

export const settingSlice = createSlice({
    name: 'setting',
    initialState,
    reducers: {
        setAccountUserInfo(state, action){
            state.accountUserInfo = action.payload
        },
        setTabs: (state, action) => {
            console.log('state=>sdfsfdsdf', current(state))
            state.tabs = state.tabs.map(item => {
                item.choosed = item.key === action.payload.key;
                return item;
            })
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getAccountBaseInfo.fulfilled, (state, action) => {
            console.log('getAccountBaseInfo.fulfilled=>', action)
            state.accountUserInfo = action.payload.data;
        })
        .addCase(getAccountBaseInfo.rejected, (state, action) => {
            console.log('getAccountBaseInfo.rejected=>', action)
            state.errorMsg = action.payload.errorMsg;
        })
        // .addCase(updateAccountBaseInfo.fulfilled, (state, action) => {
        //     console.log('updateAccountBaseInfo.fulfilled=>', action)
        //     // state.accessToken = action.payload.accessToken;
        // })
        // .addCase(updateAccountBaseInfo.rejected, (state, action) => {
        //     console.log('updateAccountBaseInfo.rejected=>', action)
        //     state.errorMsg = action.payload.errorMsg;
        // })
        // .addCase(uploadAvatar.fulfilled, (state, action) => {
        //     console.log('uploadAvatar.fulfilled=>', action)
        //     state.accountUserInfo.avatar = action.payload.data;
        // })
        // .addCase(uploadAvatar.rejected, (state, action) => {
        //     console.log('uploadAvatar.rejected=>', action)
        //     state.errorMsg = action.payload.errorMsg;
        // })
        // .addCase(updateAccountNotice.fulfilled, (state, action) => {
        //     console.log('updateAccountNotice.fulfilled=>', action)
        //     state.accountUserInfo.notices = action.payload.notices;
        // })
        // .addCase(updateAccountNotice.rejected, (state, action) => {
        //     console.log('updateAccountPassword.rejected=>', action)
        //     // state.errorMsg = action.payload.errorMsg;
        // })
        // .addCase(sendUpdateAccountEmail.fulfilled, (state, action) => {
        //     console.log('sendUpdateAccountEmail.fulfilled=>', action)
        //     // state.accountUserInfo.notices = action.payload.notices;
        // })
        // .addCase(sendUpdateAccountEmail.rejected, (state, action) => {
        //     console.log('sendUpdateAccountEmail.rejected=>', action)
        //     // state.errorMsg = action.payload.errorMsg;
        // })
    }
})

export const {setTabs, setAccountUserInfo} = settingSlice.actions;
