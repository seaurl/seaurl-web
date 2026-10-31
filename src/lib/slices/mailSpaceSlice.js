import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "@/lib/axios";

export const addMailProvider = createAsyncThunk('mailSpace/addMailProvider', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/addProvider`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const updateMailProvider = createAsyncThunk('mailSpace/updateMailProvider', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/updateProvider`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getMailProvider = createAsyncThunk('mailSpace/getMailProvider', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/mail/getProvider`, {
            signal: params.abortController.signal,
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getMailMessages = createAsyncThunk('mailSpace/getMailMessages', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/getMessages`, params.data, {
            signal: params.abortController.signal,
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const deleteMailProvider = createAsyncThunk('mailSpace/deleteMailProvider', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/space/crud/mail/deleteProvider/${params.id}`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const reSyncMail = createAsyncThunk('mailSpace/reSyncMail', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/resync`, {
            email: params.email
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const setMailMessage = createAsyncThunk('mailSpace/setMailMessage', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/setMessage`, params);
        return {
            data: res.data,
            messageId: params.messageId
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const uploadAttachment = createAsyncThunk('mailSpace/uploadAttachment',
    async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/attachment/upload`, params.data, {
            signal: params.abortController.signal,
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const sendMessage = createAsyncThunk('mailSpace/sendMessage',
    async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/mail/sendMessage`, params.formData, {
            signal: params.abortController.signal,
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const deleteMessage = createAsyncThunk('mailSpace/deleteMessage',
    async (params, thunkAPI) => {
        try {
            const res = await axios.delete(`/space/crud/mail/delete/${params}`);
            return res.data
        } catch (error) {
            return thunkAPI.rejectWithValue({errorMsg: error.message});
        }
    });

const initialState = {
    mailProviders: [],
    mailMessageList: [],

    // 邮件列表移动端drawer是否显示
    openMailMessageListDrawer: false,
    // 左侧面板移动端drawer是否显示
    openSidebarDrawer: false,
    // 左侧面板是否显示
    showSidebar: false,
    chooseMailMessage: null,

    // 初始化时看看能不能找到正在同步的邮箱
    foundSyncingMailbox: false,

    showLoading: true,
    isFinished: false,
    pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0
    },
    // 重新同步邮件
    isResyncing: false,
}

export const mailSpaceSlice = createSlice({
    name: 'mailSpace',
    initialState,
    reducers: {
        // setChooseTag(state, action) {
        //     state.chooseTag = action.payload;
        // },
        setOpenMailMessageListDrawer: (state, action) => {
            state.openMailMessageListDrawer = action.payload
        },
        setOpenSidebarDrawer: (state, action) => {
            state.openSidebarDrawer = action.payload
        },
        setShowSidebar: (state, action) => {
            state.showSidebar = action.payload
        },
        setChooseMailMessage: (state, action) => {
            state.chooseMailMessage = action.payload
        },
        setServerData: (state, action) => {
            state.mailProviders = action.payload
            state.showLoading = false
        },
        setFoundSyncingMailbox: (state, action) => {
            state.foundSyncingMailbox = action.payload
        },
        setMailLoading: (state, action) => {
            console.log('--- setMailLoading ---', action.payload)
            state.showLoading = action.payload
        },
        resetMailMessageList: (state, action) => {
            state.mailMessageList = []
            state.chooseMailMessage = null
            state.showLoading = true
            state.isFinished = false
            // state.pagination = {
            //     pageNum: 1,
            //     pageSize: 20,
            //     total: 0
            // }
        },
        startResyncMail: (state, action) => {
            state.showLoading = false
            state.isFinished = false
            state.isResyncing = true
            // state.pagination = {
            //     pageNum: 1,
            //     pageSize: 20,
            //     total: 0
            // }
        },
        setResyncMail: (state, action) => {
            state.isResyncing = action.payload
        },
        setMessageRead: (state, action) => {
            state.mailMessageList = state.mailMessageList.map(item => {
                if (item.id === action.payload.id) {
                    item.isUnread = false
                }
                return item
            })
        },
        setMailProvider: (state, action) => {
            const index = state.mailProviders.findIndex(f => f.id === action.payload.id)
            console.log('setMailProvider index =',index)
            if (index !== -1) {
                state.mailProviders[index].status = "2"
            }
        },
        setMailMessageUrl: (state, action) => {
            const {url,messageId ,fileId} = action.payload
            state.chooseMailMessage.attachments = state.chooseMailMessage.attachments?.map(item => {
                if (item.fileId === fileId) {
                    item.url = url
                }
                return item
            })
            state.mailMessageList = state.mailMessageList.map(item => {
                if (item.id === messageId) {
                    item.attachments = item.attachments?.map(attachment => {
                        if (attachment.fileId === fileId) {
                            attachment.url = url
                        }
                        return attachment
                    })
                }
                return item
            })
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addMailProvider.pending, (state, action) => {
            // state.loadingNotes = true;
        })
            // .addCase(addMailProvider.fulfilled, (state, action) => {
            //     const res = action.payload.data
            //     if (res) {
            //         const children = sortFolderList(res)
            //         let result = {
            //             id: res.id,
            //             name: res.email,
            //             email: res.email,
            //             icon: <MailOutlined/>,
            //             children
            //         }
            //         console.log('---- result ----', result)
            //         state.mailProviders = state.mailProviders.concat([result])
            //     }
            // })
            .addCase(setMailMessage.rejected, (state, action) => {
                console.log('setMailMessage rejected=>', state)
                // state.loadingNotes = false;
            })
            .addCase(setMailMessage.pending, (state, action) => {
                // state.loadingNotes = true;
            })
            .addCase(setMailMessage.fulfilled, (state, action) => {
                console.log('--=-=-=setMailMessage-=-=-=-=', action)
                if (action.payload?.data?.status === 0 && action.payload?.data?.data) {
                    state.mailMessageList = state.mailMessageList.map(item => {
                        if (item.id === action.payload.messageId) {
                            item.isUnread = false
                        }
                        return item
                    })
                }

            })
            .addCase(addMailProvider.rejected, (state, action) => {
                console.log('addMailProvider rejected=>', state)
                // state.loadingNotes = false;
            })
            .addCase(getMailProvider.pending, (state, action) => {
                // state.loadingNotes = true;
            })
            .addCase(getMailProvider.fulfilled, (state, action) => {
                state.mailProviders = action.payload?.data
            })
            .addCase(getMailProvider.rejected, (state, action) => {
                console.log('getMailProvider rejected=>', state)
                // state.loadingNotes = false;
            })
            .addCase(getMailMessages.rejected, (state, action) => {
                console.log('getMailMessages rejected=>', state)
                // state.showLoading = false;
            })
            .addCase(getMailMessages.pending, (state, action) => {
                console.log('action=', action)
                state.showLoading = true;
                //
            })
            .addCase(getMailMessages.fulfilled, (state, action) => {
                console.log('getMailMessages action.payload=', action.payload)
                console.log('getMailMessages state.pagination=', state.pagination)
                console.log('getMailMessages state.mailMessageList=', state.mailMessageList)
                if (action.payload){
                    if (action.payload.data) {
                        const resData = action.payload.data
                        const total = resData.total
                        const pageNum = resData.pageNum
                        const pageSize = resData.pageSize
                        state.pagination.total = total
                        state.pagination.pageNum = pageNum
                        const rows = resData.rows
                        if (pageNum === 1 && state.mailMessageList.length > 0) {
                            // 防止数据重复添加
                            state.mailMessageList = rows
                        } else {
                            state.mailMessageList = state.mailMessageList.concat(rows)
                        }

                        if (state.mailMessageList.length === total) {
                            state.isFinished = true
                        }
                    }
                }
                state.showLoading = false;
            })
    }
})

export const {
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer,
    setShowSidebar,
    setChooseMailMessage,
    resetMailMessageList,
    setServerData,
    setFoundSyncingMailbox,
    setResyncMail,
    setMessageRead,
    setMailProvider,
    setMailMessageUrl,
    startResyncMail,
    setPagination,
    setMailLoading
} = mailSpaceSlice.actions
