'use client'
import React, {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Drawer, Dropdown, Input, message, Modal, Select, Splitter, Tabs} from 'antd';
import Editor, {loader} from '@monaco-editor/react';
import {addFileForText, queryUserAiTools, setCodeEditor, updateDt} from '@/lib/slices/aiSpaceSlice'
import {
    BorderlessTableOutlined, BorderOutlined,
    CaretDownOutlined, ClearOutlined, DeleteOutlined,
    DownloadOutlined, FileAddOutlined, FileOutlined,
    FolderOpenOutlined,
    FolderOutlined,
    FormatPainterOutlined, PicLeftOutlined,
    SaveOutlined
} from "@ant-design/icons";
import hljs from 'highlight.js';
import SaveFileDlg from "@/components/dialog/saveFileDlg";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import CodeEditorDb from '@/db/aiSpace/codeEditorDb'
import InputDlg from "@/components/dialog/inputDlg";
import classNames from "classnames/bind";
import Empty from "@/components/empty";
import {deleteUrl} from "@/lib/slices/urlSpaceSlice";
import Loading from "@/components/loading";
import styles from "./index.module.scss";
import IconFont from "@/utils/iconFont";

let cx = classNames.bind(styles);

const {TextArea} = Input;
const {confirm} = Modal;
// 设置成中文显示
loader.config({'vs/nls': {availableLanguages: {'*': 'zh-cn'}}});

const CodeEditor = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const query = useSearchParams()
    const [openDrawer, setOpenDrawer] = useState(false)

    // const [lng, setLng] = useState('json')
    const {platFormTheme} = useSelector(state => state.system)
    // const {codeEditor} = useSelector(state => state.aiSpace)
    const codeEditorDbRef = useRef()
    const isUpdate = useRef(false)
    const editorRef = useRef(null);
    const inputRef = useRef(null);
    const openFileRef = useRef(null)
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const [inputDlg, setInputDlg] = useState({
        title: '',
        show: false
    })
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })
    const [files, setFiles] = useState([]);
    const [tabFiles, setTabFiles] = useState([]);
    const [chooseFile, setChooseFile] = useState(null);
    const lngOptions = [
        {
            "value": "apex",
            "label": "apex",
            "suffix": [".apex"]
        },
        {
            "value": "react",
            "label": "react",
            "suffix": [".jsx"]
        },
        {
            "value": "vue",
            "label": "vue",
            "suffix": [".vue"]
        },
        {
            "value": "azcli",
            "label": "azcli",
            "suffix": [".azcli"]
        },
        {
            "value": "bat",
            "label": "bat",
            "suffix": [".bat"]
        },
        {
            "value": "c",
            "label": "c",
            "suffix": [".c"]
        },
        {
            "value": "clojure",
            "label": "clojure",
            "suffix": [".clj", ".cljs", ".cljc"]
        },
        {
            "value": "coffeescript",
            "label": "coffeescript",
            "suffix": [".coffee", ".cf"]
        },
        {
            "value": "cpp",
            "label": "cpp",
            "suffix": [".cpp", ".cc", ".cxx", ".h", ".hpp"]
        },
        {
            "value": "csharp",
            "label": "csharp",
            "suffix": [".cs"]
        },
        {
            "value": "csp",
            "label": "csp",
            "suffix": [".csp"]
        },
        {
            "value": "css",
            "label": "css",
            "suffix": [".css"]
        },
        {
            "value": "dockerfile",
            "label": "dockerfile",
            "suffix": [".Dockerfile", ".dockerfile"]
        },
        {
            "value": "fsharp",
            "label": "fsharp",
            "suffix": [".fs", ".fsi", ".fsscript"]
        },
        {
            "value": "go",
            "label": "go",
            "suffix": [".go"]
        },
        {
            "value": "graphql",
            "label": "graphql",
            "suffix": [".graphql", ".gql"]
        },
        {
            "value": "handlebars",
            "label": "handlebars",
            "suffix": [".hbs", ".handlebars"]
        },
        {
            "value": "html",
            "label": "html",
            "suffix": [".html", ".htm"]
        },
        {
            "value": "ini",
            "label": "ini",
            "suffix": [".ini"]
        },
        {
            "value": "java",
            "label": "java",
            "suffix": [".java"]
        },
        {
            "value": "javascript",
            "label": "javascript",
            "suffix": [".js", ".jsx"]
        },
        {
            "value": "json",
            "label": "json",
            "suffix": [".json"]
        },
        {
            "value": "kotlin",
            "label": "kotlin",
            "suffix": [".kt", ".kts"]
        },
        {
            "value": "less",
            "label": "less",
            "suffix": [".less"]
        },
        {
            "value": "lua",
            "label": "lua",
            "suffix": [".lua"]
        },
        {
            "value": "markdown",
            "label": "markdown",
            "suffix": [".md", ".markdown"]
        },
        {
            "value": "msdax",
            "label": "msdax",
            "suffix": [".msdax"]
        },
        {
            "value": "mysql",
            "label": "mysql",
            "suffix": [".sql"]
        },
        {
            "value": "objective-c",
            "label": "objective-c",
            "suffix": [".m", ".h"]
        },
        {
            "value": "pascal",
            "label": "pascal",
            "suffix": [".pas", ".p"]
        },
        {
            "value": "perl",
            "label": "perl",
            "suffix": [".pl", ".pm"]
        },
        {
            "value": "pgsql",
            "label": "pgsql",
            "suffix": [".pgsql"]
        },
        {
            "value": "php",
            "label": "php",
            "suffix": [".php"]
        },
        {
            "value": "plaintext",
            "label": "plaintext",
            "suffix": [".txt"]
        },
        {
            "value": "postiats",
            "label": "postiats",
            "suffix": [".postiats"]
        },
        {
            "value": "powerquery",
            "label": "powerquery",
            "suffix": [".pq"]
        },
        {
            "value": "powershell",
            "label": "powershell",
            "suffix": [".ps1", ".psm1"]
        },
        {
            "value": "pug",
            "label": "pug",
            "suffix": [".pug"]
        },
        {
            "value": "python",
            "label": "python",
            "suffix": [".py"]
        },
        {
            "value": "r",
            "label": "r",
            "suffix": [".r", ".R"]
        },
        {
            "value": "razor",
            "label": "razor",
            "suffix": [".cshtml", ".razor"]
        },
        {
            "value": "redis",
            "label": "redis",
            "suffix": [".redis"]
        },
        {
            "value": "redshift",
            "label": "redshift",
            "suffix": [".redshift"]
        },
        {
            "value": "ruby",
            "label": "ruby",
            "suffix": [".rb"]
        },
        {
            "value": "rust",
            "label": "rust",
            "suffix": [".rs"]
        },
        {
            "value": "sb",
            "label": "sb",
            "suffix": [".sb"]
        },
        {
            "value": "scheme",
            "label": "scheme",
            "suffix": [".scm", ".sld"]
        },
        {
            "value": "scss",
            "label": "scss",
            "suffix": [".scss"]
        },
        {
            "value": "console",
            "label": "console",
            "suffix": [".sh", ".bash"]
        },
        {
            "value": "sol",
            "label": "sol",
            "suffix": [".sol"]
        },
        {
            "value": "sql",
            "label": "sql",
            "suffix": [".sql"]
        },
        {
            "value": "st",
            "label": "st",
            "suffix": [".st"]
        },
        {
            "value": "swift",
            "label": "swift",
            "suffix": [".swift"]
        },
        {
            "value": "tcl",
            "label": "tcl",
            "suffix": [".tcl"]
        },
        {
            "value": "typescript",
            "label": "typescript",
            "suffix": [".ts", ".tsx"]
        },
        {
            "value": "vb",
            "label": "vb",
            "suffix": [".vb"]
        },
        {
            "value": "xml",
            "label": "xml",
            "suffix": [".xml"]
        },
        {
            "value": "yaml",
            "label": "yaml",
            "suffix": [".yaml", ".yml"]
        }
    ]
    const [loading, setLoading] = useState(true)

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    // const {code, error, lng} = codeEditor

    useEffect(() => {
        const loadFiles = async () => {
            try {
                codeEditorDbRef.current = new CodeEditorDb()
                const fileList = await codeEditorDbRef.current.getAllSnippets();
                const tabList = await codeEditorDbRef.current.getAllTabs();
                console.log('----------useEffect----------', fileList);
                setFiles(fileList);

                // 如果有文件，设置第一个为活动文件
                if (fileList.length > 0) {
                    if (tabList.length > 0) {
                        const fs = fileList.filter(file => file.fileId === tabList[0].fileId)
                        if (fs.length > 0) {
                            setChooseFile(fs[0])
                        }
                    } else {
                        setChooseFile(fileList[0])
                    }
                    if (tabList.length > 0) {
                        setTabFiles(tabList)
                    } else {
                        setTabFiles([fileList[0]])
                        resetTabList([fileList[0]])
                    }
                }

            } catch (err) {
                console.log(`加载文件失败: ${err.message}`);
                console.error(err);
            } finally {
                setLoading(false)
            }
        };

        loadFiles();
        return () => {
            if (codeEditorDbRef.current) {
                codeEditorDbRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.setScrollTop(0);
            const fs = files.filter(f => f.fileId === chooseFile?.fileId)
            if (fs.length === 0) {

            } else {
                setChooseFile(fs[0])
                const ts = tabFiles.filter(f => f.fileId === chooseFile?.fileId)
                if (ts.length > 0) {
                    // setTabFiles(fs)
                } else {
                    setTabFiles([...tabFiles, ...fs])
                    resetTabList([...tabFiles, ...fs])
                }
            }
        }
    }, [chooseFile])

    async function resetTabList(list) {
        console.log('--------resetTabList-----------', list)
        await codeEditorDbRef.current.resetTabs(list);
    }

    function getFileExtension(filename) {
        // 使用 split('.') 将文件名分割成数组
        // 然后 pop() 获取最后一个元素（即文件后缀）
        if (!filename) {
            return ''
        }
        const extension = filename.split('.').pop();

        // 处理隐藏文件（如 .gitignore）和没有后缀的情况
        // 如果文件名以点开头或没有后缀，返回空字符串
        return filename.startsWith('.') || extension === filename
            ? ''
            : extension.toLowerCase();
    }

    async function createFile(fileName, fileContent = '') {
        const newFileId = Date.now(); // 使用时间戳作为唯一ID
        if (fileName) {
            const suffix = getFileExtension(fileName)
            console.log('------------- suffix =', suffix)
            let lng = []
            if (suffix) {
                lng = lngOptions.filter(f => f.suffix.includes(`.${suffix}`));
            }
            console.log('lng ===', lng)
            const newFile = {
                fileId: newFileId,
                fileName: fileName,
                fileContent: fileContent,
                language: lng.length > 0 ? lng[0].value : '', // 默认语言
            };
            await codeEditorDbRef.current.addSnippet(newFile)
            // 更新文件列表（添加到数组开头）
            setFiles(prev => [newFile, ...prev]);

            // 激活新创建的文件
            setChooseFile(newFile)
        } else {
            message.error("文件名不能为空")
        }
    }

    function onCreateFileOk(val) {
        if (val) {
            createFile(val)
        }
    }

    function getFileIcon(file) {
        let icon = <IconFont type={`icon-file`}/>
        const fileExtension = getFileExtension(file.fileName)
        if (fileExtension === 'txt') {
           return <IconFont type={`icon-txt`}/>
        }
        const fs = lngOptions.filter(f => f.suffix.includes(`.${fileExtension}`));
        if (fs.length > 0) {
            icon = <IconFont type={`icon-${fs[0].value}`}/>
        }
        return icon
    }

    function renderFiles() {
        if (loading) {
            return <div className={'flex items-center justify-center'}>
                <Loading/>
            </div>
        }
        if (files.length === 0) {
            return <div>
                <Empty/>
            </div>
        }
        return files.map((file, index) => {
            let icon = <IconFont type={`icon-file`}/>
            const fileExtension = getFileExtension(file.fileName)
            // console.log('fileExtension-------', fileExtension)
            if (fileExtension === 'txt') {
                icon = <IconFont type={`icon-txt`}/>
            }else{
                const fs = lngOptions.filter(f => f.suffix.includes(`.${fileExtension}`));
                // console.log('fs-------', fs)
                if (fs.length > 0) {
                    icon = <IconFont type={`icon-${fs[0].value}`}/>
                }
            }


            return <div className={classNames({
                'flex items-center gap-1 cursor-pointer p-1 rounded ': true,
                'text-[#666] dark:text-[#BFBFBF]': chooseFile?.fileId !== file.fileId,
                'bg-[#d4cef1] dark:bg-[#2E333D] text-[#333] dark:text-white': chooseFile?.fileId === file.fileId
            })} onClick={() => {
                setChooseFile(file)
                setOpenDrawer(false)
            }}>
                {icon}
                <span className={'text-sm line-clamp-1'}>{file.fileName}</span>
            </div>
        })
    }

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

    const onChange = (value) => {
        console.log(`selected ${value}`);
        dispatch(setCodeEditor({
            which: 'lng',
            lng: value
        }))
    };

    function detectTextLngAndSet(d) {
        try {
            const lng = detectLanguage(d)
            if (lng) {
                const fs = lngOptions.filter(f => f.value === lng)
                if (fs.length > 0) {
                    dispatch(setCodeEditor({
                        which: 'lng',
                        lng: lng
                    }))
                }
            }
        } catch (e) {
            console.log("报错：", e)
        }
    }

    function onChangeCode(e) {
        console.log('e=', e)
        if (codeEditorDbRef.current) {
            chooseFile.fileContent = e;
            setChooseFile(chooseFile)
            codeEditorDbRef.current.updateSnippet(chooseFile?.fileId, chooseFile)
        }
    }

    // 格式化json并去除转义字符串
    async function formatCode() {
        if (editorRef.current) {
            await editorRef.current.getAction('editor.action.formatDocument').run();
            editorRef.current.setScrollTop(0);
        }
    }

    const items = [
        {
            key: '0',
            label: '创建新文件',
            icon: <FileAddOutlined/>
        },
        {
            key: '1',
            label: '从我的文件选择',
            icon: <FolderOpenOutlined/>
        },
        {
            key: '2',
            label: '保存到我的文件',
            icon: <SaveOutlined/>
        },
        {
            key: '3',
            label: '打开',
            icon: <FolderOutlined/>
        },
        // {
        //     key: '33',
        //     label: '分割成左右面板',
        //     icon: <FolderOutlined/>
        // },
        {
            key: '4',
            label: '下载',
            icon: <DownloadOutlined/>
        },
        {
            key: '5',
            label: '格式化',
            icon: <ClearOutlined/>
        },
        {
            key: '7',
            label: '去除转义',
            icon: <BorderOutlined/>
        },
        {
            key: '8',
            label: '添加转义',
            icon: <BorderlessTableOutlined/>
        },
        // {
        //     key: '6',
        //     label: '清空',
        //     danger: true,
        //     icon: <DeleteOutlined/>
        // },
        {
            key: '66',
            label: '删除文件',
            danger: true,
            icon: <DeleteOutlined/>
        }
    ];

    function openFileFromMyFileSpace() {
        setSelectFileDlg({
            title: '请选择文件',
            show: true,
            onOk: async (d) => {
                console.log('d=', d)
                if (d?.url) {
                    openFileRef.current = d
                    fetch(encodeURI(d.url))
                        .then(response => {
                            if (!response.ok) {
                                message.error("网络返回出错")
                            }
                            // 检查Content-Type
                            const contentType = response.headers.get('Content-Type');
                            if (contentType.startsWith('text/') ||
                                contentType === 'application/json' ||
                                contentType === 'application/xml' ||
                                contentType === 'application/xhtml+xml' ||
                                contentType === 'application/x-javascript' ||
                                contentType === 'application/javascript' ||
                                contentType === 'application/x-sh' ||
                                contentType === 'application/x-httpd-php' ||
                                contentType === 'application/x-python-code' ||
                                contentType === 'application/x-perl' ||
                                contentType === 'application/x-ruby' ||
                                contentType === 'application/rtf' ||
                                contentType === 'application/octet-stream' ||
                                contentType === 'application/postscript') {
                                // 假定是文本内容
                                return response.text();
                            } else {
                                // 假定是二进制内容，例如Blob
                                return response.blob();
                            }
                        })
                        .then(res => {
                            console.log('setSelectFileDlg res-', res)
                            if (typeof res === 'string') {
                                // console.log('setSelectFileDlg res String-', res)
                                // dispatch(setCodeEditor({
                                //     which: 'code',
                                //     code: res
                                // }))
                                // detectTextLngAndSet(res)
                                createFile(d.name, res)
                            } else {
                                message.error("不支持此文件，请重新选择")
                            }
                        })
                        .catch(error => {
                            message.error("获取文件出错：" + error)
                        });
                }
            }
        })
    }

    function onMenuClick(key) {
        console.log('key=', key)
        setOpenDrawer(false)
        if (key === '0') {
            setInputDlg({
                title: '创建新文件',
                show: true
            })
        }
        if (key === '1') {
            openFileFromMyFileSpace()
        }
        if (key === '2') {
            if (chooseFile?.fileName) {
                const suffix = getFileExtension(chooseFile.fileName)
                setDlg({
                    type: 'saveAndRead',
                    title: '保存到我的文件',
                    show: true,
                    // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                    data: {
                        name: chooseFile.fileName,
                        suffix: suffix
                    },
                    onOk: async (d) => {
                        console.log('success d=', d)
                        if (d) {
                            const res = await dispatch(addFileForText({
                                fileName: d.fileName,
                                pid: d.pid,
                                fileType: 'code',
                                fileContent: chooseFile.fileContent,
                            }))
                            console.log('res=', res)
                            if (res?.payload?.status === 0 && res.payload?.data) {
                                message.success("添加成功")
                            } else {
                                message.error("添加失败")
                            }
                        }
                    }
                })
            } else {
                message.error("文件内容不能为空")
            }
        }
        if (key === '3') {
            if (inputRef.current) {
                inputRef.current.click();
            }
        }
        if (key === '4') {
            console.log('---------download-----------', chooseFile)
            if (chooseFile?.fileName) {
                // 创建一个 Blob 对象
                const blob = new Blob([chooseFile.fileContent], {type: 'text/plain'});
                // 创建一个临时的下载链接
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = chooseFile.fileName;
                // if (openFileRef.current) {
                //     a.download = openFileRef.current.name || 'myfile'
                // } else {
                //     const lng = detectLanguage(code)
                //     const fs = lngOptions.filter(f => f.value === lng)
                //     if (fs.length > 0) {
                //         a.download = 'myFile' + fs[0].suffix[0];
                //     } else {
                //         a.download = 'myFile'
                //     }
                // }
                // 触发下载
                a.click();
                // 释放 URL 对象
                URL.revokeObjectURL(url);
            } else {
                message.warning('请先选择文件');
            }
        }
        if (key === '5') {
            formatCode()
        }
        if (key === '6') {
            dispatch(setCodeEditor({
                which: 'code',
                code: ''
            }))
        }
        if (key === '66') {
            if (chooseFile?.fileName) {
                confirm({
                    title: `您确定要删除？`,
                    okText: '确定',
                    cancelText: '取消',
                    onOk: async () => {
                        // 1、删除files
                        // 2、删除tabFiles
                        // 3、设置chooseFile
                        // 4、删除indexeddb
                        try {
                            const fileId = chooseFile.fileId
                            const fs = files.filter(f => f.fileId !== fileId)
                            const ts = tabFiles.filter(f => f.fileId !== fileId)
                            setFiles(fs)
                            setTabFiles(ts)
                            resetTabList(ts)
                            if (fs.length > 0) {
                                const ss = ts.filter(f => f.fileId === fs[0].fileId)
                                setChooseFile(fs[0])
                                if (ss.length === 0) {
                                    setTabFiles([...[fs[0]], ...ts])
                                    resetTabList([...[fs[0]], ...ts])
                                } else {

                                }
                            }
                            if (codeEditorDbRef.current) {
                                codeEditorDbRef.current.deleteSnippetByFileId(fileId)
                            }
                            message.success('删除成功');
                        } catch (e) {
                            message.error("删除失败")
                        }
                    }
                });
            } else {
                message.warning('请先选择文件');
            }

        }
        if (key === '7') {
            try {
                if (chooseFile.fileContent) {
                    const unescapedCode = chooseFile.fileContent.replace(/\\"/g, '"');
                    console.log('----unescapedCode-----', unescapedCode)
                    editorRef.current.setValue(unescapedCode);
                    onChangeCode(unescapedCode)
                }
            } catch (e) {
                console.error('报错：', e)
            }
        }
        if (key === '8') {
            try {
                if (chooseFile.fileContent) {
                    const escapedCode = chooseFile.fileContent.replace(/"/g, '\\"');
                    console.log('----unescapedCode-----', escapedCode)

                    editorRef.current.setValue(escapedCode);
                    onChangeCode(escapedCode)
                }
            } catch (e) {
                console.error('报错：', e)
            }
        }
    }

    const isCodeFile = (file) => {
        // 常见代码文件扩展名
        const codeExtensions = [
            '.log',
            ".cls", ".trigger",
            ".azcli",
            ".bat",
            ".c",
            ".clj", ".cljs", ".cljc", ".cljx",
            ".coffee", ".cson",
            ".cpp", ".cc", ".cxx", ".h", ".hpp",
            ".cs",
            ".csp",
            ".css",
            ".Dockerfile", "Dockerfile",
            ".fs", ".fsx", ".fsi",
            ".go",
            ".graphql", ".gql",
            ".hbs", ".handlebars",
            ".html", ".htm",
            ".ini",
            ".java",
            ".js", ".mjs", ".jsx",
            ".json",
            ".kt", ".kts",
            ".less",
            ".lua",
            ".md", ".markdown",
            ".msdax",
            ".sql",
            ".m", ".h",
            ".pas", ".pp",
            ".pl", ".pm",
            ".pgsql", ".p",
            ".php",
            ".txt",
            ".postiats",
            ".pq",
            ".ps1", ".psd1", ".psm1",
            ".pug", ".jade",
            ".py",
            ".r", ".rmd",
            ".cshtml", ".vbhtml",
            ".redis",
            ".sql",
            ".rb",
            ".rs",
            ".sb",
            ".scm", ".ss",
            ".scss",
            ".sh", ".bash",
            ".sol",
            ".sql",
            ".st",
            ".swift",
            ".tcl",
            ".ts", ".tsx",
            ".vb",
            ".xml",
            ".yaml",
            ".js",
            ".jsx",
            ".vue",
            ".bpmn",
            ".excalidraw",
        ]

        const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

        const fs = lngOptions.filter(f => f.suffix.includes(fileExtension))
        // console.log('fs-', fs)
        if (fs.length > 0) {
            dispatch(setCodeEditor({
                which: 'lng',
                lng: fs[0].value
            }))
        }
        return codeExtensions.includes(fileExtension);
    };

    function detectLanguage(code) {
        // 使用 highlight.js 检测语言
        return hljs.highlightAuto(code).language;
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (e.target.files.length > 0) {
            e.target.value = '';
        }
        console.log('-------------------handleFileChange=', file);
        if (file) {
            if (!isCodeFile(file)) {
                message.error('不支持此文件，请重新上传');
                return;
            }
            openFileRef.current = file
            // console.log('File :', file);
            try {
                const reader = new FileReader();

                reader.onload = function (event) {
                    try {
                        const fileContent = event.target.result;
                        createFile(file.name, fileContent)
                    } catch (e) {
                        message.error('读取文件出错');
                    }
                };
                reader.readAsText(file);
            } catch (e) {
                message.error('读取文件出错');
            }

        }
    };

    function renderLeft() {
        return <div className={'flex flex-col h-full'}>
            <div
                className={'flex items-center justify-between p-3 w-full border-b border-[#ddd] dark:border-[#474747] shrink-0'}>
                <span className={'font-medium text-md'}>文件列表</span>
                <Dropdown
                    placement={'bottomRight'}
                    menu={{
                        items,
                        onClick: ({key}) => onMenuClick(key),
                    }}>
                    <div className={'text-sm cursor-pointer flex items-center gap-1'}>
                        <CaretDownOutlined/>
                    </div>
                </Dropdown>
            </div>
            <div className={'w-full p-2 overflow-y-auto flex-1'}>
                {renderFiles()}
            </div>
        </div>
    }

    return <div className={cx({
        'flex flex-col h-[100vh]': true,
        'container': true,
    })} onClick={globalUpdate}>
        <div className={'h-[100vh] overflow-hidden w-full flex items-start flex-row'}>
            <div
                className={'flex items-start flex-col border-r border-[#ddd] dark:border-[#474747]  w-[250px] hidden lg:block h-full'}>
                {renderLeft()}
            </div>
            <div className={'lg:w-[calc(100%-250px)] w-full flex'}>
                <div className={'flex flex-col w-full'}>
                    {
                        files.length !== 0 && tabFiles.length !== 0 ? <div className={'p-1 flex items-center gap-2'}>
                            <Tabs
                                tabBarExtraContent={{
                                    left:<div className={'lg:hidden cursor-pointer py-1 px-2'} onClick={() => {
                                        setOpenDrawer(true)
                                    }}>
                                        <PicLeftOutlined/>
                                    </div>
                                }}
                                rootClassName={'w-full'}
                                type="editable-card"
                                hideAdd
                                onChange={(key) => {
                                    console.log('key', key);
                                    const fs = files.filter(f => f.fileId === key);
                                    setChooseFile(fs[0]);
                                }}
                                activeKey={chooseFile?.fileId}
                                onEdit={(targetKey, action) => {
                                    const newArray = tabFiles.filter(item => item.fileId !== targetKey);

                                    if (tabFiles.length === 1) {
                                        setChooseFile(null)
                                    } else {
                                        setChooseFile(newArray[0]);
                                    }
                                    setTabFiles(newArray);
                                    resetTabList(newArray)
                                }}
                                items={tabFiles?.map(f => {
                                    return {
                                        label: f.fileName,
                                        key: f.fileId,
                                        icon: getFileIcon(f)
                                    }
                                })}
                            />
                        </div> : null
                    }
                    <div style={{display: files.length !== 0 && tabFiles.length !== 0 ? 'block' : 'none'}}>
                        <Editor
                            height={'calc(100vh - 50px)'}
                            onMount={handleEditorDidMount}
                            loading={'正在加载，请稍候...'}
                            language={chooseFile?.language || ''}
                            onChange={onChangeCode}
                            value={chooseFile?.fileContent || ''}
                            theme={platFormTheme.background === 'light' ? 'light' : 'vs-dark'}/>
                    </div>

                    {
                        files.length === 0 || tabFiles.length === 0 ?
                            <div className={'h-[calc(100vh-64px)] flex items-start pl-5 pt-3 w-full'}>
                                <div className={'flex flex-col gap-1'}>
                                    <div className={'font-bold text-2xl pb-5'}>代码编辑器</div>
                                    <div className={' text-xl pb-2'}>开始</div>
                                    <div className={'flex gap-1 cursor-pointer text-[#54458a] font-medium'}
                                         onClick={() => {
                                             setInputDlg({
                                                 title: '创建新文件',
                                                 show: true
                                             })
                                         }}><FileAddOutlined/>创建新文件
                                    </div>
                                    <div className={'flex gap-1 cursor-pointer text-[#54458a] font-medium'}
                                         onClick={() => {
                                             openFileFromMyFileSpace()
                                         }}><FolderOpenOutlined/>从我的文件选择
                                    </div>
                                    <div className={'flex gap-1 cursor-pointer text-[#54458a] font-medium'}
                                         onClick={() => {
                                             if (inputRef.current) {
                                                 inputRef.current.click();
                                             }
                                         }}><FolderOutlined/>打开本地文件
                                    </div>
                                </div>
                            </div> : null
                    }

                </div>
            </div>
        </div>

        <input
            type="file"
            ref={inputRef}
            style={{display: 'none'}}
            onChange={handleFileChange}
        />
        <SaveFileDlg dlg={dlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>
        <InputDlg dlg={inputDlg} onOk={onCreateFileOk}/>
        <Drawer className={cx({
            container: true
        })} width={375} placement={'left'} onClose={() => setOpenDrawer(false)} closable={false} open={openDrawer}
                styles={{
                    body: {
                        padding: '0',
                    },
                }}>
            {renderLeft()}
        </Drawer>
    </div>
};

export default withRouter(CodeEditor);
