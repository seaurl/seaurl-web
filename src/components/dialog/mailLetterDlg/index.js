'use client'
import {Modal, Input, message, TreeSelect, Form, Button, Dropdown, Select, Upload, Tag} from 'antd'
import React, {useState, useEffect, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
    addFileCategory,
    queryFileCategory,
    editFileCategory,
    editFileName,
    moveFileTo,
    // deleteNoteCategory,
    // getUrlByCategory,
    // setChoosedCategory,
    getAcsForUploadFile, getSumFileSize, queryFolderList, addFile
} from '@/lib/slices/fileSpaceSlice'
import {useRouter, useParams, usePathname, useSearchParams} from "next/navigation";
import translations from 'ckeditor5/translations/zh-cn.js';

import {
    GeneralHtmlSupport,
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
import {CKEditor} from "@ckeditor/ckeditor5-react";
import 'ckeditor5/ckeditor5.css';
import '@/components/noteSpace/noteEditor/ckeditorDark.css'
import styles from './index.module.scss'
import cns from "classnames/bind";
import {PaperClipOutlined} from "@ant-design/icons";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import {addFileTransfer, pushFileTransferToList, setCalculatorNote} from "@/lib/slices/aiSpaceSlice";
import dayjs from "dayjs";
import {getMailMessages, sendMessage} from "@/lib/slices/mailSpaceSlice";
import {generateGUID, isEmail, isObject} from "@/utils/help";
import {FormOutlined} from "@ant-design/icons";
import SelectNoteDlg from "@/components/dialog/selectNoteDlg";
import {getNoteById} from "@/lib/slices/noteSpaceSlice";

let cx = cns.bind(styles);

/**
 * 标准dialog对话框显示方式
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const MailLetterDlg = (props) => {
    const router = useRouter();
    const query = useSearchParams();
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const [dlg, setDlg] = useState(props.dlg)
    const [loading, setLoading] = useState(false)
    const [treeValue, setTreeValue] = useState(undefined);
    const editorRef = useRef(null)
    const {platFormTheme, isMobile} = useSelector(state => state.system)

    const {myFileSize} = useSelector(state => state.fileSpace)
    const [form] = Form.useForm();
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })
    const [selectNoteDlg, setSelectNoteDlg] = useState({
        title: '',
        show: false
    })
    const uploadRef = useRef(null);
    const [attachmentList, setAttachmentList] = useState([]);
    const abortControllerRef = useRef(null)
    const {
        mailProviders,
        showSidebar,
        openSidebarDrawer,
        mailMessageList,
        isFinished,
        showLoading,
        hasMore,
        pagination
    } = useSelector(state => state.mailSpace)
    useEffect(() => {
        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])


    useEffect(() => {
        console.log('--- props.dlg=', props.dlg)
        setDlg(props.dlg)
        setAttachmentList([])
        // setTreeValue(props.dlg.categoryId)
        if (props.dlg?.show) {
            form.resetFields()
            if (props.dlg?.data) {
                let subject = ''
                if (props.dlg.data?.subject) {
                    subject = props.dlg.data.subject.replace(/^(回复:|转发:|回复：|转发：)/, "")
                }
                console.log('---subject---', subject)
                if (props.dlg.action === 'reply') {
                    let recipients = props.dlg.data.from.map(m => m.email)
                    if (['Sent Messages', '已发送'].includes(props.dlg.data?.folderName)) {
                        recipients = props.dlg.data.recipients.map(m => m.email)
                    }
                    form.setFieldValue('from', props.dlg.data.email)
                    form.setFieldValue('recipients', recipients)

                    form.setFieldValue('subject', `回复：${subject}`)
                    initEditorData()
                }
                if (props.dlg.action === 'replyAll') {
                    let recipients = props.dlg.data.from.map(m => m.email)

                    if (['Sent Messages', '已发送'].includes(props.dlg.data?.folderName)) {
                        recipients = props.dlg.data.recipients.map(m => m.email)
                    }
                    form.setFieldValue('from', props.dlg.data.email)
                    form.setFieldValue('recipients', recipients)
                    form.setFieldValue('subject', `回复：${subject}`)

                    if (props.dlg?.data?.ccRecipients?.length > 0) {
                        const ccRecipients = props.dlg.data.ccRecipients.map(m => m.email)
                        form.setFieldValue('ccRecipients', ccRecipients)
                    }

                    initEditorData()
                }
                if (props.dlg.action === 'forward') {
                    const recipients = props.dlg.data.from.map(m => m.email)
                    form.setFieldValue('from', props.dlg.data.email)
                    // form.setFieldValue('recipients', recipients)
                    form.setFieldValue('subject', `转发：${subject}`)

                    console.log('---props.dlg.data.attachments---', props.dlg.data.attachments)
                    if (props.dlg.data.attachments?.length > 0) {
                        setAttachmentList(props.dlg.data.attachments.map(m => {
                            return {
                                tid: generateGUID(),
                                name: m.fileName,
                                // 是否是原附件
                                isOriginal: true
                            }
                        }))
                    }
                    initEditorData()
                }
            } else {
                if (editorRef.current) {
                    editorRef.current.setData('')
                }
            }

        }
    }, [props.dlg])

    function initEditorData() {
        if (props.dlg?.show) {
            if (props.dlg.data?.content) {
                console.log('--------content=', props.dlg.data.content)
                let recipients
                let ccRecipients
                let from
                if (props.dlg?.action === 'forward') {
                    from = props.dlg.data?.from?.map(m => m.email)
                    recipients = props.dlg.data?.recipients?.map(m => m.email)
                    ccRecipients = props.dlg.data?.ccRecipients?.map(m => m.email)
                } else {
                    recipients = props.dlg.data?.from?.map(m => m.email)
                }

                // const cleanContent = props.dlg.data.content.replace(/<p>&nbsp;<\/p>/g, '');

                let content = ''
                if (props.dlg.data?.content) {
                    content = `<blockquote
                        style="padding-left: 3ex; margin: 0px 0px 0px 0.4ex; border-left: 5px solid rgb(204, 204, 204);">${props.dlg.data?.content}</blockquote>`
                }

                if (editorRef.current && props.dlg?.action !== 'forward') {
                    editorRef.current.setData(`<br><br><p>在&nbsp;${props.dlg.data.sentDate ? dayjs(props.dlg.data.sentDate).format('YYYY年MM月DD日 HH:mm') : ''}，${recipients}写道：</p>${content}`)
                } else if (editorRef.current && props.dlg?.action === 'forward') {
                    editorRef.current.setData(`<br><br><div>
                        -------- 转发邮件信息 --------
                        <br>
                        发件人：${from}
                        <br>
                        主题：${props.dlg.data?.subject || ''}
                        <br>
                        日期：${props.dlg.data?.sentDate ? dayjs(props.dlg.data?.sentDate).format('YYYY-MM-DD HH:mm:ss') : ''}
                        <br>
                        收件人：${recipients ? recipients : ''}
                        ${ccRecipients.length > 0 ? `<br>抄送：${ccRecipients.join(',')}` : ''}
                        
                        <br>
                        </div>
                        ${content}`)
                }


                if (editorRef.current) {
                    editorRef.current.focus();
                }
            }
        }
    }


    function handleCancel() {
        setDlg({
            show: false,
        })
    }

    async function handleOk() {
        form.submit();
    }

    // 分类change事件
    function changeCategory(data) {
        if (data) {
            setTreeValue(data)
        }
    }

    const onFinish = async (values) => {
        console.log('--- onFinish ---:', values);
        console.log('--- editorRef data=', editorRef.current.getData())
        if (abortControllerRef.current?.abort) {
            abortControllerRef.current.abort();
        }

        let isFlag1 = true;
        let isFlag2 = true;
        if (!values.from) {
            return message.info("发件人不能为空！")
        }
        if (!values.recipients || values.recipients.length === 0) {
            return message.info("收件人不能为空！")
        }

        // 1、文本有没有输入，2、邮箱是不是正确的
        const recipients = values.recipients.map((item) => {
            if (!isEmail(item)) {
                isFlag1 = false
            }
            return {
                personal: item.split('@')[0],
                address: item
            }
        })
        let ccRecipients = []
        if (values.ccRecipients && values.ccRecipients.length > 0) {
            ccRecipients = values.ccRecipients.map((item) => {
                if (!isEmail(item)) {
                    isFlag2 = false
                }
                return {
                    personal: item.split('@')[0],
                    address: item
                }
            })
        }

        if (!isFlag1) {
            return message.error("收件人邮箱不正确，请重新输入！")
        }
        if (!isFlag2) {
            return message.error("抄送人邮箱不正确，请重新输入！")
        }
        let params = {
            recipients,
            ccRecipients,
            from: [{
                personal: values.from.split('@')[0],
                address: values.from
            }],
            subject: values.subject,
            content: editorRef.current.getData(),
            // 我的文件
            myFiles: [],
            // 原有附件
            originFiles: [],

            // 有下面两个属性说明是转发邮件
            mid: props.dlg.data?.mid || '',
            folderName: props.dlg.data?.folderName || ''
        }
        let formData = new FormData();
        // attachmentList三种类型：1、本地上传的，2、我的文件的，3、原附件的
        if (attachmentList.length > 0) {
            attachmentList.forEach((item) => {
                if (item.url) { // 有url说明是我的文件
                    item.url = encodeURI(item.url)
                    params.myFiles.push(item)
                } else if (item.isOriginal) { // 说明是原附件
                    params.originFiles.push(item)
                } else { // 说明是本地上传的
                    formData.append('files', item)
                }
            })
        }

        console.log('--- params: ---', params)

        // 创建新的 AbortController
        abortControllerRef.current = new AbortController();

        formData.append('mailMessage', JSON.stringify({
            ...params
        }));
        setLoading(true)
        console.log('--- formData: ---', formData)
        const res = await dispatch(sendMessage({
            formData,
            abortController: abortControllerRef.current
        }))

        console.log('--- sendMessage ---', res)
        if (res.payload.status === 0 && res.payload.data) {
            if (props.onSuccess) {
                message.success('发送邮件成功')
                props.onSuccess(res)
            }
        } else {
            message.error('发送邮件失败！')
            if (props.onClose) {
                props.onClose(res)
            }
        }
        setLoading(false)
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // 上传文件前判断单个文件是否超过500mb，如果超过不允许上传
    function beforeUploadFile(file, fileList) {
        console.log('file =', file)
        console.log('file size=', file.size)
        console.log('myFileSize =', myFileSize)
        const totalSize = myFileSize + file.size
        if (totalSize / 1024 / 1024 / 1024 > 5) {
            message.warning('存储空间不足');
        }
        const isLt50M = file.size / 1024 / 1024 > 50;
        if (isLt50M) {
            return message.warning('文件超过50Mb，请重新上传！');
        }
        file.tid = generateGUID()
        setAttachmentList(attachmentList.concat(file))
        return false; // 不调用默认的上传方法
    }

    // 添加/编辑弹出框
    function renderDlg() {
        return <Modal
            title={dlg?.title}
            open={dlg?.show}
            style={{
                top: 20,
            }}
            width={'50%'}
            maskClosable={false}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    取消
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
                    发送
                </Button>
            ]}>
            <Form
                form={form}
                name="basic"
                labelCol={{
                    span: 2,
                }}
                wrapperCol={{
                    span: 22,
                }}
                initialValues={{
                    remember: true,
                }}
                labelAlign={'left'}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off">
                <Form.Item
                    label="发件人"
                    name="from">
                    <Select
                        style={{
                            width: '100%',
                        }}
                        fieldNames={{
                            label: 'email',
                            value: 'email'
                        }}
                        placeholder="发件人"
                        // onChange={handleChange}
                        options={mailProviders}
                    />
                </Form.Item>
                <Form.Item
                    label="收件人"
                    name="recipients">
                    <Select
                        mode="tags"
                        open={false}
                        suffixIcon={null}
                        style={{
                            width: '100%',
                        }}
                        placeholder="收件人"
                        // onChange={handleChange}
                        options={[]}
                    />
                </Form.Item>
                <Form.Item
                    label="抄送"
                    name="ccRecipients">
                    <Select
                        mode="tags"
                        open={false}
                        suffixIcon={null}
                        style={{
                            width: '100%',
                        }}
                        placeholder="抄送"
                        // onChange={handleChange}
                        options={[]}
                    />
                </Form.Item>

                <Form.Item
                    label="主题"
                    name="subject">
                    <Input placeholder="请输入主题"/>
                </Form.Item>
            </Form>
            <div className={'flex items-center pb-2 justify-between'}>
                <div>
                    <Dropdown.Button
                    size={'default'}
                    type={'default'}
                    menu={{
                        items: [{
                            key: 'myFile',
                            label: '从我的文件选取'
                        }
                        ],
                        onClick: (d) => {
                            console.log('d=', d)
                            if (d.key === 'location') {
                                uploadRef.current.click();
                            }
                            if (d.key === 'myFile') {
                                setSelectFileDlg({
                                    title: '请选择文件',
                                    show: true,
                                    onOk: async (theFiles) => {
                                        console.log('theFiles=', theFiles)
                                        let d = theFiles
                                        if (isObject(theFiles)) {
                                            d = [theFiles]
                                        }
                                        if (d?.length > 0) {
                                            let list = []
                                            d.forEach(item => {
                                                console.log('---filter attachmentList before---', attachmentList)
                                                const fs = attachmentList.filter(f => f.key === item.key)
                                                console.log('--- fs ---', fs)
                                                if (fs.length > 0) {// 说明之前添加过，不做处理

                                                } else {
                                                    console.log('--- add item file ---', item)
                                                    const isLt50M = item.size / 1024 / 1024 > 50;
                                                    if (isLt50M) {
                                                        return message.warning('文件超过50Mb，请重新上传！');
                                                    }
                                                    item.tid = generateGUID()
                                                    list = list.concat(item)
                                                }
                                            })
                                            console.log('--- list ---', list)
                                            setAttachmentList(attachmentList.concat(list))
                                        }
                                        console.log('--- attachmentList ---', attachmentList)
                                    }
                                })
                            }
                        }
                    }}>
                    <div className={'flex items-center gap-1'} onClick={() => {
                        uploadRef.current.click();
                    }}>
                        <PaperClipOutlined/>上传附件
                    </div>
                </Dropdown.Button></div>
                {/*<div>邮件正文：</div>*/}
                <div className={'pl-[6px]'}>
                    <Button icon={<FormOutlined/>} onClick={() => {
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
                                    if (res.payload.status === 0) {
                                        const content = res.payload.data.content
                                        console.log('--- content ---', content)
                                        if (content && editorRef.current) {
                                            const originContent = editorRef.current.getData()
                                            editorRef.current.setData(content + originContent)
                                        }
                                    }
                                }
                            }
                        })
                    }}>选择我的笔记</Button>
                </div>
            </div>
            <div className={cx({
                'border border-[#ddd] dark:border-[#474747]': true,
                'vditor': true,
                'darkEditor': platFormTheme.background !== 'light'
            })}>

                <CKEditor
                    // id={query.get('nid')}
                    editor={ClassicEditor}
                    // data={noteContent}
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
                            items: ['undo',
                                'redo',
                                '|',
                                // 'heading',
                                'bold',
                                'fontSize',
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
                                'mediaEmbed'
                            ],
                        },
                        plugins: [
                            GeneralHtmlSupport,
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
                            Link,
                            BlockQuote,
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
                            // MediaEmbed,
                            Image,
                            ImageCaption,
                            ImageStyle,
                            ImageToolbar,
                            ImageUpload,
                            // ImageResize,
                            List,
                        ],
                        licenseKey: 'GPL',
                        mention: {
                            // Mention configuration
                        },
                        htmlSupport: {
                            allow: [
                                {
                                    name: /.*/,
                                    attributes: true,
                                    classes: true,
                                    styles: true
                                }
                            ]
                        }
                        // htmlSupport: {
                        //     // 保留所有内联样式
                        //     allowedContent: true,  // 或者更具选择性的允许样式
                        //     extraAllowedContent: 'span{*}[*];div{*}[*]', // 允许 span 和 div 标签及其所有样式属性
                        // }
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

                        initEditorData()
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
                        // const editor = editorRef.current.editor;

                        // 使用 CKEditor 的 API 设置光标到开头
                        editorRef.current.focus();

                    }}
                    onChange={(event, editor) => {
                        editorRef.current = editor;
                        const data = editor.getData();
                    }}
                    onBlur={(event, editor) => {
                        editorRef.current = editor;
                        const data = editor.getData();
                    }}
                />
            </div>
            {
                attachmentList.length > 0 ?
                    <div className={'pt-2 flex items-center flex-wrap gap-1'}>
                        {
                            attachmentList.map((item, index) => {
                                return <Tag key={item.tid} closeIcon onClose={() => onCloseTag(item)}>{item.name}</Tag>
                            })
                        }
                    </div> : null
            }

        </Modal>
    }

    function onCloseTag(removedTag) {
        // console.log('---removedTag---',removedTag);
        // console.log('---attachmentList---',attachmentList);
        const newTags = attachmentList.filter((tag) => tag.tid !== removedTag.tid);
        setAttachmentList(newTags)
    }

    return <div className={styles.container}>
        {renderDlg()}
        <SelectFileDlg multiple={true} dlg={selectFileDlg}/>
        <SelectNoteDlg dlg={selectNoteDlg}/>

        {/*注意：附件上传限制：单个文件最大50mb，多个文件最大大小也是50mb*/}
        <Upload
            multiple
            beforeUpload={beforeUploadFile}
            showUploadList={false}
            withCredentials={true}>
            <div ref={uploadRef}/>
        </Upload>
    </div>
}

export default MailLetterDlg;
