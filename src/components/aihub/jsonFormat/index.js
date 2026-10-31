'use client'
import {useCallback, useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Alert, Button, Input} from "antd";
import {CaretRightOutlined, FormatPainterOutlined} from "@ant-design/icons";
import {queryUserAiTools, updateDt, setJson} from "@/lib/slices/aiSpaceSlice";
import Editor from "@monaco-editor/react";

const {TextArea} = Input;
const UserCard = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    // const [json, setJson] = useState('')
    // const [jsonTxt, setJsonTxt] = useState('')
    const {platFormTheme} = useSelector(state => state.system)
    const query = useSearchParams()

    // const [isUpdate, setUpdate] = useState(false)
    const isUpdate = useRef(false)
    const {jsonFormat} = useSelector(state => state.aiSpace)
    const {json, error} = jsonFormat

    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    // 格式化json并去除转义字符串
    function formatCode() {
        if (editorRef.current) {
            const currentCode = editorRef.current.getValue();
            // 将转义字符的 JSON 字符串解析为对象
            const parsedCode = JSON.parse(currentCode.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"'));
            const formattedCode = JSON.stringify(parsedCode, null, 2);
            editorRef.current.setValue(formattedCode);
            dispatch(setJson({
                which: 'error',
                error: ''
            }))
        }
    }

    useEffect(() => {
        // init()
        return () => {
            isUpdate.current = false
        }
    }, [])

    function globalUpdate() {
        if (!isUpdate.current) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            isUpdate.current = true
        }
    }

    function onChange(e) {
        dispatch(setJson({
            which: 'json',
            json: e
        }))
    }

    function onFormat() {
        try {
            formatCode()
        }catch (e){
            dispatch(setJson({
                which: 'error',
                error: JSON.stringify(e.message)
            }))
        }
    }

    return <div className={'flex flex-col h-screen'} onClick={globalUpdate}>
        <div className={'flex items-center justify-between font-medium px-3 py-2 border-b border-[#ddd] dark:border-[#474747]'}>
            <div className={'flex items-center gap-2'}>JSON 格式化
                <span className={'text-base font-normal cursor-pointer flex items-center gap-1 hover:bg-[#eee] py-1 px-2 rounded-md'}
                    onClick={onFormat}><CaretRightOutlined />格式化</span>
            </div>
            {/*<div className={'hidden lg:block font-normal text-sm'}>*/}
            {/*    <div className={'text-xs font-normal cursor-pointer flex items-center gap-1 hover:bg-[#eee] p-1 rounded-md'}*/}
            {/*        onClick={onRemoveEscape}>*/}
            {/*        <FormatPainterOutlined/>去除转义*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
        <div className={'flex flex-col w-full h-full'}>
            {
                error ? <div className={'p-2'}>
                    <Alert message={error} type="error"/>
                </div>:null
            }
            <div className={'w-full h-full overflow-y-auto p-1'}>
                <Editor height={error?'calc(100vh - 170px)':'calc(100vh - 120px)'}
                        loading={'正在加载，请稍候...'}
                        language={"json"}
                        value={json}
                        onMount={handleEditorDidMount}
                        onChange={onChange}
                        options={{
                            parameterHints: false,
                            // readOnly: true,
                            contextmenu: false,
                            domReadOnly: true, // 禁用提示消息

                            wordWrap: 'on', // 自动换行
                            wordWrapColumn: 80, // 设置自动换行的列数
                            wrappingIndent: 'indent', // 缩进换行的行
                            minimap: {enabled: false}
                        }}
                        theme={platFormTheme.background === 'light' ? 'light' : 'vs-dark'}/>
            </div>
        </div>
    </div>
};

export default withRouter(UserCard);