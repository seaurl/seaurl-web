'use client'
import {Button, Input, message} from "antd";
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {CKEditor} from '@ckeditor/ckeditor5-react';
import translations from 'ckeditor5/translations/zh-cn.js';
import {useDispatch, useSelector} from "react-redux";
import {
    addNote,
    editNoteContent,
    editNoteTitle,
    getMyRecentlyNotes,
    getNoteById,
    getNoteListByCategoryId,
    setNoteTitle, setOpenNoteListMobileDrawer
} from "@/lib/slices/noteSpaceSlice";
import cns from "classnames/bind";
import styles from './index.module.scss'
import './ckeditorDark.css'
import {MenuFoldOutlined, MenuOutlined} from "@ant-design/icons";
import {useSearchParams} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
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
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    Italic,
    Link,
    List,
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
    Undo,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import Loading from "@/components/loading";

let cx = cns.bind(styles);
const NoteEditor = ({userInfo, onOpenDrawer}) => {
    const dispatch = useDispatch();
    const {notes, loadingNotes, openNoteListMobileDrawer} = useSelector(state => state.noteSpace)

    // const [note, setNote] = useState({
    //     id: '',
    //     title: '',
    //     content: ''
    // })
    const {platFormTheme, isMobile} = useSelector(state => state.system)
    const query = useSearchParams()

    const [title, setTitle] = useState('');
    // const [content, setContent] = useState('')
    const [noteContent, setNoteContent] = useState('')

    // const contentRef = useRef('')
    // const titleRef = useRef('')
    const noteRef = useRef(null)
    const editorRef = useRef(null)

    const loadingNoteRef = useRef(false)
    const abortControllerRef = useRef(null)
    const abortControllerRef2 = useRef(null)

    useEffect(() => {

        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

    useLayoutEffect(() => {
        // console.log('进来了1-----------------------', contentRef.current)
        console.log('进来了2-----------------------', query.get('nid'))
        // if (contentRef.current.trim()){
        //     submitContent(query.get('nid'), contentRef.current)
        // }
        getNodeDetail()
    }, [query.get('nid')])

    useEffect(() => {
        if (notes?.length === 0) {
            console.log('=======clear note=======')
            // titleRef.current = ''
            setTitle('')
            // contentRef.current = ''
            noteRef.current = {
                id: '',
                title: '',
                content: ''
            }
            setNoteContent('')
            // setNote({
            //     id: '',
            //     title: '',
            //     content: ''
            // })
        }
    }, [notes])

    // 查询笔记详情
    async function getNodeDetail() {
        if (query.get('nid')) {
            loadingNoteRef.current = true

            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }

            // 创建新的 AbortController
            abortControllerRef.current = new AbortController();
            const res = await dispatch(getNoteById({
                noteId: query.get('nid'),
                abortController: abortControllerRef.current
            }))
            console.log('get note res =', res)
            if (res.payload?.data) {
                setTitle(res.payload?.data?.title || '')
                // setContent(res.payload?.data?.content || '')

                // titleRef.current = res.payload?.data?.title || ''
                // contentRef.current = res.payload?.data?.content || ''

                noteRef.current = res?.payload?.data
                // setNote(res.payload?.data || {})
                setNoteContent(res?.payload?.data?.content || '')
                // if (editorRef.current) {
                //     console.log('==== setNote =====', editorRef.current, res.payload?.data)
                //     alert(res?.payload?.data?.content)
                //     editorRef.current.setData(res?.payload?.data?.content || '');
                // }else{
                //     console.log('==== setNote  fail=====')
                // }


            } else {
                // titleRef.current = ''
                setTitle('')
                // contentRef.current = ''
                noteRef.current = {
                    id: '',
                    title: '',
                    content: ''
                }
                // setNote({
                //     id: '',
                //     title: '',
                //     content: ''
                // })
                setNoteContent('')
                // if (editorRef.current) {
                //     editorRef.current.setData('');
                //     console.log('==== clear  note content=====')
                // }

            }
            loadingNoteRef.current = false
        }
    }

    // function queryNotes() {
    //     if (query.get('cid')) {
    //         dispatch(getNoteListByCategoryId({
    //             categoryId: query.get('cid')
    //         }))
    //     } else {
    //         dispatch(getMyRecentlyNotes())
    //     }
    // }

    function changeTitle(e) {
        console.log('e---', e.target.value)
        setTitle(e.target.value)
        // titleRef.current = e.target.value
    }

    async function submitTitle() {
        if (title) {
            if (noteRef.current.title === title) {
                // 标题不变不做处理
            } else {
                const res = await dispatch(editNoteTitle({
                    noteId: noteRef.current?.id,
                    title: title
                }))
                if (res.payload.status === 0) {
                    dispatch(setNoteTitle({
                        nid: query.get('nid'),
                        title: title
                    }))

                } else {
                    message.warning(res.payload.message)
                }
            }

        } else {
            message.info('标题不能为空');
            setTitle('无标题')
            // titleRef.current = '无标题'
        }
    }

    async function submitContent(routeNoteId, changeNoteContent) {
        console.log('submitContent routeNoteId =', routeNoteId)
        // console.log('submitContent noteId =', noteId)
        // console.log('submitContent newContent =', newContent)
        // const noteContent = noteRef.current.content
        // const noteContent = note?.content || ''
        // console.log('submitContent note =', noteContent)

        if (routeNoteId === noteRef.current?.id) {
            console.log('notes -----------------', notes)
            // const fs = notes.filter(f => f.id === routeNoteId)
            // console.log('fs -----------------', fs)
            console.log('变化了，我保存了')
            const res = await dispatch(editNoteContent({
                noteId: routeNoteId,
                content: changeNoteContent
            }))
            console.log('--- change note content is --- ', res)
            if (res.payload.status === 0) {
                noteRef.current = res.payload.data
                // setNoteContent(res?.payload?.data?.content)
                // setNote(res.payload.data)
                // if (noteId === query.get('nid')){
                //     contentRef.current = res.payload.data.content
                // }
            } else {
                if (res.payload.status === 20034){
                    //数据相同不用保存
                }else{
                    message.warning(res.payload.message)
                }
            }
        } else {
            console.log('我没有保存')
        }
    }

    async function btnAdd() {
        const cid = query.get('cid')
        let vid = query.get('vid')
        if (cid) {
            await dispatch(addNote({
                title: '无标题',
                categoryId: cid
            }))

            if (abortControllerRef2.current?.abort) {
                abortControllerRef2.current.abort();
            }
            // 创建新的 AbortController
            abortControllerRef2.current = new AbortController();


            const res = await dispatch(getNoteListByCategoryId({
                categoryId: query.get('cid'),
                abortController: abortControllerRef2.current
            }))
            console.log('queryNotes res=', res)
            if (res.payload.status === 0 && res.payload.data.length > 0) {
                const nid = res.payload.data[0].id
                console.log('call=', nid)
                if (nid) {
                    let params = []
                    if (cid) {
                        params.push(`cid=${cid}`)
                    }
                    if (vid) {
                        params.push(`vid=${vid}`)
                    }
                    if (nid) {
                        params.push(`nid=${nid}`)
                    }
                    // router.replace(`/noteSpace?${params.join('&')}`)
                    shallowUpdateRouterParams(params.join('&'))
                }
            }

        } else {
            message.warning('请先选择笔记分类');
        }
    }


    function renderMe() {
        if (loadingNoteRef.current) {
            return <div className={'flex items-center justify-center w-full h-full'}>
                <Loading/>
            </div>
        }

        if (notes?.length === 0 || loadingNoteRef.current) {
            return <div className={'flex items-center justify-center h-screen gap-2'}>
                <div className={'block md:hidden'}>
                    <div
                        className={'flex md:hidden items-center justify-center hover:bg-[#eee] dark:hover:bg-[#2E333C] shrink-0 w-[36px] h-[36px] rounded-full cursor-pointer'}
                        onClick={() => {
                            dispatch(setOpenNoteListMobileDrawer(!openNoteListMobileDrawer))
                        }}>
                        {/*<Button size={'small'} icon={<MenuFoldOutlined className={'text-xl cursor-pointer'}/>}*/}
                        {/*        onClick={() => {*/}
                        {/*            if (onOpenDrawer) {*/}
                        {/*                onOpenDrawer()*/}
                        {/*            }*/}
                        {/*        }}/>*/}
                        <MenuOutlined/>
                    </div>
                </div>
                <div className={'inline-block text-[#333] dark:text-white text-xl font-bold'}>请先选择笔记，或者<span
                    className={'text-[#54458a] cursor-pointer hover:underline'}
                    onClick={btnAdd}>创建</span>新笔记
                </div>
            </div>
        }

        return <div className={cx({
            'w-full overflow-hidden': true
        })}>
            <div
                className={'h-[59px] flex items-center justify-center pl-2'}>
                <div
                    className={'flex md:hidden items-center justify-center hover:bg-[#eee] dark:hover:bg-[#2E333C] shrink-0 w-[36px] h-[36px] rounded-full cursor-pointer'}
                    onClick={() => {
                        dispatch(setOpenNoteListMobileDrawer(!openNoteListMobileDrawer))
                    }}>
                    {/*<Button size={'small'} icon={<MenuFoldOutlined className={'text-xl cursor-pointer'}/>}*/}
                    {/*        onClick={() => {*/}
                    {/*            if (onOpenDrawer) {*/}
                    {/*                onOpenDrawer()*/}
                    {/*            }*/}
                    {/*        }}/>*/}
                    <MenuOutlined/>
                </div>
                <Input size={"large"} variant={'borderless'} style={{fontSize: '22px'}} onChange={changeTitle}
                       onBlur={submitTitle}
                       value={title}/>
            </div>
            {/*<div id="vditor"  className={styles.vditor} />*/}
            <div className={cx({
                'border-t border-[#ddd] dark:border-[#474747]': true,
                'vditor': true,
                'darkEditor': platFormTheme.background !== 'light'
            })}>
                <CKEditor
                    id={query.get('nid')}
                    editor={ClassicEditor}
                    data={noteContent}
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
                        // 自动保存
                        // autosave: {
                        //     save( editor ) {
                        //         const urlParams = new URLSearchParams(window.location.search);
                        //         const nid = urlParams.get('nid');
                        //         return submitContent(nid, editor.getData());
                        //     }
                        // },
                        // initialData: contentRef.current,
                    }}
                    onReady={theEditor => {
                        console.log('-------------------------------')
                        // You can store the "editor" and use when it is needed.
                        // console.log('Editor is ready to use!', editor);
                        editorRef.current = theEditor;
                        // if (!editor) {
                        //     setEditor(theEditor)
                        //     // editor.setData(content ? content : "")
                        //     // console.log('editor.config=', editor.isReadOnly)
                        //     // if (editor.isReadOnly) {
                        //     //     const toolbarElement = editor.ui.view.toolbar.element;
                        //     //     toolbarElement.style.display = 'none';
                        //     // }
                        //     // editor.setReadOnly(true);
                        // }
                    }}
                    onChange={(event, editor) => {
                        editorRef.current = editor;
                        const data = editor.getData();
                        // console.log('=======onChange note is==========', note);
                        // contentRef.current = data
                        console.log('onChange noteRef.current.content-----',noteRef.current.content)
                        console.log('onChange data-----',data)
                        console.log('onChange noteContent-----',noteContent)
                        if (noteRef.current.content === data){
                            console.log('-----onChange值没有变------')
                        }else{
                            console.log('-----onChange值变了------')
                            noteRef.current.content = data
                            setNoteContent(data || '')
                            debouncedSubmit(query.get('nid'), data)
                        }
                    }}
                    onBlur={(event, editor) => {
                        editorRef.current = editor;
                        // console.log('=======onBlur note is==========', note);
                        // console.log('Blur.editor', editor);
                        const data = editor.getData();
                        // contentRef.current = data
                        console.log('onBlur noteRef.current.content-----',noteRef.current.content)
                        console.log('onBlur data-----',data)
                        console.log('onBlur noteContent-----',noteContent)
                        // 注意：不管有没有变都要保存，防止切换的时候没有提交保存，然后后台去判断有没有变
                        noteRef.current.content = data
                        setNoteContent(data || '')
                        submitContent(query.get('nid'), data);
                    }}
                />
            </div>
        </div>
    }

    // 定义一个 debounce 函数
    const debouncedSubmit = useCallback(_.debounce((routeNid, data) => {
        // console.log('- ------------------ -', data);
        submitContent(routeNid, data);
    }, 3000), [notes])

    return renderMe()
}

export default NoteEditor
