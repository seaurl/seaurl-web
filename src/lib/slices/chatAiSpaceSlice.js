import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

export const deleteMessageById = createAsyncThunk('chatAi/deleteMessageById', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/space/crud/chatAi/deleteMessageById/${params.id}`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryMessageList = createAsyncThunk('chatAi/queryMessageList', async (params, thunkAPI) => {
    try {
        const newParams = {
            aiToolId: params.aiToolId,
            message: params.message,
            pageSize: params.pageSize,
            pageNum: params.pageNum,
            role: params.role,
        }
        const res = await axios.post(`/space/crud/chatAi/queryMessageList`, newParams ,{
            signal: params.abortController?.signal,
        });
        console.log('queryMessageList res = =', res)
        return res.data

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addMessage = createAsyncThunk('chatAi/addMessage', async (params, thunkAPI) => {
    try {
        console.log('addMessage params = ', params)
        const res = await axios.post(`/space/crud/chatAi/push`, params);
        console.log('push res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    usedId: '',
    chatAiList: []
}

export const chatAiSpaceSlice = createSlice({
    name: 'chatAiSpace',
    initialState,
    reducers: {
        reset: () => initialState,
        clearBotMessage: (state, action) => {
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    item.botMessage = ''
                    item.reasonMessage = ''
                }
            })
            state.chatAiList = state.chatAiList.slice()
        },
        initChat: (state, action) => {
            const fs = state.chatAiList.filter(f => f.usedId === action.payload)
            // usedId每次都要保持最新
            state.usedId = action.payload
            if (fs.length <= 0) {
                const obj = {
                    usedId: action.payload
                }
                state.chatAiList.push(obj)
            }
        },
        concatMessageForAi: (state, action) => {
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    if (action.payload.botMessage){
                        item.botMessage += action.payload.botMessage
                    }
                    if (action.payload.reasonMessage){
                        item.reasonMessage += action.payload.reasonMessage
                    }
                }
            })
            state.chatAiList = state.chatAiList.slice()
        },
        setMessageByRole: (state, action) => {
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    item.aiToolId = action.payload.aiToolId
                    item.type = action.payload.type
                    item.userMessage = action.payload.userMessage
                    item.file = action.payload.file
                    item.botMessage = ''
                    item.reasonMessage = ''
                }
            })
            state.chatAiList = state.chatAiList.slice()

        },
        setHasMoreChatList: (state, action) => {
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    item.hasMoreChatList = action.payload
                }
            })
            state.chatAiList = state.chatAiList.slice()
        },
        clearChatList: (state, action) => {
            // 一定要加state.loadingChatList = true，因为通过它判断是否显示默认提示组件！
            state.loadingChatList = true
            state.chatMessageList = []
            state.pagination = {
                pageSize: 10,
                pageNum: 0,
                total: 0
            }
        },
        // 接收消息并合并到chatList消息列表中
        concatMessageInChatList: (state, action) => {
            console.log('action=', action)
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    // 如果数组为空，或者跟前一个消息role不相同才能添加
                    if (item.chatMessageList?.length === 0 || (item.chatMessageList?.length > 0
                        && item.chatMessageList[item.chatMessageList.length - 1].role !== action.payload.messageList[0].role)){
                        item.chatMessageList = [
                            ...item.chatMessageList,
                            ...action.payload.messageList
                        ]
                    }
                }
            })
            state.chatAiList = state.chatAiList.slice()
        },
        concatMessageInChatListForAi: (state, action) => {
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    if (item.chatMessageList?.length > 0 && item.chatMessageList[item.chatMessageList.length - 1]
                        && item.chatMessageList[item.chatMessageList.length - 1].role === 'bot') {
                        if (action.payload.message){
                            item.chatMessageList[item.chatMessageList.length - 1].message += action.payload.message
                        }
                        if (action.payload.reasonMessage){
                            item.chatMessageList[item.chatMessageList.length - 1].reasonMessage += action.payload.reasonMessage
                        }
                    }
                }
            })
            state.chatAiList = state.chatAiList.slice()
        },
        // 这里的删除是删除已经保存到后台的bot-message
        // deleteMessageInChatListForAi: (state, action) => {
        //     state.chatAiList.forEach(item => {
        //         if (item.usedId === state.usedId) {
        //             if (item.chatMessageList[item.chatMessageList.length - 1].role === 'bot') {
        //                 item.chatMessageList.pop()
        //             }
        //         }
        //     })
        //     state.chatAiList = state.chatAiList.slice()
        //     // console.log('deleteMessageInChatListForAi action=', action)
        // },
        removeUnSavedBotMessage: (state, action) => {
            state.chatAiList.forEach(item => {
                if (item.usedId === state.usedId) {
                    // 没有id说明就是没有保存到后台的bot-message数据,所以清除
                    if (item.chatMessageList.length > 0 && item.chatMessageList[item.chatMessageList.length - 1].role === 'bot'
                        && !item.chatMessageList[item.chatMessageList.length - 1].id) {
                        item.chatMessageList.pop()
                    }
                }
            })
            state.chatAiList = state.chatAiList.slice()
            // console.log('deleteMessageInChatListForAi action=', action)
        },
        createNewChatAi: (state, action) => {
            const fs = state.chatAiList.filter(f => f.usedId === action.payload)
            // usedId每次都要保持最新
            state.usedId = action.payload
            if (fs.length <= 0) {
                const obj = {
                    usedId: action.payload,
                    chatMessageList: [],
                    firstChatItem: null,
                    hasMoreChatList: true,
                    loadingChatList: true,
                    pagination: {
                        pageNum: 0,
                        pageSize: 10,
                        total: 0
                    }
                }
                state.chatAiList.push(obj)
            }
        },
    },
    extraReducers: (builder) => {
        // builder.addCase(queryMessageList.pending, (state, action) => {
        //     state.chatAiList.forEach(item => {
        //         if (item.usedId === state.usedId) {
        //             item.loadingChatList = true
        //         }
        //     })
        //     state.chatAiList = state.chatAiList.slice()
        // }).addCase(queryMessageList.rejected, (state, action) => {
        //     state.chatAiList.forEach(item => {
        //         if (item.usedId === state.usedId) {
        //             item.loadingChatList = false
        //         }
        //     })
        //     state.chatAiList = state.chatAiList.slice()
        // }).addCase(queryMessageList.fulfilled, (state, action) => {
        //     state.chatAiList.forEach(item => {
        //         if (item.usedId === state.usedId) {
        //             item.loadingChatList = false
        //             console.log('--------------------start----------------------')
        //             console.log('queryMessageList fulfilled hasMoreChatList=', item.hasMoreChatList)
        //             console.log('queryMessageList fulfilled chatMessageList=', item.chatMessageList.length)
        //             console.log('---------------------end---------------------')
        //             if (action.payload?.status === 0) {
        //                 const resData = action.payload.data
        //                 console.log('-------resData---------', resData)
        //                 if (resData) {
        //                     const total = resData.total
        //                     item.pagination.pageNum = resData.pageNum
        //                     item.pagination.pageSize = resData.pageSize
        //                     item.pagination.total = total
        //
        //                     const rows = resData.rows.toReversed()
        //                     if (action.payload.data.pageNum > 1) {
        //                         item.chatMessageList = [
        //                             ...rows,
        //                             ...item.chatMessageList
        //                         ]
        //                     } else {
        //                         item.chatMessageList = rows
        //                     }
        //                     // 后台分页返回合并后的数据给前端，前端不需要再合并了，这样更解决，也解决了前端的合并问题
        //
        //                     if (item.pagination.pageNum === 1 && total > 0){
        //                         item.firstChatItem = resData.rows[0]
        //                     }
        //                     // 注意：只需要在这里设置hasMoreChatList，其它地方不需要，否则会有问题
        //                     item.hasMoreChatList = item.chatMessageList.length < total
        //                         // 当pageNum是第1页并且总数据还不到pageSize，说明根本没分页的必要
        //                         && !(total < item.pagination.pageSize && item.pagination.pageNum === 1)
        //
        //                     // if (rows.length > 0) {
        //                     //     item.pagination.pageNum += 1
        //                     // }
        //                 }
        //             }
        //         }
        //     })
        //     state.chatAiList = state.chatAiList.slice()
        // })
            //     .addCase(queryCategory.fulfilled, (state, action) => {
            //     if (action.payload.data) {
            //         state.chatCategoryList = action.payload.data
            //     }
            // })
        builder.addCase(addMessage.fulfilled, (state, action) => {
                console.log('addMessage action=', action)
                state.chatAiList.forEach(item => {
                    if (item.usedId === state.usedId) {
                        // 添加数据到后台之后，再把后台返回的数据映射到前端数据中，保持一致
                        if (action.payload.data) {
                            item.botMessageId = action.payload.data.id
                        }
                    }
                })
                state.chatAiList = state.chatAiList.slice()
            })
    }
})

export const {
    clearBotMessage,
    initChat,
    reset,
    setShowPanel,
    setChatTitle,
    concatMessageForAi,
    setMessageByRole,
    clearChatList,
    concatMessageInChatList,
    setHasMoreChatList,
    concatMessageInChatListForAi,
    deleteMessageInChatListForAi,
    setDataFromServer,
    createNewChatAi,
    removeUnSavedBotMessage
} = chatAiSpaceSlice.actions
