import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import axios from "../axios";

/**
 * 获取漮用户基本信息
 */
export const getUserData = createAsyncThunk('home/getUserData', async (_, thunkAPI) => {
    try {
        const res = await axios.get(`/users/crud/data`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const initLatestNewsForUsers = createAsyncThunk('home/initLatestNewsForUsers', async (params, thunkAPI) => {
    const {me} = thunkAPI.getState().auth;
    try {
        const res = await axios.post(`/users/crud/getUserEvents`, {
            pageSize: params.pageSize,
            pageNum: params.pageNum
        });
        console.log('initLatestNewsForUsers res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 * 删除用户动态数据
 */
export const deleteUserEvent = createAsyncThunk('home/deleteUserEvent', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/users/crud/userEvent/delete/${params.id}`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 * 获取用户动态数据
 */
export const getLatestNewsForUsers = createAsyncThunk('home/getLatestNewsForUsers',
    async (params, thunkAPI) => {
    // const {me} = thunkAPI.getState().auth;
    try {
        const {pagination, isFinished} = thunkAPI.getState().home;

        const res1 = await axios.post(`/users/crud/getUserEvents`, {
            pageSize: pagination.pageSize,
            pageNum: pagination.pageNum,
            type: params.type
        }, {
            signal: params.abortController?.signal,
        });
        if (res1.data.status === 0) {
            const ids = res1.data.data.rows.map(item => item.objectId)
            // 这里获取用户点赞的网址，参数为当前获取的所有url_ids，这样就可以根据uid+url_ids判断用户是否点赞
            // const res2 = await axios.post(`/users/crud/like/url/queryByUserId`, {
            //     urlIds: ids
            // });
            // 这里获取用户举报的网址，参数为当前获取的所有url_ids，这样就可以根据uid+url_ids判断用户是否点赞
            const res3 = await axios.post(`/space/crud/report/url/queryByUserId`, {
                urlIds: ids
            })
            return {
                latestNews: res1.data,
                // likeUrls: res2.data,
                reportUrls: res3.data
            }
        }
        return {
            latestNews: res1.data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const updateUserBackgroundImg = createAsyncThunk('home/updateUserBackgroundImg', async (params, thunkAPI) => {
    const {me} = thunkAPI.getState().auth;
    try {
        const res = await axios.post(`/users/info/updateUserBackgroundImg`, {
            imgSrc: params.imgSrc
        });
        // console.log('updateUserBackgroundImg res => ', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 用户添加网址最多top10
export const getTop10UsersInMonth = createAsyncThunk('urlSpace/getTop10UsersInMonth', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/crud/user/getTop10UsersInMonth`);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

/**
 * 获取用户列表，分页显示
 * @type {AsyncThunk<unknown, void, AsyncThunkConfig>}
 */
export const getTopUsersByPage = createAsyncThunk('urlSpace/getTopUsersByPage', async (params, thunkAPI) => {
    try {
        console.log('params===', params)
        const res = await axios.post(`/users/crud/user/getTopUsersByPage`, params, {
            signal: params.abortController.signal,
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

// 点赞网址
export const likeUrl = createAsyncThunk('home/likeUrl', async (params, thunkAPI) => {
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
export const reportUrl = createAsyncThunk('home/reportUrl', async (params, thunkAPI) => {
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

// 查询我点赞的网址
export const queryLikeUrl = createAsyncThunk('home/queryLikeUrl', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/users/crud/like/url/queryByUserId`, {
            urlIds: params.urlId
        });
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

const initialState = {
    userData: null,
    // 最新用户动态
    latestNews: [],
    // 点赞网址列表
    likeUrls: [],
    // 举报网址列表
    reportUrls: [],
    isLoading: true,
    isFinished: false,
    pagination: {
        pageNum: 1,
        pageSize: 20,
        total: 0
    }
}

export const homeSlice = createSlice({
    name: 'home',
    initialState,
    reducers: {
        // setBackgroundImg: (state, action) => {
        //   // state.isMobile = action.payload;
        //   state.backgroundImg = action.payload
        // }
        updateLatestNewsByLike: (state, action) => {
            const payload = action.payload
            state.latestNews[payload.index].userLikeUrl_count += payload.count
            state.latestNews = state.latestNews.slice()
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
        updateLatestNewsByReport: (state, action) => {
            const payload = action.payload
            const _urls = state.reportUrls.concat(payload.urlId)
            console.log('_urls=', _urls)
            state.reportUrls = Array.from(new Set(_urls))
        },
        deleteLatestNews: (state, action) => {
            const payload = action.payload
            const _latestNews = state.latestNews.slice()
            _latestNews.splice(payload.index, 1)
            state.latestNews = _latestNews
        },
        clearLatestNews: (state, action) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
            builder.addCase(getUserData.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.userData = {
                        urlCount: action.payload.data.urlCount,
                        copyUrlCount: action.payload.data.copyUrlCount,
                        // lastAddUrlCount: action.payload.data.lastAddUrlCount,
                        noteCount: action.payload.data.noteCount,
                        fileCount: action.payload.data.fileCount,
                        mailCount: action.payload.data.mailCount,
                        mailUnreadCount: action.payload.data.mailUnreadCount,
                        levelCount: action.payload.data.level,
                        pointsCount: action.payload.data.points,
                        followerCount: action.payload.data.followerCount,
                        followingCount: action.payload.data.followingCount,
                        todayWatchMeCount: action.payload.data.todayWatchMeCount,
                        totalWatchMeCount: action.payload.data.totalWatchMeCount,
                    }
                }
            })
            .addCase(getUserData.rejected, (state, action) => {
                console.log('getUserData rejected=>', state)
            })
            .addCase(getLatestNewsForUsers.fulfilled, (state, action) => {
                state.isLoading = false
                // console.log('getLatestNewsForUsers.fulfilled=>', action)
                if (action.payload && action.payload.latestNews && action.payload.latestNews.status === 0) {
                    const total = action.payload.latestNews.data.total
                    state.pagination = {
                        pageSize: action.payload.latestNews.data.pageSize,
                        pageNum: action.payload.latestNews.data.pageNum + 1,
                        total
                    }
                    if (action.payload.latestNews.data.pageNum > 1) {
                        state.latestNews = state.latestNews.concat(action.payload.latestNews.data.rows)
                    } else {
                        state.latestNews = action.payload.latestNews.data.rows;
                    }
                    state.isFinished = state.latestNews.length === total
                }

                if (action.payload && action.payload.reportUrls && action.payload.reportUrls.status === 0) {
                    // 因为第一次是从服务器端获取数据，所以刷新页面会被注水，所以这里判断pageNum=1说明是从服务器端获取因此直接赋值即可
                    if (action.payload.pageNum === 1) {
                        // 这里获取用户点赞的网址并赋值给likeUrls
                        state.reportUrls = action.payload.reportUrls.data
                    } else {
                        const _urls = state.reportUrls.concat(action.payload.reportUrls.data)
                        state.reportUrls = Array.from(new Set(_urls))
                    }

                }
            })
            .addCase(queryLikeUrl.fulfilled, (state, action) => {
                state.likeUrls = state.likeUrls.concat(action.payload.data)
            })
            .addCase(getLatestNewsForUsers.pending, (state, action) => {
                state.isLoading = true
                console.log('getLatestNewsForUsers pending=>', state)
            })
            .addCase(getLatestNewsForUsers.rejected, (state, action) => {
                console.log('getLatestNewsForUsers rejected=>', state)
                state.isLoading = false
            })
            .addCase(initLatestNewsForUsers.fulfilled, (state, action) => {
                // console.log('initLatestNewsForUsers.fulfilled=>', action)
                if (!action.payload || action.payload.status === 401) {

                } else {
                    if (action.payload && action.payload.data)
                        state.latestNews = action.payload.data[0].rows
                }
            })
            .addCase(initLatestNewsForUsers.rejected, (state, action) => {
                console.log('initLatestNewsForUsers rejected=>', state)
            })
    }
})

export const {updateLatestNewsByLike, updateLatestNewsByReport, deleteLatestNews, clearLatestNews} = homeSlice.actions
