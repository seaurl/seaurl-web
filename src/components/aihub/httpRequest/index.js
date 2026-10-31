'use client'
import React, {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Button, Drawer, Input, message, Modal, Radio, Segmented, Select, Space, Spin, Upload} from "antd";
import {
    addHttpRequestFormData, queryRequest,
    queryUserAiTools,
    removeHttpRequestFormData,
    resetHttpRequestFormData,
    saveRequest,
    setHttpRequest,
    setHttpRequestFormData,
    updateDt,
    initHttpRequest, deleteRequest, updateRequest
} from '@/lib/slices/aiSpaceSlice'
import Editor from "@monaco-editor/react";
import classNames from "classnames/bind";
import {
    CloseCircleOutlined,
    DeleteOutlined,
    FormatPainterOutlined,
    LoadingOutlined, PicLeftOutlined,
    PlusOutlined,
    RedoOutlined, SaveOutlined,
    UploadOutlined
} from "@ant-design/icons";
import {isArray, isHTML, isJSON, isObject, isString, isUrl, isValidJSON, isXML, removeExtraSpaces} from '@/utils/help'
import Empty from "@/components/empty";
import Loading from "@/components/loading";
const {confirm} = Modal;

const {TextArea} = Input;

const HttpRequest = (props) => {
    const {data: session} = useSession()
    const router = useRouter()
    const dispatch = useDispatch()
    const {Option} = Select;
    const query = useSearchParams()

    const {httpRequest, httpRequestHistory} = useSelector(state => state.aiSpace)
    // const [response, setResponse] = useState('')
    const {platFormTheme} = useSelector(state => state.system)
    const [loadingResponse, setResponseLoading] = useState(false)
    const [responseTab, setResponseTab] = useState('body')
    const [loadingEditor, setLoadingEditor] = useState(true)
    // const [resLng, setResLng] = useState('json')
    const editorHeadersRef = useRef(null)
    const editorPayloadRef = useRef(null)
    const editorResponseRef = useRef(null)
    const monacoResponseRef = useRef(null)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdate, setUpdate] = useState(false)
    const abortControllerRef = useRef(null)
    const [openDrawer, setOpenDrawer] = useState(false)
    const {response} = httpRequest

    useEffect(() => {
        if (httpRequestHistory.length > 0) {

        }else{
            getHttpRequestHistoryData()
        }
        // init()
        return () => {
            setUpdate(false)

            if (abortControllerRef.current?.abort) {
                // 中止请求
                abortControllerRef.current.abort()
            }
        }
    }, [])


    function globalUpdate() {
        if (!isUpdate) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            setUpdate(true)
        }
    }

    async function getHttpRequestHistoryData() {
        await dispatch(queryRequest())
    }

    async function handleEditorDidMount(editor, monaco, type) {
        try {
            setLoadingEditor(false)
            if (type === 'headers') {
                editorHeadersRef.current = editor
                editor.setValue(httpRequest.headers || '{}')
                // 去掉校验
                // monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                //     validate: false
                // });
            }
            if (type === 'payload') {
                editorPayloadRef.current = editor
                if (httpRequest.contentType === 'application/json' && editor) {
                    editor.setValue(httpRequest.body?.json || '{}')
                }
                if (httpRequest.contentType === 'application/x-www-form-urlencoded' && editor) {
                    editor.setValue(httpRequest.body?.formUrlEncoded || '{}')
                }
                if (httpRequest.contentType === 'multipart/form-data' && editor) {
                    // editor.setValue(httpRequest.body?.formData || '{}')
                }
            }
            if (type === 'response') {
                editorResponseRef.current = editor
                monacoResponseRef.current = monaco
                setEditorData(editorResponseRef, httpRequest.response?.data, httpRequest.response?.headers && httpRequest.response?.headers['content-type'].includes('text/event-stream'))
            }
        } catch (e) {
            console.log('handleEditorDidMount msg=', e.message)
        }
    }

    const selectBefore = (
        <Select value={httpRequest.method} onChange={(e) => changeHandler({target: {value: e}}, 'method')}
                size={'large'} className={'w-[120px]'}>
            <Option value="get">GET</Option>
            <Option value="post">POST</Option>
            <Option value="put">PUT</Option>
            <Option value="delete">DELETE</Option>
        </Select>
    );


    // 设置编辑器值和格式化
    async function setEditorData(editor, value, isEventStream = false) {
        editor.current.updateOptions({readOnly: false})
        if (isString(value)) {
            if (isValidJSON(value) || isEventStream) {
                editor.current.getModel().setLanguage('json');
            } else if (isHTML(value)) {
                editor.current.getModel().setLanguage('html');
            } else if (isXML(value)) {
                editor.current.getModel().setLanguage('xml');
            } else {
                editor.current.getModel().setLanguage('javascript');
            }
            editor.current.setValue(value || "")
        } else {
            if (isValidJSON(value)) {
                editor.current.getModel().setLanguage('json');
            } else {
                editor.current.getModel().setLanguage('javascript');
            }
            // 注意：因为是json所以要转化成字符串，编辑器只认字符串
            editor.current.setValue(JSON.stringify(value) || "")
        }
        await editor.current.getAction('editor.action.formatDocument').run()
        editor.current.updateOptions({readOnly: true})
        // 解决的问题：当编辑器设置值之后会自动滚动到底部问题
        editorResponseRef.current.setScrollTop(0);
    }

    async function onStartSend(cb) {
        if (loadingResponse) {
            return message.warning("正在请求，请稍候")
        }
        if (!httpRequest.url) {
            return message.warning("网址Url不能为空")
        }
        // console.log('---httpRequest.url:', httpRequest.url)
        if (!isUrl(httpRequest.url)) {
            return message.warning("Url检测不合法，请重新输入")
        }
        // 仅post的form-data时使用
        const formData = new FormData()
        // 仅get post put delete 且非form-data 时使用
        let params = {
            url: httpRequest.url,
            method: httpRequest.method
        }
        const headers = editorHeadersRef.current.getValue()

        if (headers) {
            if (!isValidJSON(headers)) {
                return message.warning("请求头/Headers JSON格式不正确，请重新输入")
            }
            if (headers.replace(/\s+/g, '') !== '{}') {
                // 去除换行符
                const result = headers.replace(/\n/g, '');
                params.headers = removeExtraSpaces(result)
                const rs = JSON.parse(params.headers)
                // 遍历对象属性并判断是否是非字符串类型
                for (const key in rs) {
                    if (rs.hasOwnProperty(key)) {
                        const value = rs[key]
                        // 有可能是数组或对象，这里判断不对，
                        // if (!isString(value)) {
                        //     return message.warning("请求头/Headers 属性值不能是数字型！")
                        // }
                    }
                }
            }
        }
        if (['post', 'put'].includes(httpRequest.method)) {
            // 只有post put才能设置content-type，get delete不需要设置
            if (httpRequest.contentType !== 'none') {
                params.contentType = httpRequest.contentType
            }
            if (httpRequest.contentType === 'multipart/form-data') {
                let files = []
                let fileParams = []
                let params = []
                let requestParams = {}
                // console.log('bobobob=', httpRequest.body.formData)
                // formData.append("url", httpRequest.url)
                // formData.append("method", httpRequest.method)
                // formData.append("contentType", httpRequest.contentType)
                requestParams.url = httpRequest.url
                requestParams.method = httpRequest.method
                requestParams.contentType = httpRequest.contentType

                if (headers.replace(/\s+/g, '') !== '{}') {
                    console.log('headers is String=', isString(headers))
                    // formData.append("headers", removeExtraSpaces(headers))
                    requestParams.headers = removeExtraSpaces(headers)
                }

                // 1、添加requestParams
                formData.append("requestParams", JSON.stringify(requestParams))
                console.log('requestParams=', formData.get("requestParams"))
                const formDataList = httpRequest.body.formData
                if (formDataList.length > 0) {
                    const es = formDataList.every(e => e.key && e.value)
                    if (!es) {
                        return message.warning("Key和Value不能为空")
                    } else {
                        console.log('formDataList=', formDataList)
                        formDataList.forEach(f => {
                            // 四个参数：files=[]，fileParams=string，params=string，requestParams
                            if (f.file) {
                                files.push(f.file)
                                fileParams.push(f.key)
                                // formData.append(f.key, f.file);
                            } else {
                                // formData.append(f.key, f.value);
                                params.push({
                                    key: f.key,
                                    value: f.value
                                })
                            }
                        })
                        // 2、添加params
                        formData.append("params", JSON.stringify(params))
                        files.forEach(f => {
                            // 3、添加files
                            formData.append("files", f)
                        })
                        // 4、添加fileParams
                        formData.append("fileParams", JSON.stringify(fileParams))
                    }
                } else {
                    return message.warning("form-data参数不能为空！")
                }
            } else {
                const body = editorPayloadRef.current.getValue()
                if (body) {
                    console.log('httpRequest.contentType=', httpRequest.contentType)
                    if (httpRequest.contentType !== 'none' && !isValidJSON(body)) {
                        return message.warning("载荷/Payload JSON格式不正确，请重新输入")
                    }
                    if (body !== '{}') {
                        if (httpRequest.contentType === 'application/json') {
                            // 去除换行符
                            const result = body.replace(/\n/g, '')
                            params.body = removeExtraSpaces(result)
                        }
                        if (httpRequest.contentType === 'application/x-www-form-urlencoded') {
                            // 去除换行符
                            const realBody = body.replace(/\n/g, '')
                            const jsonBody = JSON.parse(removeExtraSpaces(realBody))
                            console.log('body=', jsonBody)
                            // 创建 URLSearchParams 对象
                            const searchParams = new URLSearchParams();

                            for (const key in jsonBody) {
                                if (jsonBody.hasOwnProperty(key)) {
                                    searchParams.append(key, jsonBody[key]);
                                }
                            }
                            params.body = searchParams.toString()
                        }
                    }
                }
            }
        }

        // return
        setResponseLoading(true)
        console.log('cb---', cb)
        if (cb) {
            cb(true)
        }
        try {
            let fetchUrl = ''
            let fetchParams = null
            if (['post', 'put'].includes(httpRequest.method) && httpRequest.contentType === 'multipart/form-data') {
                console.log('formdata get url =', formData.get('url'))
                fetchUrl = '/space/crud/httpRequest/proxy/formData'
                fetchParams = formData
                // res = await dispatch(proxyFormDataRequest(formData))
            } else {
                console.log('params=', params)
                fetchUrl = '/space/crud/httpRequest/proxy'
                fetchParams = JSON.stringify(params)
                // await dispatch(saveRequest(params))
            }
            console.log('-------------httpRequest-----------------', httpRequest)
            const _saveRequest = {
                ...httpRequest
            }
            if (httpRequest.body) {
                _saveRequest.body = JSON.stringify(httpRequest.body)
            }
            console.log('-------------_saveRequest-----------------', _saveRequest)

            if (httpRequest.id){
                await dispatch(updateRequest(_saveRequest))
            }else{
                await dispatch(saveRequest(_saveRequest))
            }

            getHttpRequestHistoryData()

            let headers = {
                'token-id': `${session?.accessToken}`
            };

            if (httpRequest.contentType !== 'multipart/form-data') {
                headers['Content-Type'] = 'application/json';
            }

            abortControllerRef.current = new AbortController()

            const signal = abortControllerRef.current.signal

            console.log('---fetchParams---', fetchParams)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}${fetchUrl}`, {
                method: 'POST',
                // 注意，当你使用 multipart/form-data 时，不应该手动设置 Content-Type 头。浏览器会自动处理这个头，并生成一个合适的边界（boundary），用于分隔各部分内容。如果你手动设置 Content-Type，会导致这个边界信息丢失，从而使表单数据无法正确解析。
                headers: headers,
                body: fetchParams,
                // 将signal传递给fetch请求
                signal: signal
            });

            // 重置选中tab
            setResponseTab('body')

            // 注意：Headers对象本身并不直接暴露为一个可迭代的数组或对象，因此当你尝试打印或查看response.headers时，它可能看起来像是空的或者不包含明显的键值对。
            const contentType = response.headers.get('Content-Type');
            // console.log('--- response.headers ---', response.headers)
            console.log('--- response ---', response)
            console.log('--- contentType ---', contentType)
            // console.log('--- body ---', response.body)
            if (!contentType) {
                editorResponseRef.current.setValue(response.statusText || '')
                setResponseLoading(false)
                return
            }
            if (response.status === 204) {
                editorResponseRef.current.setValue(response.statusText || '')
                setResponseLoading(false)
                return
            }
            // 迭代所有头部
            if (contentType && contentType.includes('application/json')) {
                // Handle JSON response
                const jsonData = await response.json();
                console.log('JSON data:', jsonData);
                // 将返回信息写入到redux
                setResponseValueToEditor(response, jsonData)
            } else if (contentType && contentType.includes('text/html')) {
                // Handle JSON response
                const resTxt = await response.text();
                console.log('response data:', response);
                setResponseValueToEditor(response, resTxt)
                // console.log('resTxt data:', resTxt);
                // 将返回信息写入到redux
                // setResponseValueToEditor(jsonData)
            } else if (contentType && contentType.includes('text/plain')) {
                // Handle JSON response
                const resTxt = await response.text();
                console.log('resTxt data:', resTxt);
                // 将返回信息写入到redux
                setResponseValueToEditor(response, resTxt)
            } else if (contentType && contentType.includes('application/xml')) {
                // Handle JSON response
                const resTxt = await response.text();
                console.log('resTxt data:', resTxt);
                // 将返回信息写入到redux
                setResponseValueToEditor(response, resTxt)
            } else if (contentType && contentType.includes('text/event-stream')) {
                let msgList = ''
                // Handle event stream
                const reader = response.body.getReader();

                // editorResponseRef.current.getModel().setLanguage('json');

                // 解决的问题：当编辑器设置值之后会自动滚动到底部问题
                editorResponseRef.current.setScrollTop(0);
                while (true) {
                    const decoder = new TextDecoder();
                    const {done, value} = await reader.read();
                    if (done) {
                        setResponseLoading(false)
                        // await editorResponseRef.current.getAction('editor.action.formatDocument').run()
                        console.log('完成收取消息')
                        setResponseValueToEditor(response, msgList)
                        break
                    }
                    const message = decoder.decode(value, {stream: true})
                    msgList += message
                    editorResponseRef.current.setValue(msgList)
                }
            } else if (contentType.includes("application/pdf")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("application/zip")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("application/x-rar-compressed")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("application/vnd.ms-excel") || contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("application/vnd.ms-powerpoint") || contentType.includes("application/vnd.openxmlformats-officedocument.presentationml.presentation")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("application/msword") || contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("application/octet-stream")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("image/")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("audio/")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else if (contentType.includes("video/")) {
                // 读取响应体为Blob
                const blob = await response.blob();

                // 将Blob转换为文本
                const text = await blob.text();
                setResponseValueToEditor(response, text)
            } else {
                // 编辑器返回值也要提示
                console.error('Unsupported content type:', contentType);
                editorResponseRef.current.setValue('Unsupported content type:' + contentType)

                setResponseLoading(false)
            }
            setResponseLoading(false)
        } catch (e) {
            console.log('e=', e.message)
            editorResponseRef.current.setValue(e.message)
            setResponseLoading(false)
        }
    }

    // 注意：Response 对象是一个具有特殊内置功能的对象，简单的复制不会保留所有功能。
    async function setResponseValueToEditor(res, resData) {
        let headers = {}
        for (let [name, value] of res.headers.entries()) {
            console.log(`${name}: ${value}`);
            headers[name] = value
        }
        // 注意：Response 对象和headers一样是一个具有特殊内置功能的对象，简单的复制不会保留所有功能。
        let newRes = {
            status: res.status,
            statusText: res.statusText,
            headers: headers,
            url: res.url,
            data: resData
        };
        dispatch(setHttpRequest({
            which: 'response',
            response: newRes
        }))

        if (resData) {
            // 只有可编辑的代码才能格式化代码
            setEditorData(editorResponseRef, resData, httpRequest.response?.headers && httpRequest.response?.headers['content-type'].includes('text/event-stream'))
        } else {
            editorResponseRef.current.setValue('')
        }
    }

    function changeHandler(e, type) {
        try {
            console.log('e---', e)
            const {value} = e.target
            dispatch(setHttpRequest({
                which: type,
                [type]: value.trim()
            }))
            if (editorPayloadRef.current && value !== 'none') {
                if (value === 'application/json') {
                    editorPayloadRef.current.setValue(httpRequest.body?.json || '{}')
                }
                if (value === 'application/x-www-form-urlencoded') {
                    editorPayloadRef.current.setValue(httpRequest.body?.formUrlEncoded || '{}')
                }
                if (value === 'multipart/form-data') {
                    // editorPayloadRef.current.setValue(httpRequest.body?.formData || '{}')
                }
            }
        } catch (e) {

        }
    }

    function renderResponseEditor() {
        return <Spin spinning={loadingResponse} indicator={<LoadingOutlined spin/>} size="large">
            {/*<div className={classNames({*/}
            {/*    'p-2': true,*/}
            {/*    'hidden': responseTab === 'body'*/}
            {/*})}>*/}
            {/*    {renderResponseHeaders()}*/}
            {/*</div>*/}
            <div className={classNames({
                // 'hidden': responseTab === 'headers'
            })}>
                <Editor height="calc(100vh - 156px)"
                        onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, 'response')}
                        loading={''}
                        defaultLanguage={'html'}
                        keepCurrentModel={true}
                        options={{
                            formatOnType: true,
                            formatOnPaste: true,
                            minimap: {enabled: false},
                            lineNumbers: 'on',
                            folding: true,
                            renderLineHighlight: 'none',
                            overviewRulerBorder: false,
                            hideCursorInOverviewRuler: true,
                            wordWrap: 'on',  // 自动换行
                            wordWrapColumn: 80,  // 在第80列后换行，可以根据需要调整
                            wrappingIndent: 'indent',  // 设置换行的缩进方式
                            scrollbar: {
                                verticalScrollbarSize: 0,
                                horizontalScrollbarSize: 0
                            },
                            guides: {
                                indentation: false
                            },
                            quickSuggestions: false,
                            suggestOnTriggerCharacters: false,
                            parameterHints: false,
                            autoClosingBrackets: false,
                            autoClosingQuotes: false,
                            matchBrackets: 'never',
                            codeLens: false,
                            inlayHints: {enabled: false},
                            occurrencesHighlight: false,
                            selectionHighlight: false,
                            wordBasedSuggestions: false,
                            hover: {enabled: false},
                            links: false
                        }}
                        theme={platFormTheme.background === 'light' ? 'light' : 'vs-dark'}/>
            </div>
        </Spin>
    }

    function renderHeadersEditor() {
        return <Editor height={'calc(100% - 48px)'}
                       loading={''}
                       keepCurrentModel={true}

                       onChange={(e) => changeHandler({
                           target: {
                               value: e
                           }
                       }, 'headers')}
                       onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, 'headers')}
                       language={"json"}
                       options={{
                           parameterHints: false,
                           // readOnly: true,
                           contextmenu: false,
                           domReadOnly: true, // 禁用提示消息
                           scrollbar: {
                               verticalScrollbarSize: 0,
                               horizontalScrollbarSize: 0
                           },
                           wordWrap: 'on', // 自动换行
                           wordWrapColumn: 80, // 设置自动换行的列数
                           wrappingIndent: 'indent', // 缩进换行的行
                           minimap: {enabled: false},
                           quickSuggestions: false,
                           suggestOnTriggerCharacters: false,
                           acceptSuggestionOnEnter: 'off',
                           tabCompletion: 'off',
                           wordBasedSuggestions: false,
                           lightbulb: {enabled: false},
                           codeLens: false,
                           hover: {enabled: false},
                           folding: false,
                           links: false,
                           colorDecorators: false
                       }}
                       theme={platFormTheme.background === 'light' ? 'light' : 'vs-dark'}/>
    }

    function renderFormData() {
        return httpRequest?.body?.formData?.map((m, index) => {
            return <div className={'flex items-center gap-1 p-2'}>
                <div className={'w-2/5'}>
                    <Input placeholder="Key" value={m.key} onChange={(e) => {
                        const {value} = e.target
                        dispatch(setHttpRequestFormData({
                            which: 'key',
                            index: index,
                            key: value
                        }))
                    }}/>
                </div>
                <div className={'w-2/5'}>
                    <Input disabled={m.file} placeholder="Value" value={m.value} onChange={(e) => {
                        const {value} = e.target
                        dispatch(setHttpRequestFormData({
                            which: 'value',
                            index: index,
                            value: value
                        }))
                    }}/>
                </div>
                <div className={'w-1/5'}>
                    <Space.Compact style={{width: '100%'}}>
                        <Upload {...{
                            // 不显示上传文件列表
                            showUploadList: false,
                            multiple: false,
                            maxCount: 1,

                            // name: 'file',
                            // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
                            // headers: {
                            //     authorization: 'authorization-text',
                            // },
                            beforeUpload: async (file) => {
                                dispatch(setHttpRequestFormData({
                                    which: 'file',
                                    index: index,
                                    file: file
                                }))
                                return false
                            }
                        }}>
                            <Button icon={<UploadOutlined/>}>上传文件</Button>
                        </Upload>
                        <Button type="primary" icon={<DeleteOutlined/>} danger onClick={() => {
                            dispatch(removeHttpRequestFormData(index))
                        }}/>
                    </Space.Compact>
                </div>
            </div>
        })
    }

    function renderPayloadEditor() {
        return <>
            <div className={classNames({
                'py-8 flex items-center justify-center text-[#97A8BE]': true,
                'hidden': httpRequest.contentType !== 'none'
            })}>该请求没有载荷 / Payload
            </div>
            <div className={classNames({
                'h-[calc(100%-95px)] overflow-y-auto': true,
                'hidden': httpRequest.contentType !== 'multipart/form-data'
            })}>
                {
                    httpRequest?.body?.formData?.length > 0 ?
                        <div className={'flex items-center text-sm gap-2 pt-2 px-2'}>
                            <div className={'w-2/5'}>
                                KEY
                            </div>
                            <div className={'w-2/5'}>
                                VALUE
                            </div>
                        </div> : <div className={classNames({
                            'py-8 flex items-center justify-center text-[#97A8BE]': true
                        })}>该请求没有Form-Data
                        </div>
                }

                {
                    renderFormData()
                }
            </div>
            <div className={classNames({
                'h-full': true,
                'hidden': ['none', 'multipart/form-data'].includes(httpRequest.contentType)
            })}>
                <Editor height={'100%'}
                        onChange={(e) => changeHandler({
                            target: {
                                value: e
                            }
                        }, 'body')}
                        onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, 'payload')}
                        loading={''}
                        keepCurrentModel={true}

                        language={"json"}
                        options={{
                            parameterHints: false,
                            // readOnly: true,
                            contextmenu: false,
                            domReadOnly: true, // 禁用提示消息
                            wordWrap: 'on', // 自动换行
                            wordWrapColumn: 80, // 设置自动换行的列数
                            wrappingIndent: 'indent', // 缩进换行的行
                            minimap: {enabled: false},
                            scrollbar: {
                                verticalScrollbarSize: 0,
                                horizontalScrollbarSize: 0
                            },
                            quickSuggestions: false,
                            suggestOnTriggerCharacters: false,
                            acceptSuggestionOnEnter: 'off',
                            tabCompletion: 'off',
                            wordBasedSuggestions: false,
                            lightbulb: {enabled: false},
                            codeLens: false,
                            hover: {enabled: false},
                            folding: false,
                            links: false,
                            colorDecorators: false
                        }}
                        theme={platFormTheme.background === 'light' ? 'light' : 'vs-dark'}/>
            </div>
        </>
    }

    async function onFormat(type) {
        try {
            if (type === 'payload') {
                if (editorPayloadRef.current) {
                    await editorPayloadRef.current.getAction('editor.action.formatDocument').run();
                }
            }
            if (type === 'headers') {
                if (editorHeadersRef.current) {
                    await editorHeadersRef.current.getAction('editor.action.formatDocument').run();
                }
            }
        } catch (e) {

        }
    }

    function handlerAddFormData() {
        dispatch(addHttpRequestFormData())
    }

    function onReset(type) {
        if (type === 'headers' && editorHeadersRef.current) {
            editorHeadersRef.current.setValue('{}')
            dispatch(setHttpRequest({
                which: 'headers',
                headers: ''
            }))
        }
        if (type === 'payload' && editorPayloadRef.current && httpRequest.contentType === 'multipart/form-data') {
            dispatch(resetHttpRequestFormData())
        }
        if (type === 'payload' && editorPayloadRef.current && httpRequest.contentType !== 'multipart/form-data') {
            editorPayloadRef.current.setValue('{}')
            dispatch(setHttpRequest({
                which: 'body',
                body: ''
            }))
        }
    }

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // 切换response tab
    async function onResponseHandler(e) {
        if (editorResponseRef.current) {
            if (e === 'body') {
                setEditorData(editorResponseRef, httpRequest.response?.data, httpRequest.response?.headers && httpRequest.response?.headers['content-type'].includes('text/event-stream'))
            } else {
                setEditorData(editorResponseRef, httpRequest.response?.headers, httpRequest.response?.headers && httpRequest.response?.headers['content-type'].includes('text/event-stream'))
            }
        }
        setResponseTab(e)
    }

    function renderHistoryList() {
        return httpRequestHistory.map(item => {
            return <div className={classNames({
                'w-full  p-2 rounded-md text-sm flex items-center gap-2 truncate cursor-pointer': true,
                'bg-[#D4CEF1] dark:bg-[#2E333C]': item.id === httpRequest.id,
                'bg-[#f1f2f3] dark:bg-[#1E1E1E]': item.id !== httpRequest.id
            })} onClick={async () => {
                console.log('item =>', item)
                if (openDrawer){
                    setOpenDrawer(false)
                }
                try {
                    const _s = {...item}
                    if (item.body) {
                        _s.body = JSON.parse(item.body)
                    }
                    console.log('body====', _s)
                    await dispatch(initHttpRequest(_s))

                    if (item.headers && editorHeadersRef.current) {
                        editorHeadersRef.current.setValue(item.headers || '{}')
                    }
                    if (item.contentType === 'application/json' && _s.body?.json && editorPayloadRef.current) {
                        editorPayloadRef.current.setValue(_s.body.json || '{}')
                    }
                    if (item.contentType === 'application/x-www-form-urlencoded' && _s.body?.formUrlEncoded && editorPayloadRef.current) {
                        editorPayloadRef.current.setValue(_s.body.formUrlEncoded || '{}')
                    }
                    if (editorResponseRef.current){
                        editorResponseRef.current.setValue('')
                    }
                    // if (_s.body?.formData && editorPayloadRef.current){
                    //     editorPayloadRef.current.setValue(_s.body.json || '{}')
                    // }
                } catch (e) {
                    console.log('---出错=', e)
                }
            }}>
                {
                    item.method === 'get' ? <span className={'text-[green]'}>{item.method}</span> : null
                }
                {
                    item.method === 'post' ? <span className={'text-[#049ebc]'}>{item.method}</span> : null
                }
                {
                    item.method === 'put' ? <span className={'text-[#ff8f00]'}>{item.method}</span> : null
                }
                {
                    item.method === 'delete' ? <span className={'text-[red]'}>{item.method}</span> : null
                }
                <span className={'w-full truncate'}>{item.url}</span>
                {
                    item.id === httpRequest.id ? <span className={'text-[red]'} onClick={() => {
                        confirm({
                            title: `您确定要删除？`,
                            okText: '确定',
                            cancelText: '取消',
                            onOk: async () => {
                                try {
                                    const s = await dispatch(deleteRequest({
                                        id: httpRequest.id,
                                    }))
                                    console.log('s-----',s)
                                    if (s.payload.status === 0 && s.payload.data) {
                                        message.success('删除成功');
                                        getHttpRequestHistoryData()
                                        reset()
                                    }else{
                                        message.error("删除失败")
                                    }
                                } catch (e) {
                                    message.error("删除失败")
                                }
                            }
                        });

                    }}><CloseCircleOutlined/></span> : null
                }
            </div>
        })
    }

    function reset(){
        dispatch(initHttpRequest({
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
        }))
        if (editorHeadersRef.current) {
            editorHeadersRef.current.setValue('{}')
        }
        if (editorResponseRef.current) {
            editorResponseRef.current.setValue('')
        }
    }

    function renderLeft(){
        if (loadingEditor){
            return <div className={'w-full flex items-center justify-center'}>
                <Loading />
            </div>
        }
        return <>
            <div className={'border-b border-[#ddd] dark:border-[#474747] p-3 flex items-center justify-between'}>
                <span>请求列表</span>
                <Button icon={<PlusOutlined/>} size={'small'} onClick={() => {
                    reset()
                    if(openDrawer) {
                        setOpenDrawer(false)
                    }
                }}></Button>
            </div>
            <div className={classNames({
                ' overflow-y-auto ': true,
                'h-[calc(100vh-50px)]': openDrawer,
                'h-[calc(100vh-106px)]': !openDrawer
            })}>
                <div className={'flex flex-col gap-2 p-2 '}>
                    {httpRequestHistory.length > 0 ? renderHistoryList() : <Empty/>}
                </div>
            </div>
        </>
    }

    return <div className={'flex flex-row w-full h-full'}>
        <div className={'w-[240px]  border-[#ddd] border-r dark:border-[#474747] flex-shrink-0 hidden xl:block'}>
            {renderLeft()}
        </div>
        <div className={'flex flex-col w-full h-full overflow-hidden'} onClick={globalUpdate}>
            {/*<div*/}
            {/*    className={'sticky top-0 p-3 font-medium border-b border-[#ddd] dark:border-[#474747] flex flex-row justify-between'}>*/}
            {/*    <span>HTTP助手</span>*/}
            {/*    /!*<div className={'xl:hidden block'} onClick={()=>setIsModalOpen(true)}>查看执行结果</div>*!/*/}
            {/*</div>*/}
            <div className={'w-full'}>
                <div className={'p-3 pb-0 w-full flex items-center gap-2'}>
                    <div className={'xl:block hidden'}>
                        <Button size={'large'} type={loadingResponse ? 'default' : 'primary'} onClick={() => {
                            if (loadingResponse) {
                                if (abortControllerRef.current) {
                                    // 中止请求
                                    abortControllerRef.current.abort()
                                }
                            } else {
                                onStartSend()
                            }
                        }}
                                loading={loadingEditor}>{loadingResponse ? '取消请求' : loadingEditor ? '正在加载' : '发送'}</Button>
                    </div>
                    <div className={'xl:hidden flex items-center gap-2'}>
                        <div className={'cursor-pointer py-1 px-2'} onClick={() => {
                            setOpenDrawer(true)
                        }}>
                            <PicLeftOutlined/>
                        </div>
                        <Button size={'large'} type={'primary'} onClick={() => {
                            if (loadingResponse) {
                                if (abortControllerRef.current) {
                                    // 中止请求
                                    abortControllerRef.current.abort()
                                }
                            } else {
                                onStartSend((d) => {
                                    if (d) {
                                        setIsModalOpen(true)
                                    }
                                })
                            }
                        }}>{loadingResponse ? '取消请求' : '发送'}</Button>
                    </div>
                    <Space.Compact style={{width: '100%'}}>
                        {selectBefore}
                        <Input size={'large'} placeholder={'请输入网址'} value={httpRequest.url}
                               onChange={(e) => changeHandler(e, 'url')}/>
                        {/*<Button size={"large"} icon={<SaveOutlined/>} type={'primary'}>新建</Button>*/}
                    </Space.Compact>
                </div>
            </div>
            <div className={'w-full flex flex-col lg:flex-row h-full'}>
                <div className={'w-full xl:w-1/2 border-r border-[#ddd] dark:border-[#474747] h-full flex flex-col'}>
                    <div className={'h-[210px] xl:h-[260px] shrink-0'}>
                        <div
                            className={'px-3 h-[48px] border-b border-[#ddd] dark:border-[#474747] text-base flex items-center justify-between'}>
                            <span>请求头 / Headers</span>
                            <div className={'flex items-center gap-0'}>
                            <span
                                className={'text-sm font-normal cursor-pointer flex items-center gap-1 hover:bg-[#eee] dark:hover:bg-[#2E333D] py-1 px-2 rounded-md'}
                                onClick={() => onFormat('headers')}><FormatPainterOutlined/>格式化</span>
                                <span
                                    className={'text-sm font-normal cursor-pointer flex items-center gap-1 hover:bg-[#eee] dark:hover:bg-[#2E333D] py-1 px-2 rounded-md'}
                                    onClick={() => onReset('headers')}><RedoOutlined/>重置</span>
                            </div>
                        </div>
                        <div className={'w-full h-full pt-2'}>
                            {renderHeadersEditor()}
                        </div>
                    </div>
                    <div className={'h-[calc(100%-170px)] xl:h-[calc(100%-220px)] shrink-0'}>
                        <div
                            className={'px-3 h-[48px] border-t border-[#ddd] dark:border-[#474747] text-base flex items-center justify-between relative'}>
                            <span>载荷 / Payload</span>
                            <div className={'flex items-center gap-0'}>
                            <span
                                className={'text-sm font-normal cursor-pointer flex items-center gap-1 hover:bg-[#eee] dark:hover:bg-[#2E333D] py-1 px-2 rounded-md'}
                                onClick={() => onFormat('payload')}><FormatPainterOutlined/>格式化</span>
                                <span
                                    className={'text-sm font-normal cursor-pointer flex items-center gap-1 hover:bg-[#eee] dark:hover:bg-[#2E333D] py-1 px-2 rounded-md'}
                                    onClick={() => onReset('payload')}><RedoOutlined/>重置</span>
                            </div>
                        </div>
                        <div
                            className={'flex items-center justify-between px-3 border-b border-[#ddd] dark:border-[#474747] pb-2'}>
                            <div className={'2xl:hidden block'}>
                                <Select
                                    value={httpRequest.contentType}
                                    onChange={(e) => changeHandler({
                                        target: {
                                            value: e
                                        }
                                    }, 'contentType')}
                                    size={'small'}
                                    style={{width: '200px'}}
                                    options={[
                                        {value: 'none', label: 'None'},
                                        {value: 'application/json', label: 'Json'},
                                        {value: 'application/x-www-form-urlencoded', label: 'X-www-form-urlencoded'},
                                        {value: 'multipart/form-data', label: 'Form-Data'},
                                    ]}
                                />
                            </div>
                            <div className={'2xl:block hidden'}>
                                <Radio.Group value={httpRequest.contentType}
                                             onChange={(e) => changeHandler(e, 'contentType')}>
                                    <Radio value={'none'}>none</Radio>
                                    <Radio value={'application/json'}>json</Radio>
                                    <Radio value={'application/x-www-form-urlencoded'}>x-www-form-urlencoded</Radio>
                                    <Radio value={'multipart/form-data'}>form-data</Radio>
                                    {/*<Radio value={'binary'}>binary</Radio>*/}
                                </Radio.Group>
                            </div>
                            <div className={classNames({
                                'text-sm cursor-pointer gap-1 rounded-md hover:bg-[#eee] dark:hover:bg-[#2E333D] px-2 h-[30px] flex items-center': true,
                                'invisible': httpRequest.contentType !== 'multipart/form-data'
                            })} onClick={handlerAddFormData}><PlusOutlined/>添加
                            </div>
                        </div>
                        <div className={'w-full h-[calc(100%-90px)]'}>
                            {renderPayloadEditor()}
                        </div>
                    </div>
                </div>
                <div className={'w-full xl:w-1/2 h-full hidden xl:block'}>
                    <div
                        className={'flex items-center justify-between px-2 h-[48px] text-base border-b border-[#ddd] dark:border-[#474747]'}>
                        <div className={'flex items-center gap-2'}>
                            <Segmented disabled={loadingResponse} options={[{label: '响应 / Response', value: 'body'},
                                {label: '响应头 / Headers', value: 'headers'}]} value={responseTab}
                                       onChange={onResponseHandler}/>
                        </div>
                        <div className={'flex items-center gap-2 text-sm pr-2'}>
                            {
                                response ? <>
                                    Status:
                                    <div className={'flex items-center gap-2 text-green-700'}>
                                        <span>{response?.status}</span>
                                        <span>{response?.statusText}</span>
                                    </div>
                                </> : null
                            }
                        </div>
                    </div>
                    <div className={''}>
                        {renderResponseEditor()}
                    </div>
                </div>

            </div>
        </div>

        <Modal title={<Segmented options={[{label: '响应 / Response', value: 'body'},
            {label: '响应头 / Headers', value: 'headers'}]} defaultValue={"body"}
                                 onChange={onResponseHandler}/>} style={{top: 20, width: '100%', height: '100%'}}
               open={isModalOpen} onOk={handleOk}
               onCancel={handleCancel} footer={
            <div className={'flex items-center gap-2 text-green-700'}>
                <span>{response?.status}</span>
                <span>{response?.statusText}</span>
            </div>}>
            <div>
                {renderResponseEditor()}
            </div>
        </Modal>

        <Drawer className={''}
                width={375}
                placement={'left'}
                onClose={() => setOpenDrawer(false)} closable={false} open={openDrawer}
                styles={{
                    body: {
                        padding: '0',
                    },
                }}>
            {renderLeft()}
        </Drawer>
    </div>

};

export default withRouter(HttpRequest);
