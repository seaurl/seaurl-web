'use client'
import {useCallback, useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Button, Dropdown, Input, message} from "antd";
import {
    CaretDownOutlined,
    ClearOutlined,
    CloseCircleOutlined,
    CloseOutlined, DownloadOutlined,
    EditOutlined,
    FolderOpenOutlined, FolderOutlined, FormatPainterOutlined, FormOutlined,
    PlusOutlined,
    SaveOutlined
} from "@ant-design/icons";
import IconFont from "@/utils/iconFont";
import {evaluate, format} from 'mathjs';
import NoteCreateForAiDlg from "@/components/dialog/noteCreateForAiDlg";
import {queryUserAiTools, updateDt, setResult, setInput, setEnd, setCalculatorNote} from "@/lib/slices/aiSpaceSlice";
import _ from "lodash";
import {marked} from "marked";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import {
    Alignment,
    Autosave,
    BlockQuote,
    Bold,
    ClassicEditor,
    Code,
    CodeBlock,
    Essentials,
    FontBackgroundColor,
    FontColor,
    FontSize,
    Heading,
    Image,
    ImageCaption, ImageResize,
    ImageStyle,
    ImageToolbar, ImageUpload,
    Indent,
    Italic,
    Link, List,
    MediaEmbed,
    Mention,
    Paragraph,
    SimpleUploadAdapter,
    Strikethrough,
    Subscript,
    Table,
    TableToolbar,
    TodoList,
    Underline,
    Undo
} from "ckeditor5";
import translations from 'ckeditor5/translations/zh-cn.js';
import 'ckeditor5/ckeditor5.css';
import cns from "classnames/bind";
import styles from "@/components/noteSpace/noteEditor/index.module.scss";
import SelectNoteDlg from "@/components/dialog/selectNoteDlg";
import {getNoteById} from "@/lib/slices/noteSpaceSlice";
import './ckeditorDark.css'
let cx = cns.bind(styles);

const {TextArea} = Input;

const Calculator = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const query = useSearchParams()
    const [isUpdate, setUpdate] = useState(false)
    const {platFormTheme} = useSelector(state => state.system)

    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })

    const {calculator} = useSelector(state => state.aiSpace)
    const {result, input, isEnd, note} = calculator
    const [selectNoteDlg, setSelectNoteDlg] = useState({
        title: '',
        show: false
    })
    const abortControllerRef = useRef(null)

    useEffect(() => {
        // init()
        return () => {
            setUpdate(false)
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
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

    // 替换，如：console.log(replaceSecondNumberAfterOperator("3.14e+10-10", "444"));// "3.14e+10-444"
    function replaceNumberAfterOperator(expression, replacement) {
        // 使用正则表达式匹配基本运算符后的第二个数字
        const regex = /([-+*/])(?:(?![eE][-+])\d*\.?\d+(?:[eE][-+]?\d+)?)(?!.*[-+*/])/g;
        // 使用 replace 方法，通过回调函数替换数字
        const result = expression.replace(regex, function (match, operator) {
            // 替换数字为 replacement
            return operator + replacement;
        });
        return result;
    }


    function onClickBtn(type) {
        console.log('type=', type)
        // 判断是否向前删除，如果是则向前减掉一个字符
        if (type === 'stepDelete') {
            if (result && result !== '0' && !result.includes('e')) {

                const _r1 = result.slice(0, -1)
                const _r2 = input.slice(0, -1)
                console.log('_r1=', _r1)
                console.log('_r2=', _r2)

                if (_r1) {
                    dispatch(setResult(_r1))
                } else {
                    dispatch(setResult('0'))
                }


                // 判断前一个字符是否是基本运算符，如果是，则连接一个默认值0，否则正常连接
                // 比如：12*1，12*(这里我们就要改成12*0)
                if (_r2) {
                    if (['/', '*', '-', '+'].includes(_r2[_r2.length - 1])) {
                        dispatch(setInput(_r2 + '0'))
                    } else {
                        dispatch(setInput(_r2))
                    }
                } else {
                    dispatch(setInput('0'))
                }
            }
            return
        }
        // 判断是否是%，如果是则通过format计算
        if (type === '%') {
            const _r = format(result / 100, {precision: 14});
            dispatch(setResult(_r))
            if (/[+\-*/]/.test(input)) {
                dispatch(setInput(replaceNumberAfterOperator(input, _r)))
            } else {
                dispatch(setInput(_r))
            }
            return
        }

        // 如果是清除，则设置默认值
        if (type === 'clear') {
            dispatch(setResult('0'))
            dispatch(setInput('0'))
        }

        const preStrInput = input[input.length - 1]
        const preStrResult = input[result.length - 1]
        // 如果输入的是数字
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(type)) {

            console.log('result aa=', result)
            console.log('input aa=', input)
            if (input) {
                // 三种特殊情况1、初始值是0，2、是否已经完成结果运算
                if (input === '0' || isEnd) {
                    dispatch(setResult(type))
                    dispatch(setInput(type))
                } else {
                    if (preStrInput && ['/', '*', '-', '+'].includes(preStrInput)) {
                        dispatch(setResult(type))
                        dispatch(setInput(input + type))
                    } else {
                        // 判断是否变成科学计数
                        if (result.includes('e')) {
                            dispatch(setInput(type))
                            dispatch(setResult(type))
                        } else {
                            // 如果result前一个字符是0，则当前字符替换这个0
                            if (result.length === 1 && result[0] === '0') {
                                const _r1 = result.slice(0, -1)
                                const _r2 = input.slice(0, -1)

                                dispatch(setResult(_r1 + type))
                                dispatch(setInput(_r2 + type))
                            } else {
                                dispatch(setInput(input + type))
                                dispatch(setResult(result + type))
                            }

                        }

                    }
                }

            }
        }
        // 如果输入的是运算符
        else if (['/', '*', '-', '+'].includes(type)) {
            // 如果前一个字符已经包含了运算符，则将前一个运算符替换成最新的，
            if (['/', '*', '-', '+'].includes(preStrInput)) {
                dispatch(setInput(input.slice(0, -1) + type))
            } else {
                // 如果包含，则直接计算结果，并连接
                if (/[+\-*/]/.test(input)) {
                    const evalResult = evaluate(input);
                    const formattedResult = format(evalResult, {precision: 14});
                    dispatch(setResult(formattedResult))
                    dispatch(setInput(formattedResult + type))
                    dispatch(setEnd(true))
                } else {
                    dispatch(setInput(input + type))
                }
            }

        }
        // 如果输入的是小数点
        else if (type === '.') {
            // 判断是否结束
            if (isEnd) {
                dispatch(setResult('0' + type))
                dispatch(setInput('0' + type))
            }
            // 判断前一个字符是否是运算符，如果是，则可以前缀用0
            else if (/[+\-*/]/.test(preStrInput)) {
                dispatch(setResult('0' + type))
                dispatch(setInput(input + '0' + type))
            }
            // 判断显示的时候是否含有小数，如果否，则连接字符，否则不连接
            else if (!result.includes('.')) {
                dispatch(setResult(result + type))
                dispatch(setInput(input + type))
            }
        }
        // 判断是否是等于字符
        if (type === '=') {
            // 设置全局为true
            dispatch(setEnd(true))
            try {
                // 计算结果
                const evalResult = evaluate(input);
                const formattedResult = format(evalResult, {precision: 14});
                dispatch(setResult(formattedResult))
                dispatch(setInput(formattedResult))
            } catch (e) {
                // setResult('Error');
                // setInput('0')
            }
        } else {
            dispatch(setEnd(false))
        }
    }

    function onSave() {
        if (note.trim()) {
            setDlg({
                title: '添加到我的笔记',
                show: true,
                input: '',
                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                message: note
            })
        } else {
            message.warning('请先输入内容');
        }

    }

    function onChangeNote(e) {
        console.log('e=', e.target.value)
        dispatch(setCalculatorNote(e.target.value))
    }

    const items = [
        {
            key: '1',
            label: '从我的笔记选择',
            icon: <FormOutlined />
        },
        {
            key: '2',
            label: '保存到我的笔记',
            icon: <SaveOutlined/>
        }
    ];

    function onMenuClick(key) {
        if (key === '1'){
            setSelectNoteDlg({
                title: '请选择笔记',
                show: true,
                onOk: async (d) => {
                    console.log('d=', d)
                    if (d?.key) {
                        if (abortControllerRef.current?.abort) {
                            abortControllerRef.current.abort();
                        }

                        // 创建新的 AbortController
                        abortControllerRef.current = new AbortController();

                        const res = await dispatch(getNoteById({
                            noteId: d?.key,
                            abortController: abortControllerRef.current
                        }))
                        console.log('res=', res)
                        if (res.payload.status === 0){
                            const content = res.payload.data.content
                            dispatch(setCalculatorNote(content))
                        }
                    }
                }
            })
        }
        if (key === '2'){
            onSave()
        }
    }

    const calculatorNote = useCallback(_.debounce((data) => {
        dispatch(setCalculatorNote(data))
    }, 3000), [])

    return <div className={'flex flex-col lg:flex-row h-[100vh] overflow-y-auto'} onClick={globalUpdate}>
        <div
            className={'w-full lg:max-w-sm lg:h-[100vh] border-r border-[#ddd] dark:border-[#474747] px-4  bg-[#eee] dark:bg-[#141414] shrink-0 relative'}>
            <div className={'flex flex-col w-full gap-[4px] py-4'}>
                <div className={'w-full flex flex-col flex-wrap px-4 py-6 gap-[1px] rounded-md bg-[#424548]'}>
                    <div
                        className={'w-full flex justify-end text-4xl shrink-0 text-white gap-[8px] break-all select-none'}>
                        {result}
                    </div>
                </div>
                <div className={'flex items-center justify-center gap-[4px] w-full'}>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-2xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('clear')}>C
                    </div>

                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-2xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('%')}>%
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('stepDelete')}>
                        <IconFont type="icon-jisuanqishanchu"/>
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#FF9F0D] rounded-md text-4xl cursor-pointer active:bg-[#CB7E02] select-none'}
                        onClick={() => onClickBtn('/')}>÷
                    </div>
                </div>
                <div className={'flex items-center justify-center gap-[4px] w-full'}>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('7')}>7
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('8')}>8
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('9')}>9
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#FF9F0D] rounded-md text-4xl cursor-pointer active:bg-[#CB7E02] select-none'}
                        onClick={() => onClickBtn('*')}>×
                    </div>
                </div>
                <div className={'flex items-center justify-center gap-[4px]  w-full'}>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('4')}>4
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('5')}>5
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('6')}>6
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#FF9F0D] rounded-md text-5xl cursor-pointer active:bg-[#CB7E02] select-none'}
                        onClick={() => onClickBtn('-')}>-
                    </div>
                </div>
                <div className={'flex items-center justify-center gap-[4px]  w-full flex-1'}>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('1')}>1
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('2')}>2
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('3')}>3
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#FF9F0D] rounded-md text-4xl cursor-pointer active:bg-[#CB7E02] select-none'}
                        onClick={() => onClickBtn('+')}>+
                    </div>
                </div>
                <div className={'flex items-center justify-center gap-[4px]  w-full flex-1'}>
                    <div
                        className={'w-2/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('0')}>0
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#7D7E80] rounded-md text-4xl cursor-pointer active:bg-[#B1B1B4] select-none'}
                        onClick={() => onClickBtn('.')}>·
                    </div>
                    <div
                        className={'w-1/4 h-16 text-white flex items-center justify-center bg-[#FF9F0D] rounded-md text-4xl cursor-pointer active:bg-[#CB7E02] select-none'}
                        onClick={() => onClickBtn('=')}>=
                    </div>
                </div>
            </div>
            {/*<div className={'absolute bottom-4 left-4 right-4'}>*/}
            {/*    <Button block>添加/复制笔记</Button>*/}
            {/*</div>*/}
        </div>
        <div className={'w-full h-full flex flex-col '}>
            <div className={'flex items-center justify-between px-3 py-2 gap-4 border-b border-[#ddd] dark:border-[#474747]'}>

                <Dropdown
                    menu={{
                        items,
                        onClick: ({key}) => onMenuClick(key),
                    }}>
                    <div className={'font-medium text-sm flex items-center gap-1 cursor-pointer'}><FormOutlined />我的笔记<CaretDownOutlined/></div>
                </Dropdown>
                {/*<Button type={'primary'} icon={<PlusOutlined/>} onClick={onSave}>保存到笔记</Button>*/}
            </div>
            <div className={'flex h-full '}>
                {/*<TextArea placeholder="请输入文字" variant={'borderless'} value={note} allowClear onChange={(e) => onChangeNote(e)}*/}
                {/*          style={{height: '100%', fontSize: '16px', resize: 'none'}}/>*/}
                <div className={cx({
                    'vditor': true,
                    'darkEditor': platFormTheme.background !== 'light'
                })}>
                    <CKEditor
                        editor={ClassicEditor}
                        data={note || ''}
                        config={{
                            translations,
                            language: 'zh-cn', // 设置语言为中文
                            simpleUpload: {
                                uploadUrl: `${process.env.NEXT_PUBLIC_API_HOST}/space/info/note/editor/upload/image`
                            },
                            link: {
                                addTargetToExternalLinks: true,
                                defaultProtocol: 'https://',
                            },
                            image: {
                                toolbar: [
                                    'imageStyle:inline',
                                    'imageStyle:block',
                                    'imageStyle:side',
                                    '|',
                                    'toggleImageCaption',
                                    'imageTextAlternative',
                                ],
                            },
                            toolbar: {
                                items: ['heading',
                                    '|',
                                    'fontSize',
                                    'bold',
                                    'italic',
                                    'underline',
                                    'strikethrough',
                                    'link',
                                    'blockQuote',
                                    'fontColor',
                                    'fontBackgroundColor',
                                    'subscript',
                                    'bulletedList',
                                    'numberedList',
                                    'alignment',
                                    'todoList',
                                    'outdent',
                                    'indent',
                                    'code',
                                    'codeBlock',
                                    'insertTable',
                                    'uploadImage',
                                    'mediaEmbed',
                                    'undo',
                                    'redo'],
                            },
                            plugins: [
                                SimpleUploadAdapter,
                                Autosave,
                                Bold,
                                Essentials,
                                Italic,
                                Mention,
                                Paragraph,
                                Undo,
                                Heading,
                                FontSize,
                                Underline,
                                Strikethrough,
                                Link, BlockQuote,
                                FontColor,
                                FontBackgroundColor,
                                Subscript,
                                Alignment,
                                TodoList,
                                Indent,
                                Code,
                                CodeBlock,
                                Table,
                                TableToolbar,
                                MediaEmbed,
                                Image,
                                ImageCaption,
                                ImageStyle,
                                ImageToolbar,
                                ImageUpload,
                                ImageResize,
                                List,
                            ],
                            licenseKey: 'GPL',
                            mention: {
                                // Mention configuration
                            },
                            // initialData: note,
                        }}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            console.log({event, editor, data});
                            calculatorNote(data)
                        }}
                        onBlur={(event, editor) => {
                            console.log('Blur.editor', editor);
                            const data = editor.getData();
                            dispatch(setCalculatorNote(data))
                        }}
                    />
                </div>

            </div>

            {/*<Button type={'primary'} icon={<PlusOutlined />} size={'large'}>创建新笔记</Button>*/}
        </div>
        <NoteCreateForAiDlg dlg={dlg}/>
        <SelectNoteDlg dlg={selectNoteDlg}/>

    </div>
};

export default withRouter(Calculator);