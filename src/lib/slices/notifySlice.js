import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

export const setReadMessage = createAsyncThunk('notify/setReadMessage', async (params, thunkAPI) => {
    try {
        const newParams = {
            isRead: true,
            dialogId: params.dialogId,
            friendId: params.friendId,
            uid: params.uid,
        }
        const res = await axios.post(`/notify/crud/messages/setRead`, newParams);
        console.log('------------ setReadMessage res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getMessages = createAsyncThunk('notify/getMessages', async (params, thunkAPI) => {
    try {
        const notify = thunkAPI.getState().notify
        if (notify.chatListPage.pageNum > 1) {
            // 找到第1个type=websocket的数据，然后赋值给flagCreatedTime即可
            // 为什么找到第1个？因为list中新加的websocket数据是从尾部开始加的，
            // 所以只要从索引0找到到最近一个type=websocket就是从这个时间开始算的，而不是最后一个
            const i = notify.chatList.findIndex(item => item.type === 'websocket')
            if (i > -1) {
                params.flagCreatedTime = notify.chatList[i].createdDt
            }
        }


        const res = await axios.post(`/notify/crud/messages/getMessages`, {
            dialogId: params.dialogId,
            pageNum: params.pageNum,
            pageSize: params.pageSize,
            flagCreatedTime: params.flagCreatedTime
        });
        console.log('------------ getMessages res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const pushMessage = createAsyncThunk('notify/pushMessage', async (params, thunkAPI) => {
    try {
        const newParams = {
            message: params.message,
            friendId: params.friendId,
            uid: params.uid,
        }
        const res = await axios.post(`/notify/crud/messages/pushMessage`, newParams);
        console.log('------------ pushMessage res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getMailboxes = createAsyncThunk('notify/getMailboxes', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/notify/crud/messages/getMailbox`);
        console.log('------------ getMailboxes res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 获取用户信息
// export const getUserInfo = createAsyncThunk('notify/getUserInfo', async (_, thunkAPI) => {
//   try {
//     const {me} = thunkAPI.getState().auth;
//     const res = await axios.get(`/account/crud/getAccountBaseInfo`);
//     // console.log('------------ getUserInfo res => ', res)
//     if (res.data.status === 0) {
//       return res.data;
//     } else {
//       return thunkAPI.rejectWithValue({errorMsg: res.data.message});
//     }
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

export const getMyselfInfo = createAsyncThunk('user/getMyselfInfo', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/info/${params.userName}`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserInfoByUid = createAsyncThunk('notify/getUserInfoByUid', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/info/getUserInfoByUid/${params.uid}`);
        console.log('------------ getUserInfoByUid res => ', res)
        if (res.data) {
            return res.data;
        } else {
            return null;
        }

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getRemindList = createAsyncThunk('notify/getRemindList', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            // userName: params.userName,
            pageNum: params.pageNum,
            pageSize: params.pageSize,
        }
        const res = await axios.post(`/notify/crud/remind/getRemindList`, newParams);
        console.log('------------ getRemindList res => ', res)
        if (res.data) {
            return res.data;
        } else {
            return null;
        }

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const setReadRemind = createAsyncThunk('notify/setReadRemind', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            isRead: true
        }
        const res = await axios.post(`/notify/crud/remind/setRead`, newParams);
        console.log('------------ setReadRemind res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const pushFirstChatInMailBox = createAsyncThunk('notify/pushFirstChatInMailBox', async (params, thunkAPI) => {
    try {
        const newParams = {
            friendId: params.friendId,
            uid: params.uid,
        }
        const res = await axios.post(`/notify/crud/messages/pushFirstChatInMailBox`, newParams);
        console.log('------------ pushMessage res=>', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    remindList: [],
    remindListTotal: 0,
    mailboxes: [],
    chatList: [],
    showChatListLoading: true,
    // 跟currentUserInfo聊天
    currentUserInfo: null,
    // 我自己
    myselfInfo: null,
    loadingMsg: false,
    chatListPage: {
        pageSize: 50,
        pageNum: 1,
        total: 0
    }
}

export const notifySlice = createSlice({
    name: 'notify',
    initialState,
    reducers: {
        reset: () => initialState,
        setDataFromServer: (state, action)=>{
            state.mailboxes = action.payload.mailboxes
            state.myselfInfo = action.payload.myselfInfo
        },
        setMailboxes: (state, action) => {
            console.log('--- setMailboxes ---', action.payload)
            if (action.payload) {
                state.mailboxes.unshift(action.payload)
                state.currentUserInfo = action.payload;
            }
        },
        setCurrentUserInfo: (state, action) => {
            if (action.payload)
                state.currentUserInfo = action.payload;
        },
        clearChatList: (state, action) => {
            state.chatList = []
            state.chatListPage = {
                pageSize: 50,
                pageNum: 1,
                total: 0
            }
        },
        resetChatListPage: (state, action) => {
            state.chatListPage = {
                pageSize: 50,
                pageNum: 1,
                total: 0
            }
        },
        setChatListLoading: (state, action) => {
            state.showChatListLoading = action.payload
        },
// 接收消息并合并到chatList消息列表中
        concatMessageInChatList: (state, action) => {
            if (action.payload.length > 0) {
                action.payload.forEach(item => {
                    item.type = 'websocket';
                })
            }
            state.chatList = [
                ...state.chatList,
                ...action.payload
            ]
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getRemindList.fulfilled, (state, action) => {
            console.log('action.payload.data[0].total.length-', action.payload.data)
            if (action.payload.data && action.payload.data.length > 0) {
                if (action.payload.data[0].total.length === 0) {

                } else {
                    state.remindListTotal = action.payload.data[0].total[0].count;
                    // 小于1页数据不用拼接
                    if (action.payload.data[0].total[0].count < 10){
                        state.remindList = action.payload.data[0].rows
                    }else{
                        state.remindList = state.remindList.concat(action.payload.data[0].rows);
                    }
                }
            }
        })
        .addCase(getRemindList.rejected, (state, action) => {
                console.log('getRemindList rejected=>', state)
        })
        .addCase(getMessages.pending, (state, action) => {
                state.loadingMsg = true;
        })
        .addCase(getMessages.fulfilled, (state, action) => {
            if (action.payload.data) {
                // 获取总数
                const total = action.payload.data.total
                state.chatListPage = {
                    pageSize: action.payload.data.pageSize,
                    pageNum: action.payload.data.pageNum,
                    total: action.payload.data.total
                }

                const rows = action.payload.data.rows.reverse()

                // 这里做这个判断是因为react18 useeffect会执行两次，所以我根据Pagenum判断是否要合并以避免重复合并问题
                if (action.payload.data.pageNum > 2) {
                    state.chatList = [
                        ...rows,
                        ...state.chatList
                    ]
                } else {
                    state.chatList = rows
                }
                // 设置是否要分页加载，InfiniteScroll组件的hasMore属性会用到

                state.showChatListLoading = state.chatList.length < total
                    // 当pageNum是第1页并且总数据还不到pageSize，说明根本没分页的必要
                    && !(total < state.chatListPage.pageSize && state.chatListPage.pageNum === 1)
                // state.loadingMsg = false;
            }
        })
        .addCase(getMessages.rejected, (state, action) => {
            console.log('getRemindList rejected=>', state)
        })
        .addCase(pushMessage.fulfilled, (state, action) => {
            console.log('pushMessage.fulfilled=>', action)
            if (action.payload.data && action.payload.data.dialogId && !state.currentUserInfo.dialogId) {
                state.currentUserInfo = {...state.currentUserInfo, ...{dialogId: action.payload.data.dialogId}};
            }
        })
        .addCase(pushMessage.rejected, (state, action) => {
            console.log('pushMessage rejected=>', state)
        })
        .addCase(getMyselfInfo.fulfilled, (state, action) => {
            console.log('getUserInfo.fulfilled=>', action)
            state.myselfInfo = action.payload.data;
        })
        .addCase(getMyselfInfo.rejected, (state, action) => {
            console.log('getUserInfo.rejected=>', action)
            state.errorMsg = action.payload.errorMsg;
        })
        .addCase(getMailboxes.fulfilled, (state, action) => {
            if (action.payload.data) {
                state.mailboxes = action.payload.data;
            }
        })
        .addCase(getMailboxes.rejected, (state, action) => {
            console.log('getMailboxes rejected=>', state)
        })
    }
})

export const {
    resetChatListPage,
    setMailboxes,
    setCurrentUserInfo,
    reset,
    clearChatList,
    concatMessageInChatList,
    setChatListLoading,
    setDataFromServer
} = notifySlice.actions;
