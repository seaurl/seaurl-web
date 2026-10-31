import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

// export const addCategory = createAsyncThunk('chatAi/addCategory', async (params, thunkAPI) => {
//     try {
//         const res = await axios.post(`/space/crud/chatAi/category/add`, params);
//         console.log('addCategory res=', res)
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });
//
// export const updateCategory = createAsyncThunk('chatAi/updateCategory', async (params, thunkAPI) => {
//     try {
//         const res = await axios.post(`/space/crud/chatAi/category/update`, params);
//         console.log('updateCategory res=', res)
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });
//
// export const setTopCategory = createAsyncThunk('chatAi/setTopCategory', async (params, thunkAPI) => {
//     try {
//         const res = await axios.post(`/space/crud/chatAi/category/setTop`, params);
//         console.log('setTopCategory res=', res)
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });
//
// export const queryCategory = createAsyncThunk('chatAi/queryCategory', async (params, thunkAPI) => {
//     try {
//         const res = await axios.get(`/space/crud/chatAi/category/query`);
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });
//
// export const deleteCategory = createAsyncThunk('chatAi/deleteCategory', async (params, thunkAPI) => {
//     try {
//         const res = await axios.delete(`/space/crud/chatAi/category/delete/${params.chatAiId}`);
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });
//
// export const deleteMessageById = createAsyncThunk('chatAi/deleteMessageById', async (params, thunkAPI) => {
//     try {
//         const res = await axios.delete(`/space/crud/chatAi/deleteMessageById/${params.id}`);
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });
//
//
//
// export const addMessage = createAsyncThunk('chatAi/addMessage', async (params, thunkAPI) => {
//     try {
//         console.log('addMessage params = ', params)
//         const res = await axios.post(`/space/crud/chatAi/push`, params);
//         console.log('push res=', res)
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });

export const generate = createAsyncThunk('imageAi/generate', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/imageAi/generate`, params);
        console.log('generate res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const add = createAsyncThunk('imageAi/add', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/imageAi/add`, params);
        console.log('add res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const deleteImage = createAsyncThunk('chatAi/deleteImage', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/imageAi/delete/${params.imageAiId}`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryImageList = createAsyncThunk('imageAi/queryImageList', async (params, thunkAPI) => {
    try {
        const {pagination, imageList, firstImageItem} = thunkAPI.getState().imageAiSpace;
        console.log('pagination =', pagination)
        let params = {
            pageSize: pagination.pageSize,
            pageNum: pagination.pageNum
        }
        if (pagination.pageNum > 1 && imageList.length > 0 && firstImageItem) {
            params.flagCreatedTime = firstImageItem.createdDt
        }
        const res = await axios.post(`/space/crud/imageAi/getList`, params);
        console.log('queryImageList res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    firstImageItem: null,
    imageList: [],
    hasMoreImageList: true,
    loadingImageList: true,
    loadingGenerateImage: false,
    pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0
    },
    imageRatio: '1024*1024',
    isFinished: false,
}

export const imageAiSpaceSlice = createSlice({
    name: 'imageAiSpace',
    initialState,
    reducers: {
        setDataFromServer: (state, action) => {
            if (action.payload?.imageList && action.payload?.imageList?.rows){
                state.imageList = action.payload.imageList?.rows
                state.firstImageItem = action.payload.imageList?.rows[0]
                state.pagination.total = action.payload.imageList?.total
            }

            state.pagination.pageNum = 2
            state.loadingImageList = false
        },
        concatImageAiInImageList: (state, action) => {
            console.log('action=', action)
            state.imageList = [
                ...state.imageList,
                ...action.payload
            ]
        },
        resetPage: (state, action) => {
            state.firstImageItem = null
            state.imageList = []
            state.pagination = {
                pageSize: 20,
                pageNum: 1,
                total: 0
            }
        },
        setImageRatio: (state, action) => {
            state.imageRatio = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(generate.pending, (state, action) => {
            state.loadingGenerateImage = true;
        }).addCase(generate.rejected, (state, action) => {
            state.loadingGenerateImage = false;
        }).addCase(generate.fulfilled, (state, action) => {
            state.loadingGenerateImage = false;
            console.log('generate action.payload=', action.payload)
            if (action.payload.status === 0) {
                const resData = action.payload.data
                if (state.imageList.length > 0) {
                    state.imageList[0].imageSrc = resData.imageSrc
                    state.imageList[0].status = resData.status
                }
            }
        })
        .addCase(queryImageList.pending, (state, action) => {
            state.loadingImageList = true;
        }).addCase(queryImageList.rejected, (state, action) => {
            state.loadingImageList = false;
        }).addCase(queryImageList.fulfilled, (state, action) => {
            console.log('queryImageList action.payload=', action.payload)
            state.loadingImageList = false;
            if (action.payload.data) {
                const resData = action.payload.data
                const total = resData.total
                state.pagination.total = total
                if (state.pagination.pageNum === 1 && state.imageList.length>0){
                    // 防止数据重复添加
                }else{
                    // 保存第一页第一条数据，目的是把数据中的时间传递给后台，防止分页数据出现重复问题
                    if (state.pagination.pageNum === 1) {
                        state.firstImageItem = resData.rows[0]
                    }
                    const rows = resData.rows
                    state.imageList = state.imageList.concat(rows)
                    console.log('state.imageList.length !== total', state.imageList.length !== total)
                    state.pagination.pageNum += 1

                    if (state.imageList.length === total) {
                        state.isFinished = true
                    }
                }

            }
        }).addCase(add.fulfilled, (state, action) => {
            console.log('add action.payload=', action.payload)
            if (action.payload.status === 0 && action.payload.data) {
                state.imageList = [action.payload.data].concat(state.imageList)
            }

        })
    }
})

export const {
    setImageRatio,
    resetPage,
    concatImageAiInImageList,
    setDataFromServer
} = imageAiSpaceSlice.actions
