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

export const queryAiTools = createAsyncThunk('aiSpace/queryAiTools', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/aiTools/queryAll`);
        console.log('queryAiTools res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


export const queryUsedId = createAsyncThunk('aiSpace/queryUsedId', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/userAiTools/queryUsedId?aiToolId=${params.aiToolId}`);
        console.log('queryUsedId res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryUserAiTools = createAsyncThunk('aiSpace/queryUserAiTools', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/userAiTools/query`);
        console.log('queryUserAiTools res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});


export const removeUserAiTool = createAsyncThunk('aiSpace/removeUserAiTool', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/userAiTools/delete?usedId=${params.usedId}`);
        console.log('removeUserAiTool res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const startTranslation = createAsyncThunk('aiSpace/startTranslation', async (params, thunkAPI) => {
    try {
        console.log('startTranslation params = ', params)
        const res = await axios.post(`/space/crud/translator/exec`, params, {
            signal: params.abortController.signal,
        });
        console.log('startTranslation res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const startDetect = createAsyncThunk('aiSpace/startDetect', async (params, thunkAPI) => {
    try {
        console.log('startDetect params = ', params)
        const res = await axios.post(`/space/crud/translator/detect`, params, {
            signal: params.abortController.signal,
        });
        console.log('startDetect res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const uploadFileAndReadByUrl = createAsyncThunk('aiSpace/uploadFileAndReadByUrl', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/qrcode/uploadFileAndReadByUrl`, {
            url: params.url
        });
        console.log('uploadFileAndReadByUrl res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const updateDt = createAsyncThunk('aiSpace/updateDt', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/userAiTools/updateDt?usedId=${params.usedId}`);
        console.log('updateDt res = =', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const proxyRequest = createAsyncThunk('aiSpace/proxyRequest', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/httpRequest/proxy`, params);
        console.log('proxyRequest res = =', res)
        return res
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const proxyFormDataRequest = createAsyncThunk('aiSpace/proxyRequest', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/httpRequest/proxy/formData`, params);
        console.log('proxyFormDataRequest res = =', res)
        return res
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
})

export const saveRequest = createAsyncThunk('aiSpace/saveRequest', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/httpRequest/add`, params);
        console.log('saveRequest res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
})

export const updateRequest = createAsyncThunk('aiSpace/updateRequest', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/httpRequest/update`, params);
        console.log('updateRequest res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
})

export const queryRequest = createAsyncThunk('aiSpace/queryRequest', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/httpRequest/queryAll`, params);
        console.log('queryRequest res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
})

export const deleteRequest = createAsyncThunk('aiSpace/deleteRequest', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/httpRequest/deleteById`, params);
        console.log('deleteRequest res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
})


export const addFileTransfer = createAsyncThunk('aiSpace/addFileTransfer', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/fileTransfer/add`, params.formData, {
            signal: params.abortController?.signal,
        });
        console.log('addFileTransfer res = =', res)
        if (params.timestamp) {
            return {...res.data, timestamp: params.timestamp}
        } else {
            return res.data
        }
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const queryFileTransfer = createAsyncThunk('aiSpace/queryFileTransfer', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/fileTransfer/query`,
            params,
            {
                signal: params.abortController?.signal,
            });
        console.log('queryFileTransfer res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const queryByMonth = createAsyncThunk('aiSpace/queryByMonth', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/fileTransfer/queryByMonth`,
            params,
            {
                signal: params.abortController?.signal,
            });
        console.log('queryByMonth res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const queryFileTransferConfig = createAsyncThunk('aiSpace/fileTransferConfig/query', async (params, thunkAPI) => {
    try {
        const res = await axios.get(`/space/crud/fileTransferConfig/query`);
        console.log('queryFileTransferConfig res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const addOrUpdateFileTransferConfig = createAsyncThunk('aiSpace/fileTransferConfig/add', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/fileTransferConfig/addOrUpdate`, params);
        console.log('addOrUpdateFileTransferConfig res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const deleteFileTransfer = createAsyncThunk('aiSpace/deleteFileTransfer', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/space/crud/fileTransfer/delete/${params.id}`);
        console.log('deleteFileTransfer res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const addFileForText = createAsyncThunk('aiSpace/addFileForText', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/file/addFileForText`, params);
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getMsnData = createAsyncThunk('aiSpace/getMsnData', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/getMsnData/${params.tabId}/${params.pageNum}`
        console.log('getMsnData url=', url)
        const res = await axios.get(url, {
            signal: params.abortController?.signal,
        });
        console.log('getMsnData res=', res)
        return {
            resData: res.data,
            tabId: params.tabId,
            pageNum: params.pageNum
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getMsnDataDetail = createAsyncThunk('aiSpace/getMsnDataDetail', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/getMsnDataDetail/${params.newsId}`
        const res = await axios.get(url, {
            signal: params.abortController?.signal,
        });
        console.log('getMsnDataDetail res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getWeatherFreeToken = createAsyncThunk('aiSpace/getWeatherFreeToken', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/weather/free/token`
        const res = await axios.get(url);
        console.log('getWeatherFreeToken res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getWeatherStandardToken = createAsyncThunk('aiSpace/getWeatherStandardToken', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/weather/standard/token`
        const res = await axios.get(url);
        console.log('getWeatherStandardToken res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addCity = createAsyncThunk('aiSpace/addCity', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/weather/city/add`
        const res = await axios.post(url, params);
        console.log('addCity res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const queryCity = createAsyncThunk('aiSpace/queryCity', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/weather/city/query`
        const res = await axios.get(url);
        console.log('queryCity res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const topCity = createAsyncThunk('aiSpace/topCity', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/weather/city/top/${params}`
        const res = await axios.get(url);
        console.log('topCity res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const deleteCity = createAsyncThunk('aiSpace/deleteCity', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/weather/city/${params}`
        const res = await axios.delete(url);
        console.log('deleteCity res=', res)
        return res.data
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const getHolidays = createAsyncThunk('aiSpace/getHolidays', async (params, thunkAPI) => {
    try {
        let url = `/space/crud/holiday/${params}`
        const res = await axios.get(url);
        console.log('getHolidays res=', res)
        return {
            year: params,
            resData: res.data
        }
    } catch (error) {
        return thunkAPI.rejectWithValue({errorMsg: error.message});
    }
});

export const addAiRole = createAsyncThunk('aiSpace/addAiRole', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/aiTools/role/add`, params);
        console.log('addAiRole res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const editAiRole = createAsyncThunk('aiSpace/editAiRole', async (params, thunkAPI) => {
    try {
        const res = await axios.post(`/space/crud/aiTools/role/edit`, params);
        console.log('editAiRole res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

export const deleteAiRole = createAsyncThunk('aiSpace/deleteAiRole', async (params, thunkAPI) => {
    try {
        const res = await axios.delete(`/space/crud/aiTools/role/${params.id}`);
        console.log('deleteAiRole res = =', res)
        return res.data
    } catch (error) {
        // 注意：要把错误信息也要返回
        return error.response
    }
});

const initialState = {
    aiToolsWillChangeFunc: null,
    chooseAiTool: null,
    aiToolsList: [],
    userAiToolsList: [],
    chooseUserAiTool: null,
    cache: {
        isTranslatorRequest: false,
        isImageAiRequest: false,
        // 通过usedid来缓存数据，如果保存的useid和url中的usedid相同则缓存，否则请求新的
        chatAiRequestUsedId: "",
    },
    qrcode: {
        text: 'https://www.seaurl.com/',
        parsingQrcode: '',
        parsingQrcode2: '',
        size: 250,
        color: '#000',
        icon: ''
    },
    translator: {
        sourceLng: 'auto',
        targetLng: 'en',
        sourceLngTxt: '',
        targetLngTxt: '<span style="color:#5f6368">翻译</span>'
    },
    jsonFormat: {
        json: '',
        error: ''
    },
    calculator: {
        result: '0',
        input: '0',
        isEnd: false,
        note: ''
    },
    codeEditor: {
        code: '',
        error: '',
        lng: 'json'
    },
    codeComparison: {
        originalCode: '',
        modifiedCode: '',
        lng: 'javascript'
    },
    encodeEncrypt: {
        activityKey: '1',
        mode: 'encode',
        uri: '',
        unicode: '',
        base64: '',
        guid: [],
        aesDes: {
            type: 'aes',
            key: '',
            value: ''
        },
        md5: '',
        timeStamp: {
            type: '10',
            timestampToDate: '',
            dateToTimeStamp: '',
        },
        jwt: {
            type: '',
            header: JSON.stringify({
                "alg": "HS256",
                "typ": "JWT"
            }, null, 2),
            payload: JSON.stringify({
                sub: '1234567890',
                name: 'seaurl',
                iat: 1720420733
            }, null, 2),
            signature: 'your-256-bit-secret'
        }
    },
    httpRequestHistory: [],
    httpRequest: {
        id: '',
        method: 'get',
        url: '',
        // params: '',
        headers: '',
        contentType: 'none',
        body: {
            json: '',
            formUrlEncoded: '',
            formData: [{
                key: '',
                value: '',
                file: null
            }]
        },
        response: ""
    },
    fileTransfer: {
        loadingList: true,
        selectedDate: null,
        content: '',
        list: [],
        hasDataList: [],
        // 文件保存的pid
        fileSaveInPId: ''
    },
    excaliDraw: {
        initData: null
    },
    drawio: {
        initData: null
    },
    news: {
        type: 'Y_77f04c37-b63e-46b4-a990-e926f7d129ff',
        list: [],
        chooseNews: null,
        detail: null,
        showLoading: true,
        isFinished: false,
        pagination: {
            pageNum: 0,
            pageSize: 20,
            total: 0
        }
    },
    weather: {
        selectedDate: '',
        // originList: [],
        // targetList: [],
        // chooseCity: null
    },
    calendar: {
        holidays: []
    }
}

export const aiSpaceSlice = createSlice({
    name: 'aiSpace',
    initialState,
    reducers: {
        reset: () => initialState,
        setAiToolsWillChange: (state, action) => {
            state.aiToolsWillChangeFunc = action.payload || null
        },
        setDrawio: (state, action) => {
            state.drawio.initData = action.payload.initData
        },
        setExcaliDraw: (state, action) => {
            state.excaliDraw.initData = {...action.payload.initData}
        },
        deleteFileTransferListByIndex: (state, action) => {
            state.fileTransfer.list.splice(action.payload.index, 1)
        },
        deleteFileTransferLoadingFile: (state, action) => {
            state.fileTransfer.list = state.fileTransfer.list.filter(f => !f.loading)
        },
        setFileTransferFileUploading: (state, action) => {
            const fi = state.fileTransfer.list.findIndex(f => f.timestamp === action.payload.timestamp)
            if (fi > -1 && action.payload?.data?.fileTransfer && action.payload?.data?.file) {
                state.fileTransfer.list[fi].loading = false
                state.fileTransfer.list[fi].id = action.payload?.data?.fileTransfer.id
                state.fileTransfer.list[fi].fileId = action.payload?.data?.fileTransfer.fileId
                state.fileTransfer.list[fi].file_as[0].id = action.payload?.data?.file.id
                state.fileTransfer.list[fi].file_as[0].url = action.payload?.data?.file.url
            }
        },
        pushFileTransferToList: (state, action) => {
            let obj = {
                type: action.payload.type,
                createdDt: action.payload.createdDt
            }
            if (action.payload.loading) {
                obj.loading = action.payload.loading
            }
            if (action.payload.timestamp) {
                obj.timestamp = action.payload.timestamp
            }
            if (action.payload.content) {
                obj.content = action.payload.content
            }
            if (action.payload.file) {
                obj.file_as = [action.payload.file]
            }
            state.fileTransfer.list.unshift(obj)
            if (action.payload.type === 'text') {
                state.fileTransfer.content = ''
            }
        },
        setFileTransfer: (state, action) => {
            if (action.payload.which === 'selectedDate') {
                state.fileTransfer.selectedDate = action.payload.selectedDate
            }
            if (action.payload.which === 'content') {
                state.fileTransfer.content = action.payload.content
            }
            if (action.payload.which === 'list') {
                state.fileTransfer.list = action.payload.list
            }
        },
        setCache: (state, action) => {
            if (action.payload.which === 'imageAi') {
                state.cache.isImageAiRequest = action.payload.value
            }
            if (action.payload.which === 'chatAi') {
                state.cache.chatAiRequestUsedId = action.payload.value
            }
            if (action.payload.which === 'translator') {
                state.cache.isTranslatorRequest = action.payload.value
            }
        },
        setHttpRequestFormData: (state, action) => {
            if (action.payload.which === 'key') {
                state.httpRequest.body.formData[action.payload.index].key = action.payload.key
            }
            if (action.payload.which === 'value') {
                state.httpRequest.body.formData[action.payload.index].value = action.payload.value
            }
            if (action.payload.which === 'file') {
                state.httpRequest.body.formData[action.payload.index].file = action.payload.file
                state.httpRequest.body.formData[action.payload.index].value = action.payload.file.name
            }
        },
        removeHttpRequestFormData: (state, action) => {
            state.httpRequest.body.formData.splice(action.payload, 1)
        },
        addHttpRequestFormData: (state, action) => {
            state.httpRequest.body.formData.push({
                key: '',
                value: '',
                file: null
            })
        },
        resetHttpRequestFormData: (state, action) => {
            state.httpRequest.body.formData = [{
                key: '',
                value: '',
                file: null
            }]
        },
        initHttpRequest: (state, action) => {
            state.httpRequest = action.payload
        },
        setHttpRequest: (state, action) => {
            if (action.payload.which === 'method') {
                state.httpRequest.method = action.payload.method || ''
            }
            if (action.payload.which === 'url') {
                state.httpRequest.url = action.payload.url || ''
            }
            if (action.payload.which === 'params') {
                state.httpRequest.params = action.payload.params || ''
            }
            if (action.payload.which === 'headers') {
                state.httpRequest.headers = action.payload.headers || ''
            }
            if (action.payload.which === 'body') {
                if (state.httpRequest.contentType === 'application/json') {
                    state.httpRequest.body.json = action.payload.body || ''
                }
                if (state.httpRequest.contentType === 'application/x-www-form-urlencoded') {
                    state.httpRequest.body.formUrlEncoded = action.payload.body || ''
                }
                if (state.httpRequest.contentType === 'multipart/form-data') {
                    state.httpRequest.body.formData = action.payload.body || ''
                }
            }
            if (action.payload.which === 'contentType') {
                state.httpRequest.contentType = action.payload.contentType || ''
            }
            if (action.payload.which === 'response') {
                state.httpRequest.response = action.payload.response || ''
            }
        },
        setEncodeEncryptJwt: (state, action) => {
            // if (action.payload.which === 'token'){
            //     state.encodeEncrypt.jwt.token = action.payload.token || ''
            // }
            if (action.payload.which === 'header') {
                state.encodeEncrypt.jwt.header = action.payload.header || ''
            }
            if (action.payload.which === 'payload') {
                state.encodeEncrypt.jwt.payload = action.payload.payload || ''
            }
            if (action.payload.which === 'signature') {
                state.encodeEncrypt.jwt.signature = action.payload.signature || ''
            }
        },
        setEncodeEncryptTimeStamp: (state, action) => {
            if (action.payload.which === 'type') {
                state.encodeEncrypt.timeStamp.type = action.payload.type || ''
            }
            if (action.payload.which === 'dateToTimeStamp') {
                state.encodeEncrypt.timeStamp.dateToTimeStamp = action.payload.value || ''
            }
            if (action.payload.which === 'timestampToDate') {
                state.encodeEncrypt.timeStamp.timestampToDate = action.payload.value || ''
            }
        },
        setEncodeEncryptMd5: (state, action) => {
            state.encodeEncrypt.md5 = action.payload
        },
        setEncodeEncryptAesDes: (state, action) => {
            if (action.payload.which === 'type') {
                if (action.payload.type) {
                    state.encodeEncrypt.aesDes.type = action.payload.type
                }
            }
            if (action.payload.which === 'key') {
                state.encodeEncrypt.aesDes.key = action.payload.key || ''
            }
            if (action.payload.which === 'value') {
                state.encodeEncrypt.aesDes.value = action.payload.value || ''
            }
        },
        setEncodeEncryptGuid: (state, action) => {
            state.encodeEncrypt.guid = action.payload
        },
        setEncodeEncryptBase64: (state, action) => {
            state.encodeEncrypt.base64 = action.payload
        },
        setEncodeEncryptActivityKey: (state, action) => {
            state.encodeEncrypt.activityKey = action.payload
        },
        setEncodeEncryptUnicode: (state, action) => {
            state.encodeEncrypt.unicode = action.payload
        },
        setEncodeEncryptMode: (state, action) => {
            state.encodeEncrypt.mode = action.payload
        },
        setEncodeEncryptUri: (state, action) => {
            state.encodeEncrypt.uri = action.payload
        },
        setCodeComparisonCodeTxt: (state, action) => {
            state.codeComparison.originalCode = action.payload.originalCode
            state.codeComparison.modifiedCode = action.payload.modifiedCode
        },
        setCodeComparisonLng: (state, action) => {
            state.codeComparison.lng = action.payload
        },
        setCodeEditor: (state, action) => {
            if (action.payload.which === 'code') {
                state.codeEditor.code = action.payload.code || ''
            }
            if (action.payload.which === 'lng') {
                state.codeEditor.lng = action.payload.lng || ''
            }
            if (action.payload.which === 'error') {
                state.codeEditor.error = action.payload.error || ''
            }
        },
        setQrCodeText: (state, action) => {
            state.qrcode.text = action.payload || 'https://www.seaurl.com/'
        },
        setQrcodeParsing: (state, action) => {
            state.qrcode.parsingQrcode = action.payload
        },
        setQrcodeParsing2: (state, action) => {
            state.qrcode.parsingQrcode2 = action.payload
        },
        setQrcodeSize: (state, action) => {
            state.qrcode.size = action.payload || 250
        },
        setQrcodeColor: (state, action) => {
            state.qrcode.color = action.payload || '#000'
        },
        setQrcodeIcon: (state, action) => {
            state.qrcode.icon = action.payload
        },

        setSourceLng: (state, action) => {
            state.translator.sourceLng = action.payload || 'auto'
        },
        setTargetLng: (state, action) => {
            state.translator.targetLng = action.payload || ''
        },
        setSourceLngTxt: (state, action) => {
            state.translator.sourceLngTxt = action.payload || ''
        },
        setTargetLngTxt: (state, action) => {
            state.translator.targetLngTxt = action.payload || ''
        },
        // setTranslator: (state, action) => {
        //     state.translator.sourceLng= action.payload.sourceLng || 'auto'
        //     state.translator.targetLng= action.payload.targetLng || ''
        //     state.translator.sourceLngTxt= action.payload.sourceLngTxt || ''
        // },
        // setJsonFormat: (state, action) => {
        //     state.jsonFormat.jsonTxt= action.payload.jsonTxt || ''
        // },
        // setCalculator: (state, action) => {
        //     console.log('setCalculator=',action)
        //     state.calculator.result= action.payload.result || '0'
        //     state.calculator.input = action.payload.input || '0'
        //     state.calculator.isEnd= action.payload.isEnd || false
        //     state.calculator.note= action.payload.note|| ''
        // },
        setResult: (state, action) => {
            state.calculator.result = action.payload || '0'
        },
        setInput: (state, action) => {
            state.calculator.input = action.payload || '0'
        },
        setEnd: (state, action) => {
            state.calculator.isEnd = action.payload || false
        },
        setCalculatorNote: (state, action) => {
            state.calculator.note = action.payload || ''
        },
        setJson: (state, action) => {
            if (action.payload.which === 'json') {
                state.jsonFormat.json = action.payload.json || ''
            }
            if (action.payload.which === 'error') {
                state.jsonFormat.error = action.payload.error || ''
            }
        },
        setDataFromServerForUserAiTools: (state, action) => {
            state.userAiToolsList = action.payload.userAiToolsList
            if (action.payload.usedId) {
                const fs = state.userAiToolsList.filter(f => f.usedId === action.payload.usedId)
                if (fs.length > 0) {
                    state.chooseUserAiTool = fs[0]
                }
            } else {
                if (state.userAiToolsList.length > 0) {
                    state.chooseUserAiTool = state.userAiToolsList[0]
                }
            }

        },
        setDataFromServerForAiTools: (state, action) => {
            state.aiToolsList = action.payload.aiToolsList
            state.chooseAiTool = state.aiToolsList[0].aiTools[0]
        },
        setAiTool: (state, action) => {
            state.chooseAiTool = action.payload.chooseAiTool
        },
        setUserAiTool: (state, action) => {
            state.chooseUserAiTool = action.payload.chooseUserAiTool
        },
        setNews: (state, action) => {
            state.news[action.payload.action] = action.payload.data
        },
        setWeather: (state, action) => {
            state.weather[action.payload.action] = action.payload.data
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addOrUpdateFileTransferConfig.fulfilled, (state, action) => {
                if (action.payload?.status === 0 && action.payload.data) {
                    state.fileTransfer.fileSaveInPId = action.payload.data.pid || ''
                }
            })
            .addCase(queryFileTransferConfig.fulfilled, (state, action) => {
                if (action.payload?.status === 0 && action.payload.data) {
                    state.fileTransfer.fileSaveInPId = action.payload.data.pid || ''
                }
            })
            .addCase(queryByMonth.fulfilled, (state, action) => {
                if (action.payload?.status === 0) {
                    state.fileTransfer.hasDataList = action.payload.data
                }
            })
            .addCase(addFileTransfer.fulfilled, (state, action) => {
                if (action.payload?.status === 0) {
                    const fi = state.fileTransfer.list.findIndex(f => f.timestamp === action.payload.timestamp)
                    if (fi > -1) {
                        console.log('fi----', fi)
                        console.log('action.payload----', action.payload)
                        if (action.payload?.data?.fileTransfer && action.payload?.data?.file) {
                            state.fileTransfer.list[fi].loading = false
                            state.fileTransfer.list[fi].id = action.payload?.data?.fileTransfer.id
                            state.fileTransfer.list[fi].fileId = action.payload?.data?.fileTransfer.fileId
                            state.fileTransfer.list[fi].file_as[0].id = action.payload?.data?.file.id
                            state.fileTransfer.list[fi].file_as[0].url = action.payload?.data?.file.url
                        } else {
                            if (action.payload?.data?.fileTransfer) {
                                state.fileTransfer.list[fi].id = action.payload?.data?.fileTransfer?.id
                            }
                        }
                    }
                }
            })
            .addCase(queryFileTransfer.pending, (state, action) => {
                state.fileTransfer.loadingList = true
                state.fileTransfer.list = []
            })
            .addCase(queryFileTransfer.rejected, (state, action) => {
                state.fileTransfer.loadingList = false
            })
            .addCase(queryFileTransfer.fulfilled, (state, action) => {
                if (action.payload) {
                    // 只有当有数据时才设置成loadingList=false，否则
                    state.fileTransfer.loadingList = false
                    state.fileTransfer.list = action.payload.data
                }
            })
            .addCase(queryUserAiTools.pending, (state, action) => {
            })
            .addCase(queryUserAiTools.rejected, (state, action) => {
            })
            .addCase(queryUserAiTools.fulfilled, (state, action) => {
                state.userAiToolsList = action.payload.data
            })
            .addCase(removeUserAiTool.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.chooseUserAiTool = null
                }
            })
            .addCase(saveRequest.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.httpRequest.id = action.payload.data.id
                }
            })
            .addCase(queryRequest.fulfilled, (state, action) => {
                if (action.payload.data) {
                    state.httpRequestHistory = action.payload.data.reverse()
                }
            })

            .addCase(queryAiTools.fulfilled, (state, action) => {
                if (action.payload.data) {
                    console.log('--------------action.payload.data---------', action.payload.data)

                    // 1. 创建Map存储A节点（id作为键）
                    const nodeMap = new Map();

                    // 初始化A节点，添加aiTools属性
                    action.payload.data.aiToolsGroup.forEach(item => {
                        nodeMap.set(item.id, { ...item, aiTools: [] });
                    });

                    let findItem = null

                    // 2. 遍历B，将元素添加到对应A节点的aiTools中
                    action.payload.data.aiTools.forEach(item => {
                        const parentNode = nodeMap.get(item.groupId);
                        if (parentNode) {
                            parentNode.aiTools.push({ ...item, aiToolId: item.id }); // 浅拷贝避免污染原数据
                        }
                        // 编辑成功，重新设置选中值
                        if (item.id === state.chooseAiTool.id){
                            findItem = item
                        }
                        // 可选：处理无匹配A的B元素（此处忽略）
                    });

                    // 3. 返回所有A节点组成的数组（森林）
                    console.log('-----------------Array.from(nodeMap.values())---------', Array.from(nodeMap.values()))
                    state.aiToolsList = Array.from(nodeMap.values())

                    if (findItem){
                        state.chooseAiTool = { ...findItem, aiToolId: findItem.id }
                    }else{
                        state.chooseAiTool = state.aiToolsList[0].aiTools[0]
                    }
                }
            })

            .addCase(getMsnData.pending, (state, action) => {
                state.news.showLoading = true;
            })
            .addCase(getMsnData.rejected, (state, action) => {
            })
            .addCase(getMsnData.fulfilled, (state, action) => {
                console.log('--------getMsnData-------', action.payload)

                if (action.payload.resData) {
                    const tabId = action.payload.tabId
                    console.log('--------tabId-------', tabId)
                    let sections = []
                    // 是否是财经新闻
                    if (tabId === 'finance_news') {
                        sections = action.payload.resData.value
                    } else {
                        sections = action.payload.resData.sections
                    }

                    state.news.pagination.pageNum = action.payload.pageNum
                    console.log('-----------sections--------------', sections)
                    if (sections?.length > 0) {
                        let list = []
                        if (tabId === 'finance_news') {
                            sections[0].subCards?.forEach(item => {
                                list = list.concat(item)
                            })
                        } else {
                            sections[0].subSections?.forEach(item => {
                                list = list.concat(item.cards)
                            })
                        }
                        const flist = list.filter(f => f.id)
                        if (state.news.pagination.pageNum === 0) {
                            state.news.list = flist
                        } else {
                            state.news.list = state.news.list.concat(flist)
                        }
                    } else {
                        state.news.isFinished = true
                    }

                }
                state.news.showLoading = false;
            })
            // .addCase(queryCity.fulfilled, (state, action) => {
            //     state.weather.originList = action.payload.data || []
            // })
            // .addCase(getHolidays.fulfilled, (state, action) => {
            //     if (action.payload.resData.status === 0) {
            //         const fs = state.calendar.holidays.filter(f => f.year === action.payload.year)
            //         if (fs.length > 0) {
            //
            //         } else {
            //             state.calendar.holidays.push({
            //                 year: action.payload.year,
            //                 list: action.payload.resData.data
            //             })
            //         }
            //
            //     }
            // })
    }
})

export const {
    reset,
    setUserAiTool,
    setAiTool,
    setDataFromServerForAiTools,
    setDataFromServerForUserAiTools,
    // setCalculator,
    // setJsonFormat,
    // setTranslator,
    setSourceLng,
    setTargetLng,
    setSourceLngTxt,
    setTargetLngTxt,
    setResult,
    setInput,
    setEnd,
    setCalculatorNote,
    setJson,
    setQrCodeText,
    setQrcodeParsing,
    setQrcodeParsing2,
    setQrcodeSize,
    setQrcodeColor,
    setQrcodeIcon,
    setCodeEditor,
    setCodeComparisonCodeTxt,
    setEncodeEncryptUri,
    setEncodeEncryptMode,
    setEncodeEncryptUnicode,
    setEncodeEncryptActivityKey,
    setEncodeEncryptBase64,
    setEncodeEncryptGuid,
    setEncodeEncryptAesDes,
    setEncodeEncryptMd5,
    setEncodeEncryptTimeStamp,
    setEncodeEncryptJwt,
    setHttpRequest,
    addHttpRequestFormData,
    removeHttpRequestFormData,
    setHttpRequestFormData,
    resetHttpRequestFormData,
    setCache,
    setFileTransfer,
    pushFileTransferToList,
    setFileTransferFileUploading,
    deleteFileTransferListByIndex,
    deleteFileTransferLoadingFile,
    setExcaliDraw,
    setDrawio,
    setAiToolsWillChange,
    setCodeComparisonLng,
    setNews,
    setWeather,
    initHttpRequest
} = aiSpaceSlice.actions
