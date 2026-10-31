'use client'
import {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Button, Input, Select} from 'antd';
import Editor, {DiffEditor} from '@monaco-editor/react';
import {queryUserAiTools, setCodeComparisonCodeTxt, setCodeComparisonLng, updateDt} from '@/lib/slices/aiSpaceSlice'
const {TextArea} = Input;
const CodeComparison = (props) => {
    const {data: session} = useSession()
    const router = useRouter()
    const query = useSearchParams()

    const dispatch = useDispatch()
    const [oldCode, setOldCode] = useState('')
    const [newCode, setNewCode] = useState('')
    // const [lng, setLng] = useState('javascript')
    const diffEditorRef = useRef(null)
    const {platFormTheme} = useSelector(state => state.system)
    const {codeComparison} = useSelector(state => state.aiSpace)
    const {originalCode, modifiedCode, lng} = codeComparison
    const isUpdate = useRef(false)

    useEffect(() => {
        return () => {
            getEditorValues()
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

    const handleEditorDidMount = (editor) => {
        diffEditorRef.current = editor;
    };

    // useEffect(() => {
    //     if (diffEditorRef.current) {
    //         const originalEditor = diffEditorRef.current.getOriginalEditor();
    //         const modifiedEditor = diffEditorRef.current.getModifiedEditor();
    //
    //         // Example: Log the initial content
    //         console.log('Original Content:', originalEditor.getValue());
    //         console.log('Modified Content:', modifiedEditor.getValue());
    //
    //         // Example: Add an event listener to log content on change
    //         originalEditor.onDidChangeModelContent(() => {
    //             console.log('Original Content Changed:', originalEditor.getValue());
    //         });
    //
    //         modifiedEditor.onDidChangeModelContent(() => {
    //             console.log('Modified Content Changed:', modifiedEditor.getValue());
    //         });
    //     }
    //
    // }, [diffEditorRef]);

    const getEditorValues = () => {
        if (diffEditorRef.current) {
            const originalEditor = diffEditorRef.current.getOriginalEditor();
            const modifiedEditor = diffEditorRef.current.getModifiedEditor();
            const originalCode =  originalEditor.getValue()
            const modifiedCode = modifiedEditor.getValue()

            console.log('Original Content:', originalEditor.getValue());
            console.log('Modified Content:', modifiedEditor.getValue());

            // 保存到redux缓存中
            dispatch(setCodeComparisonCodeTxt({
                originalCode: originalCode,
                modifiedCode: modifiedCode
            }))
        }
    };

    const onChange = (value) => {
        console.log(`selected ${value}`);
        // setLng(value)
        dispatch(setCodeComparisonLng(value))
    };

    return <div className={'flex flex-col h-[100vh]]'} onClick={globalUpdate}>
        <div className={'px-3 py-2 flex items-center justify-between border-b border-[#ddd] dark:border-[#474747]'}>
            <span className={'font-medium'}>代码比对</span>
            <span><Select
                style={{width: '200px'}}
                defaultValue={lng}
                showSearch
                placeholder="请选择语言"
                optionFilterProp="label"
                onChange={onChange}
                options={[{
                    value: "apex",
                    label: "apex"
                }, {
                    value: "azcli",
                    label: "azcli"
                }, {
                    value: "bat",
                    label: "bat"
                }, {
                    value: "c",
                    label: "c"
                }, {
                    value: "clojure",
                    name: "clojure"
                }, {
                    value: "coffeescript",
                    label: "coffeescript"
                }, {
                    value: "cpp",
                    label: "cpp"
                }, {
                    value: "csharp",
                    label: "csharp"
                }, {
                    value: "csp",
                    label: "csp"
                }, {
                    value: "css",
                    label: "css"
                }, {
                    value: "dockerfile",
                    label: "dockerfile"
                }, {
                    value: "fsharp",
                    label: "fsharp"
                }, {
                    value: "go",
                    label: "go"
                }, {
                    value: "graphql",
                    label: "graphql"
                }, {
                    value: "handlebars",
                    label: "handlebars"
                }, {
                    value: "html",
                    label: "html"
                }, {
                    value: "ini",
                    label: "ini"
                }, {
                    value: "java",
                    label: "java"
                }, {
                    value: "javascript",
                    label: "javascript"
                }, {
                    value: "json",
                    label: "json"
                }, {
                    value: "kotlin",
                    label: "kotlin"
                }, {
                    value: "less",
                    label: "less"
                }, {
                    value: "lua",
                    label: "lua"
                }, {
                    value: "markdown",
                    label: "markdown"
                }, {
                    value: "msdax",
                    label: "msdax"
                }, {
                    value: "mysql",
                    label: "mysql"
                }, {
                    value: "objective-c",
                    label: "objective-c"
                }, {
                    value: "pascal",
                    label: "pascal"
                }, {
                    value: "perl",
                    label: "perl"
                }, {
                    value: "pgsql",
                    label: "pgsql"
                }, {
                    value: "php",
                    label: "php"
                }, {
                    value: "plaintext",
                    label: "plaintext"
                }, {
                    value: "postiats",
                    label: "postiats"
                }, {
                    value: "powerquery",
                    label: "powerquery"
                }, {
                    value: "powershell",
                    label: "powershell"
                }, {
                    value: "pug",
                    label: "pug"
                }, {
                    value: "python",
                    label: "python"
                }, {
                    value: "r",
                    label: "r"
                }, {
                    value: "razor",
                    label: "razor"
                }, {
                    value: "redis",
                    label: "redis"
                }, {
                    value: "redshift",
                    label: "redshift"
                }, {
                    value: "ruby",
                    label: "ruby"
                }, {
                    value: "rust",
                    label: "rust"
                }, {
                    value: "sb",
                    label: "sb"
                }, {
                    value: "scheme",
                    label: "scheme"
                }, {
                    value: "scss",
                    label: "scss"
                }, {
                    value: "shell",
                    label: "shell"
                }, {
                    value: "sol",
                    label: "sol"
                }, {
                    value: "sql",
                    label: "sql"
                }, {
                    value: "st",
                    label: "st"
                }, {
                    value: "swift",
                    label: "swift"
                }, {
                    value: "tcl",
                    label: "tcl"
                }, {
                    value: "typescript",
                    label: "typescript"
                }, {
                    value: "vb",
                    label: "vb"
                }, {
                    value: "xml",
                    label: "xml"
                }, {
                    value: "yaml",
                    label: "yaml"
                }]}
            /></span>
        </div>
        <div className={'flex flex-row h-full'}>
            <DiffEditor height="calc(100vh - 105px)"
                        theme={platFormTheme.background === 'light' ? 'light' : 'vs-dark'}
                        language={lng}
                        loading={'正在加载，请稍候...'}
                        original={originalCode}
                        modified={modifiedCode}
                        defaultValue="请输入代码"
                        onMount={handleEditorDidMount}
                        options={{
                            originalEditable: true, // 使左侧（原始代码）可编辑
                            modifiedEditable: true, // 使右侧（修改后的代码）可编辑
                        }}/>
        </div>
    </div>
};

export default withRouter(CodeComparison);