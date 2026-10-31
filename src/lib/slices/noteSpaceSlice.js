import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

/**
 * 获取用户基本信息
 */
export const getUserData = createAsyncThunk('noteSpace/getUserData', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/info/${params.userName}/data`);
        //console.log('getUserData res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 添加分类
export const addNoteCategory = createAsyncThunk('noteSpace/addNoteCategory', async (params, thunkAPI) => {
    //console.log('----------------------------')
    try {
        const newParams = {
            name: params.name,
            pid: params.pid
        }
        const res = await axios.post(`/space/crud/noteCategory/add`, newParams);
        //console.log('addCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 编辑分类
export const editNoteCategory = createAsyncThunk('noteSpace/editNoteCategory', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            id: params.id,
            name: params.name,
            pid: params.pid
        }
        const res = await axios.post(`/space/crud/noteCategory/edit`, newParams);
        //console.log('editNoteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 删除分类
export const deleteNoteCategory = createAsyncThunk('noteSpace/deleteNoteCategory', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            id: params.id
        }
        const res = await axios.post(`/space/crud/noteCategory/delete`, newParams);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 删除笔记
export const deleteNote = createAsyncThunk('noteSpace/deleteNote', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;

        const res = await axios.delete(`/space/crud/note/delete/${params.id}`);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const setFavorite = createAsyncThunk('noteSpace/setFavorite', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/note/setFavorite`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//查询第一级分类，
// 注意：要清除parentCategory，因为只有queryCategoryByPid才会设置parentCategory
export const queryNoteCategory = createAsyncThunk('noteSpace/queryNoteCategory', async (params, thunkAPI) => {
    try {
        // const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/crud/noteCategory`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// export const dragNoteCategoryTree = createAsyncThunk('noteSpace/dragNoteCategoryTree', async (params, thunkAPI) => {
//     try {
//         const {me, userInfo} = thunkAPI.getState().auth;
//         const newParams = {
//             userName: me.name,
//             id: params.categoryId,
//             targetId: params.targetId,
//             dragType: params.dragType
//         }
//         const res = await axios.post(`/space/crud/noteCategory/drag`, newParams);
//         return res.data
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });

/**
 * 获取url中包含的用户名基本信息和网址分类列表
 */
// export const getUserInfoAndNoteCategory = createAsyncThunk('noteSpace/getUserInfoAndNoteCategory', async (params, thunkAPI) => {
//   //console.log('----------------------------')
//   try {
//     const res = await axios.get(`/space/info/user/note/${params.userName}`);
//     console.log('getUserInfoAndNoteCategory res => ', res)
//     return res.data
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

//根据分类id获取url列表
export const getNoteListByCategoryId = createAsyncThunk('noteSpace/getNoteListByCategoryId', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/note/queryListBy/${params.categoryId}`,{
            signal: params.abortController.signal,
        })
        // console.log('getUrlByCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//获取用户最近使用的笔记
export const getMyRecentlyNotes = createAsyncThunk('noteSpace/getMyRecentlyNotes', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/note/getRecentlyNotes`)
        // console.log('getUrlByCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getNoteById = createAsyncThunk('noteSpace/getNoteById', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/note/queryBy/${params.noteId}`, {
            signal: params.abortController.signal,
        });
        // console.log('getUrlByCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 添加分类
export const addNote = createAsyncThunk('noteSpace/addNote', async (params, thunkAPI) => {
    //console.log('----------------------------')
    try {
        // const {me} = thunkAPI.getState().auth;
        const newParams = {
            title: params.title,
            categoryId: params.categoryId
        }
        const res = await axios.post(`/space/crud/note/add`, newParams);
        //console.log('addCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 添加笔记为Ai
export const addNoteForAi = createAsyncThunk('noteSpace/addNoteForAi', async (params, thunkAPI) => {
    //console.log('----------------------------')
    try {
        const newParams = {
            title: params.title,
            categoryId: params.categoryId,
            content: params.content
        }
        const res = await axios.post(`/space/crud/note/addForAi`, newParams);
        //console.log('addCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 编辑分类
export const editNoteTitle = createAsyncThunk('noteSpace/editNoteTitle', async (params, thunkAPI) => {
    try {
        const {me} = thunkAPI.getState().auth;
        const newParams = {
            noteId: params.noteId,
            title: params.title
        }
        const res = await axios.post(`/space/crud/note/edit/title`, newParams);
        //console.log('editNoteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 编辑分类
export const editNoteContent = createAsyncThunk('noteSpace/editNoteContent', async (params, thunkAPI) => {
    try {
        const newParams = {
            noteId: params.noteId,
            content: params.content
        }
        const res = await axios.post(`/space/crud/note/edit/content`, newParams);
        //console.log('editNoteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const editNoteCategoryId = createAsyncThunk('noteSpace/editNoteCategoryId', async (params, thunkAPI) => {
    try {
        const {me} = thunkAPI.getState().auth;
        const newParams = {
            noteId: params.noteId,
            categoryId: params.categoryId
        }
        const res = await axios.post(`/space/crud/note/edit/categoryId`, newParams);
        //console.log('editNoteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryNoteCategoryTreeList = createAsyncThunk('noteSpace/queryNoteCategoryTreeList', async (params, thunkAPI) => {
    try {
        const {me} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/crud/noteCategory/categoryTreeList`);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const setNoteIsPrivate = createAsyncThunk('noteSpace/setNoteIsPrivate', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const res = await axios.post(`/space/crud/note/setPrivate`, params);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 设置是否置顶
export const setNoteCategoryTop = createAsyncThunk('noteSpace/setNoteCategoryTop', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/note/category/top`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


export const getNotesListByType = createAsyncThunk('noteSpace/getNotesListByType', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/url/getNotesListByType?type=${params.type}`);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    title: 'Seaurl-海纳网罗',
    /**
     * 服务端数据
     */
    // 分类列表
    noteCategories: [],
    noteCount: null,
    /**
     * 客户端数据
     */
    // 登录用户拥有的分类treelist，注意：是登录用户的
    noteCategoryTreeList: [],
    // 笔记列表
    notes: [],
    loadingCategory: true,
    loadingNotes: true,
    loadingNote: false,
    //选中的当前分类
    // chooseNoteCategory: null,
    // // 选中的当前笔记
    // chooseNote: null,
    // 登录用户拥有的分类treelist，注意：是登录用户的
    categoryTreeList: [],

    // 移动端drawer是否显示
    openNoteListMobileDrawer: false,
    // 移动端drawer是否显示
    openSidebarMobileDrawer: false,
    // 左侧面板是否显示
    openSidebar: false
}

export const noteSpaceSlice = createSlice({
    name: 'noteSpace',
    initialState,
    reducers: {
        setOpenNoteListMobileDrawer: (state, action) => {
            state.openNoteListMobileDrawer = action.payload
        },
        setOpenSidebarMobileDrawer: (state, action) => {
            state.openSidebarMobileDrawer = action.payload
        },
        setOpenSidebar: (state, action) => {
            state.openSidebar = action.payload
        },
        reset: () => initialState,
        clearCategory(state, action) {
            state.notes = []
        },
        setDataFromServer: (state, action) => {
            state.noteCategories = action.payload.noteCategories || []
            state.noteCount = action.payload.noteCount || []
            state.notes = action.payload.notes || []
            state.loadingNotes = false
            state.loadingCategory = false
        },
        setNoteTitle: (state, action) => {
            state.notes.forEach(n => {
                if (n.id === action.payload.nid){
                    n.title = action.payload.title
                }
            })
        }
    },
    extraReducers: (builder) => {
        builder.addCase(queryNoteCategoryTreeList.fulfilled, (state, action) => {
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
            state.noteCategoryTreeList = treeList;
        })
            .addCase(editNoteContent.fulfilled, (state, action) => {
                if (action.payload.status === 0){
                    const resData = action.payload.data
                    const content = resData.content
                    state.notes = state.notes.map(f => {
                        if (f.id === resData.id) {
                            f.content = content
                        }
                        return f
                    })
                }
            })
            .addCase(queryNoteCategoryTreeList.rejected, (state, action) => {
                console.log('queryNoteCategoryTreeList rejected=>', state)
            })

            .addCase(getNotesListByType.pending, (state, action) => {
                state.loadingNotes = true;
            })
            .addCase(getNotesListByType.fulfilled, (state, action) => {
                // console.log('getUrlByCategory.fulfilled=>', action)
                state.notes = action.payload.data;
                state.loadingNotes = false;
            })
            .addCase(getNotesListByType.rejected, (state, action) => {
                console.log('getNotesListByType rejected=>', state)
                state.loadingNotes = false;
            })


            .addCase(getNoteListByCategoryId.pending, (state, action) => {
                state.loadingNotes = true;
            })
            .addCase(getNoteListByCategoryId.fulfilled, (state, action) => {
                // console.log('getUrlByCategory.fulfilled=>', action)
                state.notes = action.payload.data;
                state.loadingNotes = false;
            })
            .addCase(getNoteListByCategoryId.rejected, (state, action) => {
                console.log('getNoteListByCategoryId rejected=>', state)
                state.loadingNotes = false;
            })
            .addCase(getMyRecentlyNotes.pending, (state, action) => {
                state.loadingNotes = true;
            })
            .addCase(getMyRecentlyNotes.fulfilled, (state, action) => {
                // console.log('getUrlByCategory.fulfilled=>', action)
                state.notes = action.payload.data;
                state.loadingNotes = false;
            })
            .addCase(getMyRecentlyNotes.rejected, (state, action) => {
                console.log('getMyRecentlyNotes rejected=>', state)
                state.loadingNotes = false;
            })
            // .addCase(getNoteById.pending, (state, action) => {
            //     state.loadingNote = true
            // })
            // .addCase(getNoteById.fulfilled, (state, action) => {
            //     // state.chooseNote = action.payload.data;
            //     state.loadingNote = false
            // })
            // .addCase(getNoteById.rejected, (state, action) => {
            //     // console.log('getNoteById rejected=>', state)
            //     state.loadingNote = false
            // })
            .addCase(queryNoteCategory.fulfilled, (state, action) => {
                state.noteCategories = action.payload.data;
                state.loadingCategory = false;
            })
            .addCase(queryNoteCategory.pending, (state, action) => {
                state.loadingCategory = true;
            })
            .addCase(queryNoteCategory.rejected, (state, action) => {
                state.loadingCategory = false;
            })
            .addCase(getUserData.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.userData = {
                        urlCount: action.payload.data.urlCount,
                        attentionUrlCount: action.payload.data.attentionUrlCount,
                        oneCategoryCount: action.payload.data.oneCategoryCount,
                        copyUrlCount: action.payload.data.copyUrlCount,
                        followerCount: action.payload.data.followerCount,
                        followingCount: action.payload.data.followingCount,
                        todayWatchMeCount: action.payload.data.todayWatchMeCount,
                        totalWatchMeCount: action.payload.data.totalWatchMeCount,
                    }
                }
            })
            .addCase(getUserData.rejected, (state, action) => {
                console.log('getUserData rejected=>', state)
            }).addCase(addNote.fulfilled, (state, action) => {
                console.log('getUserData rejected=>', state)
            })
    }
})

export const {
    reset,
    clearCategory,
    setDataFromServer,
    setNoteTitle,
    setOpenSidebarMobileDrawer,
    setOpenSidebar,
    setOpenNoteListMobileDrawer
} = noteSpaceSlice.actions
