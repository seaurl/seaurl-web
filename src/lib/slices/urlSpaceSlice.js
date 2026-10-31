import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import axios from "../axios";

// 添加分类
export const addUrlCategory = createAsyncThunk('urlSpace/addUrlCategory', async (params, thunkAPI) => {
    //console.log('----------------------------')
    try {
        const newParams = {
            name: params.name,
            pid: params.pid
        }
        const res = await axios.post(`/space/crud/urlCategory/add`, newParams);
        //console.log('addCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 编辑分类
export const editUrlCategory = createAsyncThunk('urlSpace/editUrlCategory', async (params, thunkAPI) => {
    try {
        const newParams = {
            id: params.id,
            name: params.name,
            pid: params.pid
        }
        const res = await axios.post(`/space/crud/urlCategory/editCategoryName`, newParams);
        //console.log('editCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 删除分类
export const deleteUrlCategory = createAsyncThunk('urlSpace/deleteUrlCategory', async (params, thunkAPI) => {
    try {
        const newParams = {
            id: params.id
        }
        const res = await axios.post(`/space/crud/urlCategory/delete`, newParams);
        //console.log('deleteCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//查询第一级分类，
// 注意：要清除parentCategory，因为只有queryUrlCategoryByPid才会设置parentCategory
export const queryUrlCategory = createAsyncThunk('urlSpace/queryUrlCategory', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/urlCategory`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//根据pid查询子分类
// export const querySubCategories = createAsyncThunk('urlSpace/querySubCategories', async (_, thunkAPI) => {
//   try {
//     const {parentCategory} = thunkAPI.getState().urlSpace;
//     if (parentCategory) {
//       const res = await axios.get(`/urlSpace/info/querySubCategories/${parentCategory.id}`);
//       //console.log('querySubCategories res => ', res)
//       return res.data
//     }
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

// 登录用户查询分类树
export const queryUrlCategoryTreeList = createAsyncThunk('urlSpace/queryUrlCategoryTreeList', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/urlCategory/categoryTreeList`);
        //console.log('queryUrlCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//获取网址标题
export const getTitleAndDesc = createAsyncThunk('urlSpace/getTitleAndDesc', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/url/getTitleAndDesc`, {
            url: params.url
        });
        //console.log('getUrlTitle res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 根据pid添加子分类
export const addSubCategory = createAsyncThunk('urlSpace/addSubCategory', async (params, thunkAPI) => {
    try {
        // const {me} = thunkAPI.getState().auth;
        const {parentCategory} = thunkAPI.getState().urlSpace;
        const newParams = {
            id: parentCategory.id,
            name: params.name
        }
        const res = await axios.post(`/space/crud/urlCategory/addSubCategory`, newParams);
        //console.log('addSubCategory res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//添加网址
export const addUrl = createAsyncThunk('urlSpace/addUrl', async (params, thunkAPI) => {
    try {
        const newParams = {
            categoryId: params.categoryId,
            urlTitle: params.title,
            description: params.description,
            url: params.url,
            keywords: params.keywords,
            isPrivate: params.isPrivate
        }
        const res = await axios.post(`/space/crud/url/add`, newParams);
        //console.log('addUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//编辑网址
export const editUrl = createAsyncThunk('urlSpace/editUrl', async (params, thunkAPI) => {
    try {
        const newParams = {
            urlId: params.urlId,
            categoryId: params.categoryId,
            urlTitle: params.title,
            description: params.description,
            keywords: params.keywords,
            isPrivate: params.isPrivate
        }
        const res = await axios.post(`/space/crud/url/edit`, newParams);
        //console.log('editUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//复制网址
export const copyUrl = createAsyncThunk('urlSpace/copyUrl', async (params, thunkAPI) => {
    try {
        const newParams = {
            urlId: params.urlId,
            categoryId: params.categoryId,
            urlTitle: params.title,
            description: params.description,
            keywords: params.keywords,
            isPrivate: params.isPrivate
        }
        const res = await axios.post(`/space/crud/url/copy`, newParams);
        //console.log('copyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 设置是否置顶
export const setUrlCategoryTop = createAsyncThunk('urlSpace/setUrlCategoryTop', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/url/category/top`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 设置是否置顶
export const setUrlTop = createAsyncThunk('urlSpace/setUrlTop', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/url/top`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const setFavorite = createAsyncThunk('urlSpace/setFavorite', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/url/setFavorite`, params);
        // console.log('fastCopyUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// // 举报网址
// export const reportUrl = createAsyncThunk('urlSpace/reportUrl', async (params, thunkAPI) => {
//   try {
//     const {me} = thunkAPI.getState().auth;
//     const newParams = {
//       userName: me.name,
//       urlId: params.urlId
//     }
//     const res = await axios.post(`/space/crud/report`, newParams);
//     //console.log('reportUrl res => ', res)
//     return res.data
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

// 设置关注网址
export const updateAttention = createAsyncThunk('urlSpace/updateAttention', async (params, thunkAPI) => {
    try {
        const newParams = {
            urlId: params.urlId,
            isAttention: params.isAttention
        }
        const res = await axios.post(`/space/crud/url/updateAttention`, newParams);
        //console.log('updateAttention res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//删除网址
export const deleteUrl = createAsyncThunk('urlSpace/deleteUrl', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/space/crud/url/delete/${params.urlId}`);
        // console.log('deleteUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUrlListByType = createAsyncThunk('urlSpace/getUrlListByType', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/url/getUrlListByType?type=${params.type}`);
        // console.log('deleteUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//根据分类id获取url列表
export const queryAndSearchUrls = createAsyncThunk('urlSpace/queryAndSearchUrls', async (params, thunkAPI) => {
    try {
        // const {userInfo} = thunkAPI.getState().auth;
        console.log('params---', params)
        const res = await axios.post(`/space/crud/url/queryAndSearchUrls`, {
            categoryId: params.categoryId,
            search: params.search,
            pageNum: params.pageNum,
            pageSize: params.pageSize,
            sortType: params.sortType
        },{
            signal: params.controller?.signal
        });
        console.log('---------1------res.data----', res.data)
        if (res.data.status === 0) {
            if (res.data.data.rows.length > 0) {
                // const ids = res.data.data.rows.map(item => item._id)
                // // 这里获取用户点赞的网址，参数为当前获取的所有url_ids，这样就可以根据uid+url_ids判断用户是否点赞
                // const res2 = await axios.post(`/users/crud/like/url/queryByUserId`, {
                //   urlIds: ids
                // });
                // // 这里获取用户举报的网址，参数为当前获取的所有url_ids，这样就可以根据uid+url_ids判断用户是否点赞
                // const res3 = await axios.post(`/space/crud/report/url/queryByUserId`, {
                //   urlIds: ids
                // });
                return {
                    urls: res.data,
                    // likeUrls: res2.data,
                    // reportUrls: res3.data
                }
            } else {
                return {
                    urls: res.data,
                    likeUrls: [],
                    reportUrls: []
                }
            }
        }
        return null
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 点赞网址
export const likeUrl = createAsyncThunk('urlSpace/likeUrl', async (params, thunkAPI) => {
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

// 举报网址
export const reportUrl = createAsyncThunk('urlSpace/reportUrl', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/report/url`, {
            urlId: params.urlId,
            byUid: params.uid
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//根据标题模糊查询
export const searchUrls = createAsyncThunk('urlSpace/searchUrls', async (params, thunkAPI) => {
    try {
        // console.log('params=', params)
        const {userInfo} = thunkAPI.getState().auth;
        if (params.pageNum && params.pageSize && params.search) {
            const res = await axios.post(`/space/info/url/searchUrls`, {
                categoryId: params.categoryId,
                urlTitle: params.search,
                userName: userInfo.userName,
                pageNum: params.pageNum,
                pageSize: params.pageSize
            });
            //console.log('queryUrlsByTitle res => ', res)
            return res.data
        }
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 获取用户最新动态(包括：最近添加、最近访问、最近关注、最近收藏网址列表)
export const getUrlsByFlag = createAsyncThunk('urlSpace/getUrlsByFlag', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.post(`/space/info/url/getUrlsByFlag`, {
            userName: userInfo.userName,
            flag: params.flag
        });
        console.log('========================================== getUrlsByFlag res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 用户点击网址
export const userClickUrl = createAsyncThunk('urlSpace/userClickUrl', async (params, thunkAPI) => {
    try {
        // console.log('params=', params)
        // const {isLogin} = thunkAPI.getState().auth;
        const res = await axios.post(`/space/crud/url/userClickUrl`, {
            urlId: params
        });
        //console.log('userClickUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 用户喜欢的网址top10
export const getTop10LikeUrlsInWeek = createAsyncThunk('urlSpace/getTop10LikeUrlsInWeek', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/url/getTop10LikeUrlsInWeek`);
        //console.log('userClickUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 用户点击最多的网址top10
export const getTop10ClickUrlsInWeek = createAsyncThunk('urlSpace/getTop10ClickUrlsInWeek', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/url/getTop10ClickUrlsInWeek`);
        //console.log('userClickUrl res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 统计网址排名前10的域名
export const getMostUrlsRank = createAsyncThunk('urlSpace/getMostUrlsRank', async (_, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/url/${userInfo.userName}/getMostUrlsRank`);
        // console.log('getMostUrlsRank res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 判断是否已登录
// export const getIsFollowed = createAsyncThunk('urlSpace/getIsFollowed', async (params, thunkAPI) => {
//     try {
//         // const {me, isLogin} = thunkAPI.getState().auth;
//         const {userInfo} = thunkAPI.getState().auth;
//         // console.log('---------------------------- islogin -------------------------', isLogin)
//         if (userInfo) {
//             const newParams = {
//                 followedUserName: userInfo.userName
//             }
//             const res = await axios.post(`/users/crud/user/isFollowed`, newParams);
//             // console.log('isFollowed res => ', res)
//             return res.data
//         } else {
//             return {
//                 data: false
//             };
//         }
//
//     } catch (error) {
//         return thunkAPI.rejectWithValue({errorMsg: error.message});
//     }
// });

//关注用户
export const followUser = createAsyncThunk('urlSpace/followUser', async (params, thunkAPI) => {
    // console.log('params=', params)
    try {
        const {userInfo} = thunkAPI.getState().auth;
        if (userInfo) {
            const newParams = {
                followedUserName: userInfo.userName,
                status: params.status
            }
            const res = await axios.post(`/users/crud/user/followUser`, newParams);
            // console.log('followUser res => ', res)
            if (res.data.status === 0 && res.data.data) {
                return res.data.data
            } else {
                return null;
            }

        } else {
            return null;
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getTools = createAsyncThunk('urlSpace/getTools', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/info/tools`);
        // console.log('getTools res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// export const getUserTools = createAsyncThunk('urlSpace/getUserTools', async (params, thunkAPI) => {
//   try {
//     const {accessToken, me} = thunkAPI.getState().auth;
//     const {userInfo} = thunkAPI.getState().urlSpace;
//     const res = await axios.get(`/urlSpace/info/${userInfo.userName}/userTools`);
//     // console.log('getUserTools res => ', res)
//     return res.data
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

export const addOrRemoveTool = createAsyncThunk('urlSpace/addOrRemoveTool', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const newParams = {
            userName: userInfo.userName,
            toolId: params.toolId
        }
        const res = await axios.post(`/space/crud/userTools/addOrRemove`, newParams);
        // console.log('addOrRemoveTool res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


export const getCommonUrls = createAsyncThunk('urlSpace/getCommonUrls', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/info/getCommonUrls`);
        // console.log('getCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


export const addOrRemoveCommonUrls = createAsyncThunk('urlSpace/addOrRemoveCommonUrls', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const newParams = {
            userName: userInfo.userName,
            groupId: params.groupId
        }
        const res = await axios.post(`/space/crud/userCommonUrls/addOrRemove`, newParams);
        // console.log('addOrRemoveCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserCommonUrls = createAsyncThunk('urlSpace/getUserCommonUrls', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/${userInfo.userName}/userCommonUrls`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getFullUserCommonUrls = createAsyncThunk('urlSpace/getFullUserCommonUrls', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/${userInfo.userName}/fullUserCommonUrls`);
        // console.log('getFullUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 * 看别人
 */
// export const watchUser = createAsyncThunk('urlSpace/watchUser', async (params, thunkAPI) => {
//     // 不能自己看自己
//     const {me, isLogin} = thunkAPI.getState().auth;
//
//     if (isLogin && params.userName !== me.name) {
//         try {
//             const newParams = {
//                 userName: me.name,
//                 watchUserName: params.userName,
//             }
//             const res = await axios.post(`/users/info/watch`, newParams);
//             // console.log('watchUser res => ', res)
//             return res.data
//         } catch (error) {
//             return thunkAPI.rejectWithValue({errorMsg: error.message});
//         }
//     }
// });

//
// export const getStatisticalData = createAsyncThunk('urlSpace/getStatisticalData', async (params, thunkAPI) => {
//   try {
//     const {me, userInfo} = thunkAPI.getState().auth;
//     const res = await axios.get(`/space/info/${userInfo.userName}/statisticalData`);
//     // console.log('getStatisticalData res => ', res)
//     return res.data
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

export const getUserSoftware = createAsyncThunk('urlSpace/getUserSoftware', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/${userInfo.userName}/userSoftware`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserTools = createAsyncThunk('urlSpace/getUserTools', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/${userInfo.userName}/userTools`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const dragUrlTree = createAsyncThunk('urlSpace/dragUrlTree', async (params, thunkAPI) => {
    try {
        const newParams = {
            id: params.categoryId,
            targetId: params.targetId,
            dragType: params.dragType
        }
        const res = await axios.post(`/space/crud/urlCategory/drag`, newParams);
        // console.log('addOrRemoveTool res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


// 获取该用户所有分类数据，然后到前端组装
export const getUrlCategories = createAsyncThunk('urlSpace/getUrlCategories', async (params, thunkAPI) => {
    try {
        const {userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/urlCategory/${userInfo.userName}`);
        // console.log('callback=====',params)
        // if(params.callback){
        //   params.callback(res.data)
        // }
        // console.log('getUrlsByFlag res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 添加用户自定义的在线工具
export const addMyOnlineTools = createAsyncThunk('urlSpace/addMyOnlineTools', async (params, thunkAPI) => {
    try {
        console.log('addMyOnlineTools params=', params)
        const res = await axios.post(`/space/crud/onlineTools/add`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const moveCategory = createAsyncThunk('urlSpace/moveCategory', async (params, thunkAPI) => {
    try {
        console.log('moveCategory params=', params)
        const res = await axios.post(`/space/crud/urlCategory/move`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    /**
     * 服务端数据
     */
    isFollowed: false,
    // 注意：不是登录用户的
    // 所有网址分类列表
    urlCategories: [],
    urlCount: null,
    urlPageSize: 60,
    urlPageNum: 1,
    // 查询网址搜索值
    searchUrlValue: '',
    // 默认是最近经常访问，还有：like和add
    defaultType: 'click',
    // userStatisticalData: null,
    loadingCategory: true,
    isMe: false,


    /**
     * 客户端数据
     */
    loadingUrls: true,
    //选中的当前分类
    chooseUrlCategory: null,
    // 分类网址列表
    categoryUrls: [],
    categoryUrlsTotal: 0,
    // 登录用户拥有的分类treelist，注意：是登录用户的
    categoryTreeList: [],
    tools: [],
    // 单表查询
    userTools: [],
    commonUrls: [],
    // 单表查询
    userCommonUrls: [],
    // 关联查询
    fullUserCommonUrls: [],
    userSoftwareList: [],
    userToolsList: [],
    // 是否简洁模式
    conciseMode: false,
    // comprehensive：综合，upLike：最多点赞,upCopy:最多复制，created:创建时间
    sortType: 'comprehensive',
    displayMode: 'mini',

    // 高亮：none zh en
    highLight: 'none',
    // current:当前分类，all：全部分类
    searchFilter: 'current',
    // 点赞网址列表
    likeUrls: [],
    // 举报网址列表
    reportUrls: [],
    showPanel: true,
    // 选中的tag
    chooseTagName: 'all',
    // 移动端drawer是否显示
    openMobileDrawer: false,
    // 左侧面板是否显示
    openSidebar: false
}

export const urlSpaceSlice = createSlice({
    name: 'urlSpace',
    initialState,
    reducers: {
        setOpenMobileDrawer: (state, action) => {
            state.openMobileDrawer = action.payload
        },
        setOpenSidebar: (state, action) => {
            state.openSidebar = action.payload
        },
        reset: () => initialState,
        setDataFromServer: (state, action) => {
            state.urlCategories = action.payload.urlCategories
            state.urlCount = action.payload.urlCount
            state.loadingCategory = false
        },
        updateUrlsByReport: (state, action) => {
            const payload = action.payload
            const _urls = state.reportUrls.concat(payload.urlId)
            state.reportUrls = Array.from(new Set(_urls))
        },
        setSortType: (state, action) => {
            state.sortType = action.payload
        },
        setDisplayMode: (state, action) => {
            state.displayMode = action.payload
        },
        setHighLight: (state, action) => {
            state.highLight = action.payload
        },
        setShowPanel: (state, action) => {
            state.showPanel = action.payload
        },
        updateUrlsByLike: (state, action) => {
            const payload = action.payload
            state.categoryUrls[payload.index].userLikeUrl_count += payload.count
            state.categoryUrls = state.categoryUrls.slice()
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
        setSearchFilter(state, action) {
            state.searchFilter = action.payload
        },
        setDefaultType(state, action) {
            state.defaultType = action.payload
        },
        setConciseMode(state, action) {
            state.conciseMode = action.payload
        },
        setUrlPageNum(state, action) {
            state.urlPageNum = action.payload
        },
        clearCategoryUrls(state, action) {
            state.categoryUrls = []
        },
        setIsMe(state, action) {
            state.isMe = action.payload;
        },
        setSearchUrlValue: (state, action) => {
            state.searchUrlValue = action.payload;
            // 设置分类标题
            state.activityTitle = "搜索内容";
            state.activity = "search"
            // state.chooseUrlCategory = null;
        },
    },
    extraReducers: (builder) => {
            builder
            //     .addCase(getIsFollowed.fulfilled, (state, action) => {
            //     //console.log('getIsFollowed.fulfilled=>', action)
            //     state.isFollowed = action.payload.data;
            // })
            // .addCase(getIsFollowed.rejected, (state, action) => {
            //     console.log('getIsFollowed rejected=>', state)
            // })
            .addCase(dragUrlTree.fulfilled, (state, action) => {

            })
            .addCase(dragUrlTree.rejected, (state, action) => {
                console.log('dragUrlTree rejected=>', state)
            })
            .addCase(getUrlCategories.fulfilled, (state, action) => {
                state.urlCategories = action.payload.data
                state.loadingCategory = false;
            })
            .addCase(getUrlCategories.pending, (state, action) => {
                state.loadingCategory = true;
            })
            .addCase(getUrlCategories.rejected, (state, action) => {
                state.loadingCategory = false;
            })
            .addCase(queryUrlCategory.fulfilled, (state, action) => {
                console.log('queryUrlCategory.fulfilled=>', action)
                const categoryList = action.payload.data
                // categoryList.sort((a, b) => a.sort - b.sort)
                state.urlCategories = categoryList;
                state.loadingCategory = false;
            })
            .addCase(queryUrlCategory.pending, (state, action) => {
                // console.log('queryUrlCategory.pending=>', action)
                state.loadingCategory = true;
            })
            .addCase(queryUrlCategory.rejected, (state, action) => {
                // console.log('queryUrlCategory.rejected=>', action)
                state.loadingCategory = false;
            })
            .addCase(queryUrlCategoryTreeList.fulfilled, (state, action) => {
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
                console.log('treeelist=', treeList)
                state.categoryTreeList = treeList;
            })
            .addCase(queryUrlCategoryTreeList.rejected, (state, action) => {
                // console.log('queryUrlCategoryTreeList.rejected=>', action)
            })
            .addCase(getUrlListByType.pending, (state, action) => {
                state.loadingUrls = true;
            })
            .addCase(getUrlListByType.fulfilled, (state, action) => {
                console.log('action?.payload-------', action?.payload)
                if (action?.payload?.status === 0) {
                    state.categoryUrls = action.payload.data;
                }
                state.loadingUrls = false;
            })
            .addCase(getUrlListByType.rejected, (state, action) => {
                console.log('getUrlListByType rejected=>', state)
            })
            .addCase(queryAndSearchUrls.pending, (state, action) => {
                state.loadingUrls = true;
            })
            .addCase(queryAndSearchUrls.fulfilled, (state, action) => {
                if (action.payload && action.payload.urls && action.payload.urls.status === 0) {
                    state.categoryUrls = action.payload.urls.data.rows;
                    state.categoryUrlsTotal = action.payload.urls.data.total
                }
                // if (action.payload && action.payload.likeUrls && action.payload.likeUrls.status === 0) {
                //   // 因为第一次是从服务器端获取数据，所以刷新页面会被注水，所以这里判断pageNum=1说明是从服务器端获取因此直接赋值即可
                //   state.likeUrls = action.payload.likeUrls.data
                // }
                //
                // if (action.payload && action.payload.reportUrls && action.payload.reportUrls.status === 0) {
                //   // 因为第一次是从服务器端获取数据，所以刷新页面会被注水，所以这里判断pageNum=1说明是从服务器端获取因此直接赋值即可
                //   state.reportUrls = action.payload.reportUrls.data
                // }
                state.loadingUrls = false;
            })
            .addCase(queryAndSearchUrls.rejected, (state, action) => {
                console.log('queryAndSearchUrls rejected=>', state)
            })
            .addCase(searchUrls.pending, (state, action) => {
                state.loadingUrls = true;
            })
            .addCase(searchUrls.fulfilled, (state, action) => {
                // console.log('searchUrls.fulfilled=>', action)
                if (action.payload.data.rows) {
                    state.categoryUrls = action.payload.data.rows
                    state.categoryUrlsTotal = action.payload.data.total
                }
                state.loadingUrls = false;
            })
            .addCase(searchUrls.rejected, (state, action) => {
                console.log('searchUrls rejected=>', state)
                state.loadingUrls = false;
            })
            .addCase(getUrlsByFlag.pending, (state, action) => {
                state.loadingUrls = true;
            })
            .addCase(getUrlsByFlag.fulfilled, (state, action) => {
                console.log('getUrlsByFlag.fulfilled=>', action)
                // 仅显示前24条数据
                state.categoryUrls = action.payload.data.slice(0, 24);
                state.loadingUrls = false;
            })
            .addCase(getUrlsByFlag.rejected, (state, action) => {
                console.log('getUrlsByFlag rejected=>', state)
                state.loadingUrls = false;
            })
            // .addCase(getIsFollowed.fulfilled, (state, action) => {
            //     // console.log('getIsFollowed.fulfilled=>', action)
            //     state.isFollowed = action.payload.data;
            // })
            // .addCase(getIsFollowed.rejected, (state, action) => {
            //     console.log('getIsFollowed rejected=>', state)
            // })
            .addCase(followUser.fulfilled, (state, action) => {
                // console.log('followUser.fulfilled=>', action)
                if (action.payload) {
                    state.isFollowed = !state.isFollowed;
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                console.log('followUser rejected=>', state)
            })
            .addCase(getTools.fulfilled, (state, action) => {
                // console.log('getTools.fulfilled=>', action)
                state.tools = action.payload.data;
            })
            .addCase(getTools.rejected, (state, action) => {
                console.log('getTools rejected=>', state)
            })
            // .addCase(getUserTools.fulfilled, (state, action) => {
            //     //console.log('getUserTools.fulfilled=>', action)
            //     state.userTools = action.payload.data;
            // })
            // .addCase(getUserTools.rejected, (state, action) => {
            //     console.log('getUserTools rejected=>', state)
            // })
            .addCase(getCommonUrls.fulfilled, (state, action) => {
                //console.log('getCommonUrls.fulfilled=>', action)
                state.commonUrls = action.payload.data;
            })
            .addCase(getCommonUrls.rejected, (state, action) => {
                console.log('getCommonUrls rejected=>', state)
            })
            .addCase(getUserCommonUrls.fulfilled, (state, action) => {
                //console.log('getUserCommonUrls.fulfilled=>', action)
                state.userCommonUrls = action.payload.data;
            })
            .addCase(getUserCommonUrls.rejected, (state, action) => {
                console.log('getUserCommonUrls rejected=>', state)
            })
            .addCase(getFullUserCommonUrls.fulfilled, (state, action) => {
                //console.log('getFullUserCommonUrls.fulfilled=>', action)
                state.fullUserCommonUrls = action.payload.data;
            })
            .addCase(getFullUserCommonUrls.rejected, (state, action) => {
                console.log('getFullUserCommonUrls rejected=>', state)
            })
            .addCase(getUserSoftware.fulfilled, (state, action) => {
                state.userSoftwareList = action.payload.data;
            })
            .addCase(getUserSoftware.rejected, (state, action) => {
                console.log('getUserSoftware rejected=>', state)
            })
            .addCase(getUserTools.fulfilled, (state, action) => {
                state.userToolsList = action.payload.data;
            })
            .addCase(getUserTools.rejected, (state, action) => {
                console.log('getUserTools rejected=>', state)
            })
    }
})

export const {
    reset,
    setSearchUrlValue,
    setIsMe,
    clearCategoryUrls,
    resetCategory,
    setUrlPageNum,
    setConciseMode,
    setDefaultType,
    setSearchFilter,
    updateUrlsByLike,
    updateUrlsByReport,
    setShowPanel,
    setSortType,
    setDisplayMode,
    setHighLight,
    setDataFromServer,
    setOpenMobileDrawer,
    setOpenSidebar
} = urlSpaceSlice.actions;
