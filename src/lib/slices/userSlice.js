import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import axios from "../axios";

// 常用网址（recentlyVisitUrls）的内存缓存有效期
const RECENT_URLS_TTL_MS = 30 * 60 * 1000;

// 判断是否已登录
export const getIsFollowed = createAsyncThunk('user/getIsFollowed', async (params, thunkAPI) => {
    try {
        if (params) {
            const newParams = {
                followedUserName: params
            }
            const res = await axios.post(`/users/crud/user/isFollowed`, newParams);
            console.log('isFollowed res => ', res)
            return res.data
        } else {
            return {
                data: false
            };
        }

    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//关注用户
export const followUser = createAsyncThunk('user/followUser', async (params, thunkAPI) => {
    try {
        const newParams = {
            followedUserName: params.followedUserName,
            status: params.status
        }
        const res = await axios.post(`/users/crud/user/followUser`, newParams);
        //console.log('followUser res => ', res)
        if (res.data.status === 0 && res.data.data) {
            return res.data.data
        } else {
            return null;
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 * 获取用户基本信息
 */
export const getUserData = createAsyncThunk('user/getUserData', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/info/${params.userName}/data`);
        //console.log('getUserData res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserList = createAsyncThunk('user/getUserList', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/crud/getMyFriends`, params);
        //console.log('getUserData res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


/**
 * 看别人
 */
export const watchUser = createAsyncThunk('user/watchUser', async (params, thunkAPI) => {
    // 不能自己看自己
    if (params.userName !== params.guysName) {
        try {
            const newParams = {
                userName: params.userName,
                watchUserName: params.guysName,
            }
            const res = await axios.post(`/users/info/watch`, newParams);
            // console.log('watchUser res => ', res)
            return res.data
        } catch (error) {
            return thunkAPI.rejectWithValue({errorMsg: error.message});
        }
    }
});

export const getWatchUserToToday = createAsyncThunk('user/getWatchUserToToday', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/info/${params.userName}/getWatchUserToToday`);
        //console.log('getWatchUserToToday res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 *
 */
export const getFollowList = createAsyncThunk('user/getFollowList', async (params, thunkAPI) => {
    // const {me, userInfo, isLogin} = thunkAPI.getState().auth;
    try {
        const newParams = {
            userName: params.userName,
            // loginUserName: isLogin ? me.name : '',
            pageSize: params.pageSize,
            pageNum: params.pageNum,
            type: params.type
        }
        const res = await axios.post(`/users/info/getFollowList`, newParams);
        //console.log('getFollowList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 *
 */
export const getHeatMapSubmitData = createAsyncThunk('user/getHeatMapSubmitData', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/crud/getHeatMapSubmitData`, {
            date: params.date,
            type: params.type
        });
        //console.log('getHeatMapSubmitData res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getSubmitUrlByDate = createAsyncThunk('user/getSubmitUrlByDate', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/users/crud/getSubmitUrlByDate`, {
            date: params.date,
            format: params.format
        },{
            signal: params.abortController?.signal,
        });
        //console.log('getSubmitUrlByDate res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});
// 用户查询分类树，注意：不是登录用户
export const queryUrlCategoryTreeList = createAsyncThunk('user/queryUrlCategoryTreeList', async (params, thunkAPI) => {
    try {
        const {me, userInfo, isLogin} = thunkAPI.getState().auth;
        const res = await axios.get(`/users/info/urlCategory/${userInfo.userName}/categoryTreeList`);
        //console.log('queryCategoryTreeList res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 根据分类id获取url列表
export const getUrlByCategoryId = createAsyncThunk('user/getUrlByCategoryId', async (params, thunkAPI) => {
    try {
        const {me, userInfo, isLogin} = thunkAPI.getState().auth;
        const res = await axios.get(`/users/info/getUrlBy/${params.cid}`);
        //console.log('getUrlByCategoryId res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 根据查询内容返回url列表
// export const queryUrlsByTitle = createAsyncThunk('user/queryUrlsByTitle', async (params, thunkAPI) => {
//   try {
//     const {userInfo} = thunkAPI.getState().user;
//     const res = await axios.post(`/users/info/queryUrlsByTitle`, {
//       urlTitle: params.title,
//       userName: userInfo.userName
//     });
//     //console.log('queryUrlsByTitle res => ', res)
//     return res.data
//   } catch (error) {
//     return thunkAPI.rejectWithValue({errorMsg: error.message});
//   }
// });

export const queryAllUrls = createAsyncThunk('user/queryAllUrls', async (params, thunkAPI) => {
    try {
        const {me, userInfo, isLogin} = thunkAPI.getState().auth;
        const res = await axios.get(`/users/info/${userInfo.userName}/getAllUrl`);
        //console.log('queryAllUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 根据userName获取pins
export const getPins = createAsyncThunk('user/getPins', async (params, thunkAPI) => {
    try {
        //console.log('username=>', params.userName)
        const res = await axios.get(`/users/info/${params.userName}/getPins`);
        //console.log('getPins res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

//根据userName设置pins
export const setPins = createAsyncThunk('user/setPins', async (params, thunkAPI) => {
    try {
        const {me, userInfo, isLogin} = thunkAPI.getState().auth;
        const res = await axios.post(`/users/info/setPins`, {
            userName: userInfo.userName,
            urlIds: params.urlIds
        });
        //console.log('setPins res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const isReadNotify = createAsyncThunk('user/isReadNotify', async (params, thunkAPI) => {
    try {
        const {isLogin, me} = thunkAPI.getState().auth;
        if (isLogin) {
            const res = await axios.get(`/notify/crud/messages/isRead`);
            console.log('------------ isReadNotify res=>', res)
            return res.data
        }
        return thunkAPI.rejectWithValue({errorMsg: '请先登录'});
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 获取用户最新动态(包括：最近添加、最近访问、最近关注、最近收藏网址列表)
// flag=click（常用网址）启用 30 分钟内存缓存，避免每次回 dashboard 都重查。
export const getUrlsByFlag = createAsyncThunk('user/getUrlsByFlag', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/url/getUrlsByFlag`, {
            flag: params.flag
        });
        // console.log('getUrlsByFlag res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
}, {
    condition: (params, thunkAPI) => {
        if (params?.flag !== 'click') return true;
        const {recentlyVisitUrlsFetchedAt} = thunkAPI.getState().user;
        if (recentlyVisitUrlsFetchedAt && Date.now() - recentlyVisitUrlsFetchedAt < RECENT_URLS_TTL_MS) {
            // 缓存未过期：取消本次 thunk（不发请求、不触发 reducer，state 保持原值）
            return false;
        }
        return true;
    }
});

export const getUserTools = createAsyncThunk('user/getUserTools', async (params, thunkAPI) => {
    try {
        const {me, userInfo, isLogin} = thunkAPI.getState().auth;

        const res = await axios.get(`/space/info/${userInfo.userName}/userTools`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getUserSoftware = createAsyncThunk('user/getUserSoftware', async (params, thunkAPI) => {
    try {
        const {me, userInfo, isLogin} = thunkAPI.getState().auth;

        const res = await axios.get(`/space/info/${userInfo.userName}/userSoftware`);
        // console.log('getUserCommonUrls res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getStatisticalData = createAsyncThunk('user/getStatisticalData', async (params, thunkAPI) => {
    try {
        const {me, userInfo} = thunkAPI.getState().auth;
        const res = await axios.get(`/space/info/${userInfo.userName}/statisticalData`);
        // console.log('getStatisticalData res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    isFollowed: false,
    userData: null,
    followList: null,
    heatmapSubmitData: [],
    queryDate: null,
    submitYearList: [],
    submitActivityData: [],
    pins: [],
    isMe: false,
    isReadMessage: true,
    isReadRemind: true,
    // 最近访问的网址
    recentlyVisitUrls: [],
    recentlyVisitUrlsFetchedAt: null,
    userToolsList: [],
    userStatisticalData: null,
    userSoftwareList: []
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        reset: () => initialState,
        setIsMe(state, action) {
            state.isMe = action.payload;
        },
        setFollowed: (state, action) => {
            state.isFollowed = action.payload;
        },
        setSubmitYear: (state, action) => {
            state.submitYear = action.payload;
        },
        setQueryDate: (state, action) => {
            // console.log('-----setQueryDate action=', action)
            state.queryDate = action.payload;
        },
        setSubmitActivityData: (state, action) => {
            // console.log('state.submitActivityData=', state.submitActivityData)
            if (action.payload.format === 'push') {
                state.submitActivityData.push(action.payload.data);
            }
            if (action.payload.format === 'replace') {
                state.submitActivityData = action.payload.data;
            }
        },
        setServeData: (state, action) => {
            state.submitYearList = action.payload.submitYearList;
            state.submitActivityData = action.payload.submitActivityData;
            state.recentlyVisitUrls = action.payload.recentlyVisitUrls;
            state.heatmapSubmitData = action.payload.heatmapSubmitData;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStatisticalData.fulfilled, (state, action) => {
                //console.log('getStatisticalData.fulfilled=>', action)
                state.userStatisticalData = action.payload.data;
            })
            .addCase(getStatisticalData.rejected, (state, action) => {
                console.log('getStatisticalData rejected=>', state)
            })
            .addCase(getUserSoftware.fulfilled, (state, action) => {
                state.userSoftwareList = action.payload.data;
            })
            .addCase(getUserSoftware.rejected, (state, action) => {
                console.log('getUserSoftware rejected=>', state)
            })
            .addCase(getUserTools.fulfilled, (state, action) => {
                //console.log('getUserTools.fulfilled=>', action)
                state.userToolsList = action.payload.data;
            })
            .addCase(getUserTools.rejected, (state, action) => {
                console.log('getUserTools rejected=>', state)
            })
            .addCase(getUrlsByFlag.fulfilled, (state, action) => {
                // console.log('getLatestNewsForUrls.fulfilled=>', action)
                if (action.payload?.data) {
                    state.recentlyVisitUrls = action.payload.data;
                    state.recentlyVisitUrlsFetchedAt = Date.now();
                } else {
                    state.recentlyVisitUrls = [];
                }
            })
            .addCase(getUrlsByFlag.rejected, (state, action) => {
                console.log('getUrlsByFlag rejected=>', state)
            })
            .addCase(getUserData.fulfilled, (state, action) => {
                //console.log('getUserData.fulfilled=>', action)
                if (action.payload.data) {
                    state.userData = {
                        urlCount: action.payload.data.urlCount,
                        copyUrlCount: action.payload.data.copyUrlCount,
                        // lastAddUrlCount: action.payload.data.lastAddUrlCount,
                        noteCount: action.payload.data.noteCount,
                        fileCount: action.payload.data.fileCount,
                        levelCount: action.payload.data.level,
                        pointsCount: action.payload.data.points,
                        followerCount: action.payload.data.followerCount,
                        followingCount: action.payload.data.followingCount,
                        todayWatchMeCount: action.payload.data.todayWatchMeCount,
                        totalWatchMeCount: action.payload.data.totalWatchMeCount
                    }
                }
            })
            .addCase(getUserData.rejected, (state, action) => {
                console.log('getUserData rejected=>', state)
            })
            .addCase(getIsFollowed.fulfilled, (state, action) => {
                //console.log('getIsFollowed.fulfilled=>', action)
                state.isFollowed = action.payload.data;
            })
            .addCase(getIsFollowed.rejected, (state, action) => {
                console.log('getIsFollowed rejected=>', state)
            })
            .addCase(followUser.fulfilled, (state, action) => {
                //console.log('followUser.fulfilled=>', action)
                if (action.payload) {
                    state.isFollowed = !state.isFollowed;
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                console.log('followUser rejected=>', state)
            })
            .addCase(getHeatMapSubmitData.fulfilled, (state, action) => {
                //console.log('getHeatMapSubmitData.fulfilled=>', action)
                if (action.payload?.data) {
                    state.heatmapSubmitData = action.payload.data.heatmapSubmitData;
                    state.submitYearList = action.payload.data.yearList?.reverse();
                    state.submitActivityData = action.payload.data.dateList;
                } else {
                    state.heatmapSubmitData = [];
                    state.submitYearList = [];
                    state.submitActivityData = [];
                }
            })
            .addCase(getHeatMapSubmitData.rejected, (state, action) => {
                console.log('getHeatMapSubmitData rejected=>', state)
            })
            .addCase(getPins.fulfilled, (state, action) => {
                // console.log('getPins.fulfilled=>', action)
                if (action.payload && action.payload.data)
                    state.pins = action.payload.data.urlList;
            })
            .addCase(getPins.rejected, (state, action) => {
                console.log('getPins rejected=>', state)
            })
            .addCase(setPins.fulfilled, (state, action) => {
                //  console.log('setPins.fulfilled=>', action)
                if (action.payload && action.payload.data)
                    state.pins = action.payload.data;
            })
            .addCase(setPins.rejected, (state, action) => {
                console.log('setPins rejected=>', state)
            })
            .addCase(isReadNotify.fulfilled, (state, action) => {
                console.log('isReadNotify.fulfilled=>', action)
                if (action.payload && action.payload.data) {
                    state.isReadMessage = action.payload.data.readMessage;
                    state.isReadRemind = action.payload.data.readRemind;
                }
            })
            .addCase(isReadNotify.rejected, (state, action) => {
                console.log('isReadNotify rejected=>', state)
            })
    }
})

export const {
    setFollowed,
    reset,
    setSubmitYear,
    setQueryDate,
    setSubmitActivityData,
    setIsMe,
    setServeData
} = userSlice.actions
