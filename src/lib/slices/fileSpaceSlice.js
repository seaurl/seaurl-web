import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

// 添加分类
export const addFileCategory = createAsyncThunk('fileSpace/addFileCategory', async (params, thunkAPI) => {
    //console.log('----------------------------')
    try {
        const newParams = {
            name: params.name,
            pid: params.pid
        }
        const res = await axios.post(`/space/crud/fileCategory/add`, newParams);
        //console.log('addCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryFileCategoryTreeList = createAsyncThunk('fileSpace/queryFileCategoryTreeList', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/fileCategory/categoryTreeList`);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryFolderList = createAsyncThunk('fileSpace/queryFolderList', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/queryFolderList`, params);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryFolderTreeList = createAsyncThunk('fileSpace/queryFolderTreeList', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/queryFolderTreeList`);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//查询第一级分类，
// 注意：要清除parentCategory，因为只有queryCategoryByPid才会设置parentCategory
export const queryFileCategory = createAsyncThunk('fileSpace/queryFileCategory', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/crud/fileCategory`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 编辑分类
export const editFileCategory = createAsyncThunk('fileSpace/editFileCategory', async (params, thunkAPI) => {
    try {
        const {me} = thunkAPI.getState().auth;
        const newParams = {
            id: params.id,
            name: params.name,
            pid: params.pid
        }
        const res = await axios.post(`/space/crud/fileCategory/edit`, newParams);
        //console.log('editNoteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 删除分类
export const deleteFileCategory = createAsyncThunk('fileSpace/deleteFileCategory', async (params, thunkAPI) => {
    try {
        const newParams = {
            id: params.id
        }
        const res = await axios.post(`/space/crud/fileCategory/delete`, newParams);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 查询文件列表
export const getFileListByPid = createAsyncThunk('fileSpace/getFileListByPid', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/crud/file/getFileListByPid?pid=${params.pid}`);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 查询文件列表
export const getFileListBy = createAsyncThunk('fileSpace/getFileListBy', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/crud/file/getListBy?type=${params.type}&fullPath=${encodeURIComponent(params.fullPath)}`);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 删除文件
export const deleteFile = createAsyncThunk('fileSpace/deleteFile', async (params, thunkAPI) => {
    try {
        console.log('dids=', params.ids)
        const res = await axios.post(`/space/crud/file/delete`, {
            files: params.files,
            deleteType: params.deleteType
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const createOfficeFile = createAsyncThunk('fileSpace/createOfficeFile', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/office/create`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 编辑文件名
export const editFileName = createAsyncThunk('fileSpace/editFileName', async (params, thunkAPI) => {
    try {
        const res = await axios.put(`/space/crud/file/editName`, {
            fileId: params.id,
            fileName: params.name
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const moveFileTo = createAsyncThunk('fileSpace/moveFileTo', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/move`, {
            files: params.files,
            fileId: params.fid
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const recoveryFile = createAsyncThunk('fileSpace/recoveryFile', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/recovery`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const favoriteFile = createAsyncThunk('fileSpace/favoriteFile', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/setFavorite`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getAcsForUploadFile = createAsyncThunk('fileSpace/getAcsForUploadFile', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/file/getAcsForUploadFile`);
        console.log('getAcsForUploadFile res =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUploadMode = createAsyncThunk('fileSpace/getUploadMode', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/file/getUploadMode`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const uploadFileToServer = createAsyncThunk('fileSpace/uploadFileToServer', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/upload`, params.formData, {
            onUploadProgress: (e) => {
                if (e.total && params.onProgress) {
                    params.onProgress(Math.round((e.loaded / e.total) * 100))
                }
            }
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addFile = createAsyncThunk('fileSpace/moveFileTo', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/add`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getSumFileSize = createAsyncThunk('fileSpace/getSumFileSize', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/file/getMyFileSumSize`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const setFileIsPrivate = createAsyncThunk('fileSpace/setFileIsPrivate', async (params, thunkAPI) => {
    try {
        const {me} = thunkAPI.getState().auth;
        const res = await axios.post(`/space/crud/file/setPrivate`, params);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


// 设置是否置顶
export const setFileCategoryTop = createAsyncThunk('fileSpace/setFileCategoryTop', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/category/top`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 添加笔记为Ai
export const addFileForImageAi = createAsyncThunk('fileSpace/addFileForImageAi', async (params, thunkAPI) => {
    try {
        const newParams = {
            pid: params.pid,
            imageAiId: params.imageAiId
        }
        const res = await axios.post(`/space/crud/file/addForImageAi`, newParams);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addFileForQrcode = createAsyncThunk('fileSpace/addFileForQrcode', async (params, thunkAPI) => {
    try {
        const newParams = {
            pid: params.pid,
            fileName: params.fileName,
            qrcodeImg: params.qrcodeImg
        }
        const res = await axios.post(`/space/crud/file/addFileForQrcode`, newParams);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addFileForQrcodeAndRead = createAsyncThunk('fileSpace/addFileForQrcodeAndRead', async (params, thunkAPI) => {
    try {
        const formData = new FormData();
        formData.append('file', params.file);
        formData.append('pid', params.pid);
        formData.append('fileName', params.fileName);

        const res = await axios.post(`/space/crud/file/addFileForQrcodeAndRead`, formData);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const shareFileToFriends = createAsyncThunk('fileSpace/shareFileToFriends', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/shareToFriends`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getShareFileFriends = createAsyncThunk('fileSpace/getShareFileFriends', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/getShareFileFriends`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const deleteShareFileFriend = createAsyncThunk('fileSpace/deleteShareFileFriend', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/deleteShareFileFriend`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const sendNotifyToFriends = createAsyncThunk('fileSpace/sendNotifyToFriends', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/sendNotifyToFriends`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    title: 'Seaurl-海纳网罗',
    myFileSize: 0,
    // 分类列表
    fileCategories: [],
    // 登录用户拥有的分类treelist，注意：是登录用户的
    fileCategoryTreeList: [],
    fileFolderTreeList: [],
    files: [],
    loadingCategory: true,
    loadingFiles: true,
    //选中的当前分类
    // chooseFileCategory: null,
    // 选中的当前笔记
    chooseFile: null,
    // 登录用户拥有的分类treelist，注意：是登录用户的
    categoryTreeList: [],
    // 移动端drawer是否显示
    openMobileDrawer: false,
    // 左侧面板是否显示
    openSidebar: false
}

export const fileSpaceSlice = createSlice({
    name: 'fileSpace',
    initialState,
    reducers: {
        setOpenMobileDrawer: (state, action) => {
            state.openMobileDrawer = action.payload
        },
        setOpenSidebar: (state, action) => {
            state.openSidebar = action.payload
        },
        reset: () => initialState,
        // setChooseFileCategory: (state, action) => {
        //     // 设置当前选中的分类
        //     state.chooseFileCategory = action.payload.category;
        // },
        clearFiles: (state, action) => {
            // 设置当前选中的分类
            state.files = []
        },
        setLoadingFiles: (state, action) => {
            // 设置当前选中的分类
            state.loadingFiles = action.payload
        },
        setDataFromServer: (state, action) => {
            state.fileCategories = action.payload.fileCategories || []
            state.files = action.payload.files || []
            state.loadingFiles = false
            // state.loadingCategory = false
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getSumFileSize.fulfilled, (state, action) => {
            state.myFileSize = action.payload.data
        })
            .addCase(getFileListBy.pending, (state, action) => {
                state.loadingFiles = true
            })
            .addCase(getFileListBy.fulfilled, (state, action) => {
                state.loadingFiles = false
                state.files = action.payload.data || [];
            })
            .addCase(getFileListBy.rejected, (state, action) => {
                // console.log('getUserInfoAndUrlCategory.rejected=>', action)
                state.loadingFiles = false
            })
            .addCase(queryFileCategoryTreeList.fulfilled, (state, action) => {
                // console.log('queryUrlCategoryTreeList.fulfilled=>', action)
                let treeList = [];
                // 重新构造treelist
                action.payload.data?.forEach(item => {
                    treeList.push({
                        id: item.id,
                        title: item.name,
                        pId: item.pid,
                        uId: item.uid,
                        value: item.id,
                        sort: item.sort
                    })
                })
                treeList.sort((a, b) => a.sort - b.sort)
                state.fileCategoryTreeList = treeList;
            })
            .addCase(queryFileCategoryTreeList.rejected, (state, action) => {
                console.log('queryFileCategoryTreeList rejected=>', state)
            })
            .addCase(queryFolderTreeList.fulfilled, (state, action) => {
                // console.log('queryUrlCategoryTreeList.fulfilled=>', action)
                let treeList = [{
                    id: '-1',
                    title: '我的文件',
                    value: '-1'
                }];
                // 重新构造treelist
                action.payload.data?.forEach(item => {
                    treeList.push({
                        id: item.id,
                        title: item.name,
                        pId: item.pid || '-1',
                        uId: item.uid,
                        value: item.id
                    })
                })
                state.fileCategoryTreeList = treeList;
            })
            .addCase(queryFolderTreeList.rejected, (state, action) => {
                console.log('queryFolderTreeList rejected=>', state)
            })
            .addCase(queryFolderList.fulfilled, (state, action) => {
                // console.log('queryUrlCategoryTreeList.fulfilled=>', action)
                let treeList = [{
                    id: '-1',
                    title: '我的文件',
                    value: '-1'
                }];
                // 重新构造treelist
                action.payload?.data?.forEach(item => {
                    treeList.push({
                        id: item.id,
                        title: item.name,
                        pId: item.pid || '-1',
                        uId: item.uid,
                        value: item.id
                    })
                })
                // treeList.sort((a, b) => a.sort - b.sort)
                state.fileFolderTreeList = treeList;
            })
            .addCase(queryFolderList.rejected, (state, action) => {
                console.log('queryFileCategoryTreeList rejected=>', state)
            })
            .addCase(queryFileCategory.fulfilled, (state, action) => {
                const categoryList = action.payload.data
                state.fileCategories = categoryList;
                state.loadingCategory = false;
            })
            .addCase(queryFileCategory.pending, (state, action) => {
                state.loadingCategory = true;
            })
            .addCase(queryFileCategory.rejected, (state, action) => {
                state.loadingCategory = false;
            })
    }
})

export const {
    clearFiles,
    setDataFromServer,
    setLoadingFiles,
    setOpenMobileDrawer,
    setOpenSidebar
} = fileSpaceSlice.actions
