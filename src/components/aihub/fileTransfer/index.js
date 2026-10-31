'use client'
import React, {useEffect, useMemo, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Calendar, theme, Input, Spin, Button, Drawer, Tooltip, Select, message, Dropdown, Image, Upload} from 'antd';
import dayjs from 'dayjs';
import {
    LeftOutlined,
    LoadingOutlined,
    RightOutlined,
    PicLeftOutlined,
    UploadOutlined,
    FolderOutlined,
    FolderAddOutlined,
    FolderOpenOutlined,
    FolderViewOutlined,
    EditOutlined,
    SettingOutlined,
    CloseOutlined,
    CopyOutlined,
    FileOutlined,
    DownloadOutlined,
    PlayCircleOutlined,
    AudioOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    FileWordOutlined,
    FilePptOutlined, FileZipOutlined
} from "@ant-design/icons";
import classNames from "classnames/bind";
import styles from './index.module.scss'
import {
    addFileTransfer,
    deleteFileTransfer,
    deleteFileTransferListByIndex,
    deleteFileTransferLoadingFile,
    pushFileTransferToList,
    queryByMonth,
    queryFileTransfer, queryFileTransferConfig, queryUserAiTools,
    setFileTransfer, setFileTransferFileUploading, updateDt
} from "@/lib/slices/aiSpaceSlice";
import Loading from "@/components/loading";
import Empty from "@/components/empty";
import FileTransferDlg from "@/components/dialog/fileTransferDlg";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import {getSumFileSize} from "@/lib/slices/fileSpaceSlice";
import {convertSize, getFileType} from "@/utils/help";
import IconFont from "@/utils/iconFont";

let cx = classNames.bind(styles);

const {TextArea} = Input;

const FileTransfer = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const query = useSearchParams()

    const dispatch = useDispatch()
    // const [selectedDate, setSelectedDate] = useState(dayjs());
    const isUpdate = useRef(false)

    const [openDrawer, setOpenDrawer] = useState(false)

    const queryListAbortControllerRef = useRef()
    const monthAbortControllerRef = useRef()

    // const [content, setContent] = useState('')
    const {myFileSize} = useSelector(state => state.fileSpace)

    const {chooseUserAiTool, fileTransfer} = useSelector(state => state.aiSpace)
    const [file, setFile] = useState(null)
    const {token} = theme.useToken();
    const {selectedDate, content, list, loadingList, hasDataList, fileSaveInPId} = fileTransfer

    const [visibleImage, setVisibleImage] = useState({
        show: false,
        url: ''
    });

    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })

    const [uploading, setUploading] = useState(false)

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

    useEffect(() => {
        console.log('token---', token)
        init()
        return () => {
            dispatch(deleteFileTransferLoadingFile())
            if (monthAbortControllerRef.current?.abort) {
                monthAbortControllerRef.current.abort()
            }
            if (queryListAbortControllerRef.current?.abort) {
                queryListAbortControllerRef.current.abort();
            }
        }
    }, [])

    function init() {
        const today = dayjs()
        if (selectedDate) {
            queryByMonthCount(selectedDate.format('YYYY-MM'))
        } else {
            // 查询文件保存路径
            dispatch(queryFileTransferConfig())

            // 获取用户文件总容量
            dispatch(getSumFileSize())

            // 设置文件日期
            dispatch(setFileTransfer({
                which: 'selectedDate',
                selectedDate: today
            }))
            // 查询每月日期是否保存数据
            queryByMonthCount(today.format('YYYY-MM'))
            // 查询当前日期下的列表
            queryList(today.format('YYYY-MM-DD'))
        }
    }

    // 粘贴文件
    async function handlePaste(event) {
        const clipboardItems = event.clipboardData?.items;
        let file = null;

        // 遍历剪贴板中的项目，查找文件
        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
            if (item.kind === 'file') {
                file = item.getAsFile();
                break; // 只处理第一个图片文件
            }
        }

        if (file) {
            // 阻止默认粘贴行为，防止文件名出现在 Input 中
            event.preventDefault();
            console.log('file=', file)
            const totalSize = myFileSize + file.size
            if (totalSize / 1024 / 1024 / 1024 > 5) {
                message.warning('存储空间不足');
                return false
            }
            const isLt100M = file.size / 1024 / 1024 > 100;
            if (isLt100M) {
                message.warning('您的文件大小超过100Mb，请在我的文件中上传大文件！');
                return false
            }
            let fileType = getFileType(file.name)
            let url = ''
            if (fileType === 'image') {
                url = URL.createObjectURL(file);
            }

            // 将文件添加到前端列表中
            dispatch(pushFileTransferToList({
                // 设置loading效果
                loading: true,
                // 使用时间戳作唯一标识，目的是上传成功回调后能找到对应的文件进行设置(注意：仅本地文件上传使用)
                timestamp: file.lastModified,
                type: 'file',
                file: {
                    name: file.name,
                    size: file.size,
                    type: fileType,
                    url: url
                },
                createdDt: dayjs()
            }))

            const formData = new FormData();
            formData.append('date', selectedDate.format('YYYY-MM-DD'));
            formData.append('aiToolId', chooseUserAiTool._id);
            formData.append('file', file);

            //上传文件
            await dispatch(addFileTransfer({
                formData,
                timestamp: file.lastModified
            }))

            // 成功之后调用查询以及将loading设置成false，通过lastModified来识别
            queryByMonthCount(selectedDate.format('YYYY-MM'))
            //     dispatch(setFileTransferFileUploading({
            //         // 唯一标识
            //         lastModified: file.lastModified,
            //         // 设置回调信息
            //         file: res.payload.data
            //     }))
            // }
        }
    }

    function queryByMonthCount(date) {
        if (date) {
            if (monthAbortControllerRef.current?.abort) {
                monthAbortControllerRef.current.abort()
            }
            monthAbortControllerRef.current = new AbortController()

            dispatch(queryByMonth({
                date: date,
                abortController: monthAbortControllerRef.current
            }))
        }
    }

    async function queryList(date) {
        if (queryListAbortControllerRef.current?.abort) {
            queryListAbortControllerRef.current.abort();
        }
        queryListAbortControllerRef.current = new AbortController()
        dispatch(queryFileTransfer({
            date,
            abortController: queryListAbortControllerRef.current
        }))
    }

    const onPanelChange = (value, mode) => {
        setOpenDrawer(false)
        // alert(value.format('YYYY-MM-DD'))
        console.log(value.format('YYYY-MM-DD'), mode);
        // setSelectedDate(value)
        dispatch(setFileTransfer({
            which: 'selectedDate',
            selectedDate: value
        }))
        queryList(value.format('YYYY-MM-DD'))
        queryByMonthCount(value.format('YYYY-MM'))
    };

    const onDateChange = (value, selectInfo) => {
        setOpenDrawer(false)
        if (selectInfo.source === 'date') {
            dispatch(setFileTransfer({
                which: 'selectedDate',
                selectedDate: value
            }))
            queryList(value.format('YYYY-MM-DD'))
        }
    }

    const headerRender = ({value, onChange}) => {
        const currentMonth = value.month();
        const currentYear = value.year();

        const prevMonth = () => {
            const newValue = value.clone().subtract(1, 'month');
            onChange(newValue);
        };

        const nextMonth = () => {
            const newValue = value.clone().add(1, 'month');
            onChange(newValue);
        };

        const handleYearChange = (year) => {
            const newValue = value.clone().year(year);
            onChange(newValue);
        };

        const handleMonthChange = (month) => {
            const newValue = value.clone().month(month);
            onChange(newValue);
        };

        // Generate years list for the dropdown
        const years = [];
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            years.push(i);
        }

        // Generate months list for the dropdown
        const months = [];
        for (let i = 0; i < 12; i++) {
            months.push({value: i, label: value.clone().month(i).format('MMMM')});
        }

        return (
            <div className={'flex items-center justify-between gap-2 py-2'}>
                <Button onClick={prevMonth} icon={<LeftOutlined/>}/>

                <div className={'flex items-center gap-2'}>
                    <Select
                        value={currentYear}
                        onChange={handleYearChange}
                        options={years.map(year => ({value: year, label: year}))}
                        style={{width: 80}}
                    />
                    <Select
                        value={currentMonth}
                        onChange={handleMonthChange}
                        options={months}
                        style={{width: 90}}
                    />
                </div>

                <Button onClick={nextMonth} icon={<RightOutlined/>}/>
            </div>
        );
    };

    const fullCellRender = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        const hasData = hasDataList.some(f => f.actionDate === formattedDate);
        const isSelected = date.isSame(selectedDate, 'day');
        const isToday = date.isSame(dayjs(), 'date')
        const isWeekend = date.day() === 6 || date.day() === 0; // 判断是否为周六或周日
        return (
            <div className={classNames({
                'flex items-center justify-center flex-col w-[36px] h-[36px] relative mx-[7px]': true,
                'bg-[#1677ff] text-white rounded-md': isSelected,
                'border border-[#1677ff] rounded-md': isToday,
                'text-red-600 font-medium': isWeekend // 周六或周日字体颜色标红
            })}>
                <div className={'relative z-1'}>{date.date()}</div>
                {hasData ?
                    <div className={'flex items-center justify-center w-[4px] h-[4px] rounded-full bg-[#13cec9]'}>
                    </div> :
                    <div className={'flex items-center justify-center w-[4px] h-[4px] rounded-full bg-transparent'}>
                    </div>}
            </div>
        );
    };

    const editItemRef = useRef(null) // { id, index, editTime }

    async function handleKeyDown(e) {
        if (e.keyCode === 13) {
            if (e.shiftKey) {
                // 这里是回车换行
            } else {
                // 阻止换行
                e.preventDefault();
                if (content.trim()) {
                    console.log('selectedDate-', selectedDate.format('YYYY-MM-DD'))
                    console.log('content-', content)
                    console.log('chooseAiTool-', chooseUserAiTool)
                    if (selectedDate && chooseUserAiTool) {
                        const formData = new FormData();
                        formData.append('date', selectedDate.format('YYYY-MM-DD'));
                        formData.append('content', content.trim());
                        formData.append('aiToolId', chooseUserAiTool._id);
                        // formData.append('file', null);
                        // formData.append('fileId', '');
                        const ts = Date.now()
                        await dispatch(pushFileTransferToList({
                            type: 'text',
                            timestamp: ts,
                            content: content.trim(),
                            createdDt: dayjs()
                        }))

                        await dispatch(addFileTransfer({
                            formData,
                            timestamp: ts
                        }))

                        // 编辑模式：5分钟内删除原记录
                        if (editItemRef.current) {
                            const { id, index, editTime } = editItemRef.current
                            if (Date.now() - editTime < 5 * 60 * 1000 && id) {
                                dispatch(deleteFileTransfer({ id })).then((res) => {
                                    if (res.payload.status === 0 && res.payload.data) {
                                        dispatch(deleteFileTransferListByIndex({ index: index + 1 }))
                                        queryByMonthCount(selectedDate.format('YYYY-MM'))
                                    }
                                })
                            }
                            editItemRef.current = null
                        }

                        queryByMonthCount(selectedDate.format('YYYY-MM'))
                    }
                } else {
                    return message.warning('内容不能为空')
                }
            }
        }
    }

    const uploadProps = {
        name: 'file',
        // 不显示上传文件列表
        showUploadList: false,
        multiple: false,
        maxCount: 1,
        action: `${process.env.NEXT_PUBLIC_API_HOST}/space/crud/fileTransfer/add`,
        data: (file) => ({
            date: selectedDate.format('YYYY-MM-DD'),
            aiToolId: chooseUserAiTool._id
        }),
        headers: {
            'token-id': session?.accessToken || '',
        },
        beforeUpload: (file) => {
            console.log('file=', file)
            // 1、判断是否设置了文件保存位置
            // 2、判断是否达到最大存储容量
            const totalSize = myFileSize + file.size
            if (totalSize / 1024 / 1024 / 1024 > 5) {
                message.warning('存储空间不足');
                return false
            }
            const isLt100M = file.size / 1024 / 1024 > 100;
            if (isLt100M) {
                message.warning('您的文件大小超过100Mb，请在我的文件中上传大文件！');
                return false
            }
            let fileType = getFileType(file.name)
            let url = ''
            if (fileType === 'image') {
                url = URL.createObjectURL(file);
            }
            dispatch(pushFileTransferToList({
                // 设置loading效果
                loading: true,
                // 使用lastModified作唯一标识，目的是上传成功回调后能找到对应的文件进行设置(注意：仅本地文件上传使用)
                timestamp: file.lastModified,
                type: 'file',
                file: {
                    name: file.name,
                    size: file.size,
                    type: fileType,
                    url: url
                },
                createdDt: dayjs()
            }))
            return true; // 不调用默认的上传方法
        },
        onChange: (info) => {
            if (info.file.status === 'uploading') {
                // console.log(info.file, info.fileList);
            }
            // 判断是否上传完成
            if (info.file.status === 'done') {
                console.log('upload done =', info)
                if (info.file?.response?.status === 0) {
                    queryByMonthCount(selectedDate.format('YYYY-MM'))
                    dispatch(setFileTransferFileUploading({
                        // 唯一标识
                        timestamp: info.file.lastModified,
                        // 设置回调信息
                        data: info.file?.response?.data
                    }))
                }
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        }
    };

    function renderLeft() {
        return <div className={'flex flex-col w-[375px] relative shrink-0 h-full dark:bg-[#141414]'}>
            {/*<div className={'font-medium text-base p-3 border-b border-[#ddd] dark:border-[#474747]'}>日历</div>*/}
            <div className={'px-2 bg-[#fff] dark:bg-[#141414]'}>
                <Spin spinning={false} indicator={<LoadingOutlined
                    style={{
                        fontSize: 36,
                    }}
                    spin
                />}>
                    {
                        selectedDate ? <Calendar headerRender={headerRender}
                                                 fullCellRender={fullCellRender}
                                                 fullscreen={false}
                                                 onPanelChange={onPanelChange}
                                                 onSelect={onDateChange}
                                                 value={selectedDate}/> : null
                    }

                </Spin>
            </div>
            <div
                className={'px-4 py-3 border-t border-[#ddd] dark:border-[#474747] flex items-center justify-between text-xl'}>
                <div className={'flex items-center gap-5'}>
                    <Tooltip title="上传文件">
                        <Upload {...uploadProps}>
                            <div className={'text-xl'}>
                                <FolderAddOutlined className={'cursor-pointer'}/>
                            </div>
                        </Upload>
                    </Tooltip>
                    <Tooltip title="从我的文件选择">
                        <FolderOutlined className={'cursor-pointer'} onClick={() => {
                            setSelectFileDlg({
                                title: '请选择文件',
                                show: true,
                                onOk: async (d) => {
                                    console.log('d=', d)
                                    if (d) {
                                        setFile(d)
                                        const formData = new FormData();
                                        formData.append('date', selectedDate.format('YYYY-MM-DD'));
                                        formData.append('aiToolId', chooseUserAiTool._id);
                                        formData.append('fileId', d.key);
                                        // formData.append('content', null);
                                        // formData.append('file', null);
                                        await dispatch(pushFileTransferToList({
                                            type: 'file',
                                            file: d,
                                            createdDt: dayjs()
                                        }))
                                        await dispatch(addFileTransfer({
                                            formData
                                        }))

                                        queryByMonthCount(selectedDate.format('YYYY-MM'))
                                    }
                                }
                            })
                            // if (fileSaveInCategoryId) {
                            //
                            // } else {
                            //     // message.warning("请先设置文件保存位置！")
                            //     setDlg({
                            //         title: '请先设置文件保存位置',
                            //         show: true,
                            //         onSuccess: async (d) => {
                            //         }
                            //     })
                            // }

                        }}/>
                        {/*<FolderOpenOutlined className={'cursor-pointer'}/>*/}
                        {/*<FolderViewOutlined className={'cursor-pointer'}/>*/}
                    </Tooltip>
                    {/*<Tooltip title="粘贴文件">*/}
                    {/*    <CopyOutlined className={'cursor-pointer'}/>*/}
                    {/*</Tooltip>*/}
                </div>
                <div>
                    <Tooltip title="修改文件保存位置">
                        <SettingOutlined className={'cursor-pointer'} onClick={() => {
                            setDlg({
                                title: '修改文件保存位置',
                                show: true,
                                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                                // data: {
                                //     name: file.name || '',
                                //     file: file
                                // },
                                onSuccess: async (d) => {
                                    // console.log('success d=', d)
                                    // if (d?.text) {
                                    //     message.success("解析成功")
                                    //     dispatch(setQrcodeParsing2(d.text))
                                    // } else {
                                    //     message.error("解析失败")
                                    // }
                                }
                            })
                        }}/>
                    </Tooltip>
                </div>
            </div>
            <div className={'h-full'}>
                <TextArea
                    maxLength={2000}
                    value={content}
                    variant={'borderless'}
                    placeholder="请输入文本内容或者粘贴文件（Shift + Enter = 换行）"
                    onPaste={handlePaste}
                    onChange={(e) => {
                        // setContent(e.target.value)
                        dispatch(setFileTransfer({
                            which: 'content',
                            content: e.target.value
                        }))
                    }}
                    onKeyDown={handleKeyDown}
                    style={{
                        height: '100%',
                        resize: 'none'
                    }}
                />
            </div>
        </div>
    }

    const convertToPng = async (blob) => {
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        const url = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((pngBlob) => {
                    resolve(pngBlob);
                }, 'image/png');
            };
            img.onerror = reject;
            img.src = url;
        });
    };

    async function onMenuClick(key, item, index) {
        console.log('key =', key)
        console.log('item =', item)
        console.log('index =', index)
        if (key === 'edit') {
            editItemRef.current = {
                id: item.id,
                index,
                editTime: Date.now()
            }
            dispatch(setFileTransfer({
                which: 'content',
                content: item.content || ''
            }))
        }
        if (key === 'copy') {
            // 复制图片文件
            if (item.type === 'file' && item.file_as.length > 0 && item.file_as[0].url) {
                if(item.file_as[0].type === 'image'){
                    try {
                        const permission = await navigator.permissions.query({ name: "clipboard-write" });
                        if (permission.state === "denied") {
                            throw new Error("没有剪贴板写入权限");
                        }

                        // 是否大于10Mb
                        if (item.file_as[0].size > 10 * 1024 * 1024){
                            message.info({
                                duration: 5,
                                content: '提示：大文件复制比较慢，请耐心等待，不要刷新页面'
                            })
                        }

                        // 获取图像数据
                        const response = await fetch(item.file_as[0].url);
                        let blob = await response.blob();

                        // 转换为 PNG 类型
                        if (blob.type === 'image/jpeg') {
                            blob = await convertToPng(blob);
                        }

                        // 创建一个新的剪贴板项
                        const data = [new ClipboardItem({ [blob.type]: blob })];

                        // 将数据复制到剪贴板
                        await navigator.clipboard.write(data);
                        message.success({
                            duration: 5,
                            content: '复制成功'
                            //     <div className={'flex flex-col items-start'}>
                            //     <div>复制成功</div>
                            //     <div className={'text-xs'}>提示：因浏览器机制，复制的文件仅支持输入框中粘贴</div>
                            // </div>
                        })
                    }catch (e) {
                        console.log('复制失败='+e)
                        message.error('复制失败='+e)
                    }
                }

            }
            // 复制文本内容
            else if (item.content) {
                navigator.clipboard.writeText(item.content).then(() => {
                    message.success('复制成功')
                }).catch(err => {
                    message.error('复制失败')
                });
            }
        }
        if (key === 'download') {
            if (item.file_as?.length > 0 && item.file_as[0].url) {
                fetch(item.file_as[0].url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error fetching image: ${response.statusText}`);
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = item.file_as[0].name || 'download';
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        URL.revokeObjectURL(url); // 释放URL
                        document.body.removeChild(link);
                    })
                    .catch(error => {
                        message.error('下载出错:', error);
                    });
            } else {
                message.error('下载出错:没有找到相关文件');
            }
        }
        if (key === 'delete') {
            if (item.id) {
                const res = await dispatch(deleteFileTransfer({
                    id: item.id
                }))
                if (res.payload.status === 0 && res.payload.data) {
                    dispatch(deleteFileTransferListByIndex({
                        index
                    }))
                    queryByMonthCount(selectedDate.format('YYYY-MM'))
                } else {
                    message.error('删除失败')
                }
            } else if (item.loading) {
                message.info('正在上传，请稍候')
            }
        }

    }

    function renderContent(content) {
        // 简化版：匹配到空格或中文为止
        const urlRegex = /(https?:\/\/|ftp:\/\/|www\.)[^\s\u4e00-\u9fa5]+/gi;
        const parts = [];
        let lastIndex = 0;
        let match;
        let keyIndex = 0;

        while ((match = urlRegex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            let url = match[0];
            let fullUrl = url.startsWith('http') ? url : 'https://' + url;

            parts.push(
                <a
                    key={`link-${keyIndex++}`}
                    href={fullUrl}
                    className="text-[#1778FF]"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    {url}
                </a>
            );

            lastIndex = match.index + url.length;
        }

        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? <>{parts}</> : <span>{content}</span>;
    }

    function renderList() {
        if (loadingList) {
            return <div className={'flex items-center justify-center'}><Loading/></div>
        }
        if (list.length === 0) {
            return <div className={'flex items-center justify-center'}><Empty/></div>
        }
        return list.map((item, index) => {
            // 获取当前项的时间
            const currentTime = dayjs(dayjs.utc(item.createdDt).local());

            // 获取上一个项的时间
            const nextItem = list[index + 1];
            const nextTime = nextItem ? dayjs(dayjs.utc(nextItem.createdDt).local()) : null;

            // 计算时间差，只有当时间差大于10分钟时才显示时间
            const showTime = !nextTime || Math.abs(currentTime.diff(nextTime, 'minute')) > 5;

            let icon = <IconFont type={'icon-unknown'} className='text-4xl'/>
            if (item.file_as?.length > 0) {
                if (item.file_as[0].type === 'image') {

                } else {
                    if (item.file_as[0].type.includes('video')) {
                        icon = <IconFont type="icon-video" className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('radio')) {
                        icon = <IconFont type={'icon-audio'} className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('txt')) {
                        icon = <IconFont type={'icon-txt'} className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('pdf')) {
                        icon = <IconFont type={'icon-pdf'} className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('excel')) {
                        icon = <IconFont type={'icon-excel'} className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('word')) {
                        icon = <IconFont type={'icon-word'} className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('ppt')) {
                        icon =<IconFont type={'icon-ppt'} className='text-4xl'/>
                    }
                    if (item.file_as[0].type.includes('zip')) {
                        icon = <IconFont type={'icon-zip'} className='text-4xl'/>
                    }
                }
            }

            // 只有有文件才展示，没有文件展示个毛或者不是文件类型也展示
            return (item.type === 'file' && item.file_as.length > 0) || item.type !== 'file' ?
                <div className={'flex flex-col'}>
                    {showTime && (
                        <span className={'text-xs'}>{currentTime.format('YYYY-MM-DD HH:mm')}</span>
                    )}
                    {/*普通文本展示*/}
                    {item.content ? <Dropdown
                        menu={{
                            onClick: ({key}) => onMenuClick(key, item, index),
                            items: [
                                {
                                    label: <div className={'flex items-center gap-2'}><EditOutlined
                                        style={{fontSize: '12px'}}/>编辑</div>,
                                    key: 'edit',
                                },
                                {
                                    label: <div className={'flex items-center gap-2'}><CopyOutlined
                                        style={{fontSize: '12px'}}/>复制</div>,
                                    key: 'copy',
                                },
                                {
                                    label: <div className={'flex items-center gap-2'}><CloseOutlined
                                        style={{fontSize: '12px'}}/>删除</div>,
                                    key: 'delete',
                                }
                            ]
                        }}
                        trigger={['contextMenu']}>
                    <span key={index}
                          className={'bg-[#95EC69] dark:bg-[#27B561] rounded-md py-2 px-3 w-auto max-w-max text-sm dark:text-[#061309] whitespace-pre-wrap break-all'}>{renderContent(item.content)}</span></Dropdown> : null}

                    {/*非图片文件展示*/}
                    {
                        item.file_as?.length > 0 && item.file_as[0].type !== 'image' ? <Dropdown
                            menu={{
                                onClick: ({key}) => onMenuClick(key, item, index),
                                items: [
                                    // {
                                    //     label: <div className={'flex items-center gap-2'}><FolderOpenOutlined
                                    //         style={{fontSize: '12px'}}/>打开</div>,
                                    //     key: '0',
                                    // },
                                    // {
                                    //     label: <div className={'flex items-center gap-2'}><CopyOutlined
                                    //         style={{fontSize: '12px'}}/>复制</div>,
                                    //     key: '1',
                                    // },
                                    {
                                        label: <div className={'flex items-center gap-2'}><DownloadOutlined
                                            style={{fontSize: '12px'}}/>下载</div>,
                                        key: 'download',
                                    },
                                    {
                                        label: <div className={'flex items-center gap-2'}><CloseOutlined
                                            style={{fontSize: '12px'}}/>删除</div>,
                                        key: 'delete',
                                    }
                                ]
                            }}
                            trigger={['contextMenu']}>
                            <div
                                className={'w-auto max-w-[300px] flex flex-row items-center justify-between bg-[#eee] dark:bg-[#2e333d] rounded-md pt-2 pb-4 px-3 gap-4 cursor-pointer'}>
                                <div className={'flex flex-col '} onClick={() => {
                                    console.log('----item.file_as------', item.file_as)
                                    const screenWidth = window.screen.width
                                    const screenHeight = window.screen.height
                                 if (item.file_as.length > 0) {
                                     window.open(`/fileSpace/onlyoffice?fileId=${item.file_as[0].id}`, 'newWindow', "width=" + screenWidth + ",height=" + screenHeight + ",menubar=no,toolbar=no,location=no")
                                 }
                                }}>
                                    <span className={'text-base break-all break-words'}>{item.file_as[0].name}</span>
                                    <span
                                        className={'text-xs pt-1'}>{item.file_as[0].size > 0 ? convertSize(item.file_as[0].size) : '0KB'}</span>
                                </div>
                                <div className={'text-2xl'}>
                                    <Spin indicator={<LoadingOutlined spin/>} size="small" spinning={!!item.loading}>
                                        {icon}
                                    </Spin>
                                </div>
                            </div>
                        </Dropdown> : null
                    }
                    {/*图片文件展示还可以预览*/}
                    {
                        item.file_as?.length > 0 && item.file_as[0].type === 'image' ?
                            <div className={'py-2 '}>
                                <Dropdown
                                    menu={{
                                        onClick: ({key}) => onMenuClick(key, item, index),
                                        items: [
                                            {
                                                label: <div className={'flex items-center gap-2'}><CopyOutlined
                                                    style={{fontSize: '12px'}}/>复制</div>,
                                                key: 'copy',
                                            },
                                            {
                                                label: <div className={'flex items-center gap-2'}><DownloadOutlined
                                                    style={{fontSize: '12px'}}/>下载</div>,
                                                key: 'download',
                                            },
                                            {
                                                label: <div className={'flex items-center gap-2'}><CloseOutlined
                                                    style={{fontSize: '12px'}}/>删除</div>,
                                                key: 'delete',
                                            }
                                        ]
                                    }}
                                    trigger={['contextMenu']}>

                                    <Image
                                        width={300}
                                        src={item.file_as[0].url}
                                        preview={true}
                                        placeholder={
                                            <div className={'w-[300px] flex items-center justify-center'}>
                                                <Spin indicator={<LoadingOutlined spin/>} spinning={true}>

                                                </Spin>
                                            </div>
                                        }
                                    />
                                </Dropdown>
                            </div> : null
                    }
                </div> : null
        })
    }

    return <div className={cx({
        'flex flex-row': true,
        'container': true
    })} onClick={globalUpdate}>
        <div className={'hidden lg:block'}>
            {renderLeft()}
        </div>
        <div
            className={'flex flex-col w-full h-screen overflow-y-auto lg:border-l border-[#ddd] dark:border-[#474747] dark:bg-[#202020] '}>
            <div
                className={'font-medium text-base p-3 border-b border-[#ddd] dark:border-[#474747] sticky top-0 bg-white dark:bg-[#202020] flex items-center gap-2'}>
                <div className={'lg:hidden cursor-pointer'} onClick={() => setOpenDrawer(true)}>
                    <PicLeftOutlined/>
                </div>
                <div>文件传输助手</div>
            </div>
            <div className={'px-[16px] py-[16px] flex items-start flex-row gap-[22px] overflow-y-auto'}>
                <div className={cx({
                    'flex flex-col gap-4 w-full': true,
                    'lg:max-w-[70%]': list.length > 0 && !loadingList
                })}>
                    {renderList()}
                </div>
            </div>
        </div>
        <FileTransferDlg dlg={dlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>
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

export default withRouter(FileTransfer);
