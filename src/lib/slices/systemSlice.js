import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "@/lib/axios";

const initialState = {
    loginMenus: [
        {
            key: '0',
            label: '首页',
            code: '',
            icon: '',
            url: '/',
            sort: 1,
            // 显示到哪，drawer-menus:抽屉，top-menus:菜单栏
            type: 'drawer-menus'
        },
        {
            key: '1',
            label: '网址推荐',
            code: '',
            icon: '',
            url: '/recommendUrls',
            sort: 1,
            // 显示到哪，drawer-menus:抽屉，top-menus:菜单栏
            type: 'drawer-menus'
        },
        {
            key: '3',
            label: '软件下载',
            code: '',
            icon: '',
            url: '/software',
            sort: 1,
            type: 'drawer-menus'
        },
        // {
        //     key: '5',
        //     label: '技术热榜',
        //     code: '',
        //     icon: '',
        //     url: '/square',
        //     sort: 1,
        //     type: 'drawer-menus'
        // },
        {
            key: '6',
            label: '新闻广场',
            code: '',
            icon: '',
            url: '/news',
            sort: 1,
            type: 'drawer-menus'
        },
        // {
        //   key: '7',
        //   label: '博客营地',
        //   code: '',
        //   icon: '',
        //   url: '/blogs',
        //   sort: 1,
        //   type: 'drawer-menus'
        // },
        {
            key: '8',
            label: '客服电话',
            code: '',
            icon: '',
            url: '/hotline',
            sort: 1,
            type: 'drawer-menus'
        },
        // {
        //   key: '9',
        //   label: '直播带货',
        //   code: '',
        //   icon: '',
        //   url: '/blogs',
        //   sort: 1,
        //   type: 'drawer-menus'
        // },
        {
            key: '4',
            label: '关于',
            code: '',
            icon: '',
            url: '/about',
            sort: 1,
            type: 'drawer-menus'
        }
    ],
    logoutMenus: [{
        key: '0',
        label: '首页',
        code: '',
        icon: '',
        url: '/',
        sort: 1,
        // 显示到哪，drawer-menus:抽屉，top-menus:菜单栏
        type: 'drawer-menus'
    }, {
        key: '1',
        label: '网址推荐',
        code: '',
        icon: '',
        url: '/recommendUrls',
        sort: 1,
        type: 'top-menus'
    },
        {
            key: '3',
            label: '软件下载',
            code: '',
            icon: '',
            url: '/software',
            sort: 1,
            type: 'top-menus'
        }, {
            key: '4',
            label: '关于',
            code: '',
            icon: '',
            url: '/about',
            sort: 1,
            type: 'top-menus'
        }],
    platFormTheme: {
        color: '#54458a',
        background: 'light'
    },
    // 搜索列表
    searchList: [],
    // 分页
    searchPage: {
        pageNum: 1,
        pageSize: 20,
        total: 0
    },
    // 搜索内容
    searchContent: '',
    // 是否显示搜索弹出框
    showSearchPanel: false,
    // 搜索加载特效
    loadingSearchList: false,
    // 显示搜索默认首页上面的搜索app
    showSearchApp: true,
    // 搜索加载器
    searchLoading: true,
    // 当前登录用户点赞网址列表，存在这个列表中需要高亮展示
    likeUrls: [],
    isOnline: true,


    toolsGroupId: '',
    toolsGroupList: [],
    tools: [],
    userTools: [],

    isRouteChanging: false,
    loadingKey: 0,

    // 用户点击最多的网址
    topUrls: [],
    // 用户访问历史记录网址
    historyUrls: [],
    isMobile: false,
    isXlScreen: false,
    isMdScreen: false,
    userAiToolsList: []
};

export const systemSlice = createSlice({
    name: "system",
    initialState,
    reducers: {
        setIsMobile: (state, action) => {
            state.isMobile = action.payload
        },
        setIsXlScreen: (state, action) => {
            state.isXlScreen = action.payload
        },
        setIsMdScreen: (state, action) => {
            state.isMdScreen = action.payload
        },
        setProgress: (state, action) => {
            state.isRouteChanging = action.payload.isRouteChanging
            if (action.payload.loadingKey) {
                state.loadingKey = action.payload.loadingKey
            }
        },
        setPlatFormTheme: (state, action) => {
            state.platFormTheme = {...state.platFormTheme, ...action.payload}
        },
        resetSearch: (state, action) => {
            state.searchList = []
            state.searchLoading = true
            // state.searchContent = ''
            state.searchPage = {
                pageNum: 1,
                pageSize: 20,
                total: 0
            }
        },
        setSearchContent: (state, action) => {
            state.searchContent = action.payload
            // 当有搜索内容时，不显示app界面
            state.showSearchApp = false
        },
        setSearchPanel: (state, action) => {
            if (!action.payload) {
                state.searchContent = ''
            } else {
                // 打开搜索界面时，显示app界面
                state.showSearchApp = true
            }
            state.showSearchPanel = action.payload
        },
        setShowSearchApp: (state, action) => {
            // 设置搜索界面是否显示
            state.showSearchApp = action.payload
            if (action.payload) {
                // 当显示app界面时，搜索内容重置
                state.searchContent = ''
            }
        },
        resetPage: (state, action) => {
            state.searchPage = {
                pageNum: 1,
                pageSize: 20
            }
        },
        updateSearchListByLike: (state, action) => {
            const payload = action.payload
            state.searchList[payload.index].likedUrlCount += payload.count
            state.searchList = state.searchList.slice()
            if (payload.count > 0) {
                const _urls = state.likeUrls.concat(payload.urlId)
                state.likeUrls = Array.from(new Set(_urls))
            } else {
                state.likeUrls.forEach((item, index) => {
                    if (item === payload.urlId) {
                        state.likeUrls.splice(index, 1)
                    }
                })
                state.likeUrls = state.likeUrls.slice()
            }
        },
        setToolsGroupId: (state, action) => {
            // 设置当前选中的分类
            state.toolsGroupId = action.payload;
        },
        clearTools: (state, action) => {
            // 设置当前选中的分类
            state.tools = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(webSearch.pending, (state, action) => {
            state.loadingSearchList = true;
        })
            .addCase(webSearch.fulfilled, (state, action) => {
                console.log('webSearch.fulfilled=>', action.payload)
                state.loadingSearchList = false;
                const total = action.payload.data.total
                const pageNum = action.payload.data.pageNum
                const pageSize = action.payload.data.pageSize

                const rows = action.payload.data.rows
                const likeUrls = action.payload.likeUrls

                if (action.payload && rows) {
                    state.searchPage = {
                        pageNum: pageNum,
                        pageSize: pageSize,
                        total: total
                    }
                    if (pageNum > 1) {
                        state.searchList = state.searchList.concat(rows)
                    } else {
                        state.searchList = rows
                    }
                    state.searchLoading = state.searchList.length < total
                }
                if (action.payload && likeUrls && likeUrls.status === 0) {
                    const _urls = state.likeUrls.concat(likeUrls.data)
                    state.likeUrls = Array.from(new Set(_urls))
                }
            })
            .addCase(webSearch.rejected, (state, action) => {
                console.log('webSearch rejected=>', state)
                state.loadingSearchList = false;
            })
            .addCase(getOnlineToolsGroup.fulfilled, (state, action) => {
                state.toolsGroupList = action.payload.data;
            })
            .addCase(getOnlineToolsGroup.rejected, (state, action) => {
                console.log('getOnlineToolsGroup rejected=>', state)
            })
            .addCase(getOnlineToolsQueryBy.fulfilled, (state, action) => {
                //console.log('getUserCommonUrls.fulfilled=>', action)
                state.tools = action.payload.data;
            })
            .addCase(getOnlineToolsQueryBy.rejected, (state, action) => {
                console.log('getOnlineToolsQueryBy rejected=>', state)
            })
            .addCase(getUserTools.fulfilled, (state, action) => {
                state.userTools = action.payload.data;
            })
            .addCase(getUserTools.rejected, (state, action) => {
                console.log('getUserTools rejected=>', state)
            })
            .addCase(getUserMostClickUrlList.fulfilled, (state, action) => {
                let list = []
                action.payload.data?.forEach(item => {
                    list.push({
                        key: item.id,
                        label: item.title,
                        url: item.url,
                        favicon: item.favicon
                    })
                })
                state.topUrls = list
            })
            .addCase(getUserMostClickUrlList.rejected, (state, action) => {
                console.log('getUserMostClickUrlList rejected=>', state)
            })
            .addCase(getUserHistoryUrlList.fulfilled, (state, action) => {
                let list = []
                action.payload.data?.forEach(item => {
                    list.push({
                        key: item.id,
                        label: item.title,
                        url: item.url,
                        favicon: item.favicon
                    })
                })
                state.historyUrls = list
            })
            .addCase(getUserHistoryUrlList.rejected, (state, action) => {
                console.log('getUserHistoryUrlList rejected=>', state)
            }).addCase(queryUserAiTools.pending, (state, action) => {
        })
            .addCase(queryUserAiTools.rejected, (state, action) => {
            })
            .addCase(queryUserAiTools.fulfilled, (state, action) => {
                state.userAiToolsList = [{
                    name: '最近使用',
                    type: 'all'
                }]
                state.userAiToolsList = state.userAiToolsList.concat(action.payload.data)
            })
    }
})

export const getUserMostClickUrlList = createAsyncThunk('system/getUserMostClickUrlList', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/url/getUserMostClickUrlList`);
        // console.log('getUrlsByFlag res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserHistoryUrlList = createAsyncThunk('system/getUserHistoryUrlList', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/url/getUserHistoryUrlList`);
        // console.log('getUrlsByFlag res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const webSearch = createAsyncThunk('system/webSearch', async (params, thunkAPI) => {
    try {
        console.log('webSearch params=', params)
        const res = await axios.get(`/search/info/web/search?q=${params.q}&pageNum=${params.pageNum}&pageSize=${params.pageSize}`);
        console.log('webSearch res => ', res)
        if (res.data.status === 0) {

            return {
                data: res.data.data,
            }
        } else {
            return thunkAPI.rejectWithValue({errorMsg: res.data.message});
        }

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 获取用户搜索时输入的建议
export const webSearchSuggestion = createAsyncThunk('system/webSearchSuggestion', async (params, thunkAPI) => {
    try {
        console.log('webSearch params=', params)
        // const {me} = thunkAPI.getState().auth;
        const res = await axios.get(`/search/info/web/search/suggestion?q=${params.q}`);
        console.log('webSearchSuggestion res => ', res)
        if (res.data.status === 0) {

            return {
                data: res.data.data
            }
        } else {
            return thunkAPI.rejectWithValue({errorMsg: res.data.message});
        }

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 点赞
export const likeUrl = createAsyncThunk('system/likeUrl', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/crud/like/url`, {
            urlId: params.urlId,
            byUid: params.uid
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getOnlineToolsGroup = createAsyncThunk('system/getOnlineToolsGroup', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/crud/onlineToolsGroup`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getOnlineToolsQueryBy = createAsyncThunk('system/getOnlineToolsQueryBy', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const res = await axios.post(`/space/crud/onlineTools/queryBy`, {
            param: params.param,
            groupId: params.groupId,
            type: params.type
        });
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 删除用户自己添加的工具
export const deleteUserTools = createAsyncThunk('system/deleteUserTools', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/space/crud/onlineTools/delete/${params.id}`);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserTools = createAsyncThunk('system/getUserTools', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/info/${params.userName}/userTools`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addOrRemoveTools = createAsyncThunk('system/addOrRemoveTools', async (params, thunkAPI) => {
    try {
        const newParams = {
            userName: params.userName,
            toolId: params.toolId
        }
        const res = await axios.post(`/space/crud/userTools/addOrRemove`, newParams);
        // console.log('addOrRemoveCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryUserAiTools = createAsyncThunk('system/queryUserAiTools', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/userAiTools/query`);
        console.log('queryUserAiTools res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


export const {
    setPlatFormTheme,
    resetSearch,
    setSearchPanel,
    setSearchContent,
    setShowSearchApp,
    resetPage,
    setToolsGroupId,
    clearTools,
    setProgress,
    setIsMobile,
    setIsXlScreen,
    setIsMdScreen
} = systemSlice.actions
