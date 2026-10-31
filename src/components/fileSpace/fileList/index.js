'use client'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
    Button,
    Col,
    Dropdown,
    Space,
    Table,
    Upload,
    Image,
    message,
    Modal,
    Spin,
    Input,
    Flex,
    Avatar,
    Tooltip, Breadcrumb, Segmented, Checkbox
} from "antd";
import React from "react";
import {
    CloudDownloadOutlined,
    DeleteOutlined,
    EditOutlined,
    SendOutlined,
    CloudUploadOutlined,
    FileOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    UnlockOutlined,
    FileZipOutlined,
    PicRightOutlined,
    AudioOutlined,
    LockOutlined,
    PlayCircleOutlined,
    MenuFoldOutlined,
    LoadingOutlined,
    MenuOutlined,
    EllipsisOutlined,
    PlusOutlined,
    UploadOutlined,
    UserOutlined,
    AntDesignOutlined,
    Loading3QuartersOutlined,
    ReloadOutlined,
    HistoryOutlined,
    StarOutlined,
    StarFilled,
    UserDeleteOutlined, LinkOutlined, AppstoreOutlined, BarsOutlined, DashOutlined
} from "@ant-design/icons";
import IconFont from "@/utils/iconFont";

import {useRouter, usePathname, useParams, useSearchParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {
    deleteFile,
    getFileListByCid,
    setFileIsPrivate,
    getAcsForUploadFile,
    getUploadMode,
    uploadFileToServer,
    addFile,
    clearFiles,
    getSumFileSize,
    setLoadingFiles,
    setOpenMobileDrawer,
    setOpenSidebar,
    getFileListBy,
    recoveryFile,
    favoriteFile
} from '@/lib/slices/fileSpaceSlice'
import FileDlg from '@/components/dialog/fileDlg'
import FileTaskDlg from "@/components/dialog/fileTaskDlg";
import FileCategoryDlg from "@/components/dialog/fileCategoryDlg";
import dayjs from "dayjs";
import Loading from "@/components/loading";
import {resetSearch, setSearchPanel} from "@/lib/slices/systemSlice";
import MenuAction from "@/components/menuAction";
import {generateGUID, getFileType} from "@/utils/help";
import classNames from "classnames/bind";
import _ from "lodash";
import {useSession} from "next-auth/react";

import OnlyOfficeDlg from "@/components/dialog/onlyOfficeDlg";
import styles from "./index.module.scss";
import {setDisplayMode} from "@/lib/slices/urlSpaceSlice";
import Empty from "@/components/empty";

const OSS = require('ali-oss');
const {confirm} = Modal;

const FileList = ({userInfo}) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [showTableTitle, setShowTableTitle] = useState(false)
    const [btnUploadDisabled, setBtnUploadDisabled] = useState(false)
    const [fileTaskDlg, setFileTaskDlg] = useState({
        show: false
    })
    const {data: session} = useSession()
    const {
        files,
        myFileSize,
        loadingFiles,
        loadingCategory,
        fileCategories,
        openMobileDrawer,
        openSidebar
    } = useSelector(state => state.fileSpace)
    const {isMobile, isXlScreen} = useSelector(state => state.system)
    const [tableHeight, setTableHeight] = useState(0)

    const [visibleImage, setVisibleImage] = useState({
        show: false,
        url: ''
    });

    const router = useRouter();
    const query = useSearchParams();
    const dispatch = useDispatch();
    const [actionItems, setActionItems] = useState([])
    const [dlg, setDlg] = useState({
        action: '',
        title: '',
        show: false,
        loading: false
    })
    const [dlgCategory, setCategoryDlg] = useState({
        action: '',
        title: '',
        show: false,
        loading: false
    })
    const [ossClient, setOssClient] = useState(null)
    const [uploadMode, setUploadMode] = useState('local')
    const [isServer, setServer] = useState(true)
    const uploadRef = useRef(null);

    const [officeOpen, setOfficeOpen] = useState(false);

    const [btnFavoriteTxt, setFavoriteTxt] = useState('')

    const [onlyOfficeDlg, setOnlyOfficeDlg] = useState({
        file: null,
        title: '',
        show: false
    })

    const [displayMode, setDisplayMode] = useState('app')
    const [chooseList, setChooseList] = useState([])
    useEffect(() => {
        document.addEventListener('paste', uploadFromPaste);
        initUploadMode()

        const screenHeight = window.innerHeight
        setTableHeight(screenHeight - 96)

        return () => {
            document.removeEventListener('paste', uploadFromPaste);
        }
    }, [])

    // 监听变化
    useEffect(() => {
        // 初始化两个面板的显示条件
        if (isMobile) {
            dispatch(setOpenSidebar(false))
            dispatch(setOpenMobileDrawer(false))
        } else {
            dispatch(setOpenSidebar(true))
            dispatch(setOpenMobileDrawer(false))
        }
    }, [isMobile]);

    useEffect(() => {
        let actions = []
        if (query.get('type') === 'trashbin') {
            actions.push({
                key: 'delete',
                label: '彻底删除',
                icon: <DeleteOutlined/>,
                danger: true
            })
        } else {
            actions.push({
                key: 'favorite',
                label: btnFavoriteTxt === '收藏' ? '收藏' : '取消收藏',
                icon: btnFavoriteTxt === '收藏' ? <StarOutlined/> : <StarFilled/>
            })
            actions.push({
                key: 'move',
                label: '移动',
                icon: <SendOutlined/>
            })
            actions.push({
                key: 'copyLink',
                label: '复制链接',
                icon: <LinkOutlined/>
            })
            // actions.push({
            //     key: 'share',
            //     label: '共享',
            //     icon: <UserAddOutlined/>
            // })
            // if (selectedRowKeys?.length <= 1) {
            //     actions.push({
            //         key: 'edit',
            //         label: '重命名',
            //         icon: <EditOutlined/>
            //     })
            // }
            actions.push({
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined/>,
                danger: true
            })
        }

        if (query.get('type') === 'personal') {
            actions.push({
                key: 'refresh',
                label: '刷新',
                icon: <ReloadOutlined/>
            })
        }

        setActionItems(actions)
    }, [selectedRowKeys, query.get('type')])

    // useEffect(() => {
    //     if (query.get('cid')) {
    //         // 获取文件列表数据
    //         dispatch(getFileListByCid({
    //             cid: query.get('cid')
    //         }))
    //
    //         setSelectedRowKeys([])
    //         setShowTableTitle(false)
    //         setBtnUploadDisabled(false)
    //     } else {
    //         setBtnUploadDisabled(true)
    //         dispatch(setLoadingFiles(false))
    //     }
    // }, [query.get('cid')])

    useEffect(() => {
        if (selectedRowKeys.length <= 0) {
            setShowTableTitle(false)
        }
    }, [selectedRowKeys])


    useEffect(() => {
        setShowTableTitle(false)
        setSelectedRowKeys([])
    }, [query.get("type"), query.get('fullPath')]);

    // const refreshListHandler = _.debounce(async (cid) => refreshList(cid), 1000)

    async function uploadFromPaste(event) {
        // todo: antd Upload后面版本会支持粘贴上传功能，那么到时候新版本发布再来改
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
            // event.preventDefault();
            // console.log('file=', file)
            // const totalSize = myFileSize + file.size
            // if (totalSize / 1024 / 1024 / 1024 > 5) {
            //     message.warning('存储空间不足');
            //     return false
            // }
            // const isLt100M = file.size / 1024 / 1024 > 100;
            // if (isLt100M) {
            //     message.warning('您的文件大小超过100Mb，请在我的文件中上传大文件！');
            //     return false
            // }
            // let fileType = getFileType(file.name)
            // let url = ''
            // if (fileType === 'image') {
            //     url = URL.createObjectURL(file);
            // }

            beforeUploadFile(file)

        } else {
            // message.error(`没有找到图片`);
        }
        console.log('file----', file)
    }

    function refreshList() {
        dispatch(getFileListBy({
            type: query.get('type') || 'personal',
            fullPath: query.get('fullPath') || '/'
        }))
        dispatch(getSumFileSize())
    }


    // 点击添加按钮
    function btnAdd() {
        setCategoryDlg({
            title: '添加文件分类',
            action: 'add',
            show: true,
            loading: false
        })
    }

    //初始化上传通道：后端返回 local 则走服务器直传，oss 则初始化 OSS STS 客户端
    async function initUploadMode() {
        let res = await dispatch(getUploadMode())
        // 查询文件空间大小
        dispatch(getSumFileSize())
        const mode = res.payload?.status === 0 ? (res.payload.data?.mode || 'local') : 'local'
        setUploadMode(mode)
        console.log('uploadMode=', mode)
        if (mode !== 'oss') {
            return
        }
        let acsRes = await dispatch(getAcsForUploadFile())
        console.log('initOss=', acsRes)
        if (acsRes.payload.status === 0) {
            const resData = acsRes.payload.data
            const client = new OSS({
                secure: true,
                // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
                region: 'oss-cn-hangzhou',
                // 从STS服务获取的临时访问密钥（AccessKey ID和AccessKey Secret）。
                accessKeyId: resData?.credentials?.accessKeyId,
                accessKeySecret: resData?.credentials?.accessKeySecret,
                // 从STS服务获取的安全令牌（SecurityToken）。
                stsToken: resData?.credentials?.securityToken,
                refreshSTSToken: async () => {
                    // 向您搭建的STS服务获取临时访问凭证。
                    const refreshRes = await dispatch(getAcsForUploadFile())
                    console.log('refreshSTSToken info=', refreshRes)
                    if (refreshRes.payload.status === 0) {
                        const refreshResData = refreshRes.payload.data
                        return {
                            accessKeyId: refreshResData?.credentials?.accessKeyId,
                            accessKeySecret: refreshResData?.credentials?.accessKeySecret,
                            stsToken: refreshResData?.credentials?.securityToken
                        }
                    }

                },
                // 刷新临时访问凭证的时间间隔，单位为毫秒。
                refreshSTSTokenInterval: 3000000,
                // 填写Bucket名称。
                bucket: 'com-seaurl-cdn'
            });
            if (client) {
                setOssClient(client)
            }
        }
    }

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        console.log('newSelectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
        setShowTableTitle(newSelectedRowKeys.length > 0)

        const fFilters = files.filter(item => newSelectedRowKeys.includes(item.id))

        const fs = fFilters.filter(f => f.isFavorite)
        setFavoriteTxt(fs.length === newSelectedRowKeys.length ? '取消收藏' : '收藏')
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        columnWidth: 60,
    };

    // 上传文件状态回调
    function onUploadFileChange(info) {
        console.log('info=', info)
        // 把没有status的文件过滤掉(没有status的文件说明是取消上传的文件)
        if (info.file.status) {
            setFileTaskDlg({
                show: true,
                task: info
            })
            if (info.file.status === 'done') {
                dispatch(getFileListBy({
                    type: query.get('type') || 'personal',
                    fullPath: query.get('fullPath') || '/'
                }))
            }
            if (info.file.status === 'error') {
                dispatch(getFileListBy({
                    type: query.get('type') || 'personal',
                    fullPath: query.get('fullPath') || '/'
                }))
            }
        }
    }

    // 上传文件前判断大小是否超限：local 模式经服务器中转限 200MB，oss 模式浏览器直传限 500MB
    function beforeUploadFile(file, fileList) {
        console.log('file size=', file.size)
        console.log('myFileSize =', myFileSize)
        const totalSize = myFileSize + file.size
        if (totalSize / 1024 / 1024 / 1024 > 5) {
            message.warning('存储空间不足');
            return false
        }
        const limitMb = uploadMode === 'oss' ? 500 : 200
        if (file.size / 1024 / 1024 > limitMb) {
            message.warning(`超过最大文件上传大小${limitMb}Mb`);
            return false
        }
        return true; // 不调用默认的上传方法
    }

    // 自定义上传（双通道）
    function uploadFileToOss(options) {
        console.log('options=', options)
        const {file, onProgress, onSuccess, onError} = options

        if (uploadMode === 'local') {
            return uploadToServer(options)
        }
        if (!ossClient) {
            onError(new Error('上传组件初始化中，请稍后重试'))
            return
        }

        return new Promise(async (resolve, reject) => {
            const guid = generateGUID()
            const filePath = `space/file/${userInfo.uid}/${dayjs().format("YYYYMMDDHHmmss")}/${guid.replaceAll("-", '_')}/${file.name}`
            const fileType = getFileType(file.name)
            let result = null;
            // 判断文件是否超过100mb，如果超过则使用分片上传，否则使用简单上传
            if (file.size / 1024 / 1024 > 100) {
                console.log('分片上传')
                // 分片上传，默认分片1Mb，如果想更改，请参考：https://help.aliyun.com/document_detail/383952.html
                result = await ossClient.multipartUpload(filePath, file, {
                    progress: async (percent) => {
                        onProgress({percent: percent * 100})
                    },
                }).catch((error) => {
                    onError(error)
                    reject(error)
                })
            } else {
                console.log('简单上传')
                // 简单上传
                result = await ossClient.put(filePath, file, {
                    progress: async (percent) => {
                        onProgress({percent: percent * 100})
                    },
                }).catch((error) => {
                    onError(error)
                    reject(error)
                })
            }
            await uploadFileCallback(result, {
                file,
                filePath,
                fileType
            }, (res) => {
                onSuccess(res)
                resolve(result)
                // 重新计算文件空间大小
                dispatch(getSumFileSize())
            })
        })
    }

    // 本地存储模式：multipart 直传服务器，后端落盘并写库
    async function uploadToServer(options) {
        const {file, onProgress, onSuccess, onError} = options
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fullPath', query.get('fullPath') || '/');
        formData.append('fileSize', String(file.size));
        formData.append('fileType', getFileType(file.name));
        try {
            const res = await dispatch(uploadFileToServer({
                formData,
                onProgress: (percent) => onProgress({percent})
            }))
            if (res.payload?.status === 0) {
                onSuccess({status: 200, name: file.name, url: res.payload.data?.url})
                dispatch(getSumFileSize())
            } else {
                onError(new Error(res.payload?.message || '上传失败'))
                message.error(res.payload?.message || '上传失败');
            }
        } catch (e) {
            onError(e)
            message.error('上传失败：' + e.message);
        }
    }

    async function uploadFileCallback(result, data, callback) {
        const ossPath = result.res.requestUrls[0].split('?')[0]
        const url = ossPath.replace(/^http:\/\//i, 'https://')
        const newFileRes = {
            status: result?.res?.status,
            name: result?.name,
            url: url,
        }
        // 上传成功之后往后台数据库插入一条文件数据
        await dispatch(addFile({
            fileName: data.file.name,
            filePath: data.filePath,
            fileSize: data.file.size,
            fileContentType: data.fileType,
            fullPath: query.get('fullPath')
        }))
        callback(newFileRes)
    }

// 编辑和移动文件成功回调
    function onFileSuccess(file) {
        console.log('file =', file)
        setSelectedRowKeys([])
        dispatch(getFileListBy({
            type: query.get('type') || 'personal',
            fullPath: query.get('fullPath') || '/',
        }))
        if (file && ['excel', 'word', 'ppt'].includes(file.type)) {
            console.log(' --- file ---', file)
            const screenWidth = window.screen.width
            const screenHeight = window.screen.height
            // setOnlyOfficeDlg({
            //     title: file.name,
            //     file: file,
            //     show: true
            // })
            window.open(`/fileSpace/onlyoffice?fileId=` + file.id, 'newWindow', 'width=' + screenWidth + ',height=' + screenHeight + ',menubar=no,toolbar=no,location=no')
            // router.push(`/fileSpace/onlyoffice?fileId=${file.id}`)
            // location.href=`/fileSpace/onlyoffice?fileId=${file.id}`
        }
    }

    function onCopyLink(e, id) {
        console.log('copyLink', e, id)
        if (selectedRowKeys.length <= 0 && !id) {
            message.warning('请先选择文件');
        } else {
            let _selectedRowKeys = []
            if (id) {
                _selectedRowKeys = [id]
            } else {
                _selectedRowKeys = selectedRowKeys
            }
            console.log('_selectedRowKeys=', _selectedRowKeys)

            const filterFiles = files.filter(item => _selectedRowKeys.includes(item.id))
            console.log('filterFiles=', filterFiles)
            if (filterFiles.length > 0 && filterFiles[0].url) {
                navigator.clipboard.writeText(filterFiles[0].url)
                    .then(() => {
                        // console.log('已复制: ' + text);
                        message.success('复制成功');
                    })
                    .catch((err) => {
                        message.error('复制失败');
                        console.error('复制失败: ', err);
                    });
            }
        }

    }

    function onDownload(e, id) {
        if (selectedRowKeys.length <= 0 && !id) {
            message.warning('请先选择文件');
        } else {
            let _selectedRowKeys = []
            if (id) {
                _selectedRowKeys = [id]
            } else {
                _selectedRowKeys = selectedRowKeys
            }
            console.log('_selectedRowKeys=', _selectedRowKeys)

            const filterFiles = files.filter(item => _selectedRowKeys.includes(item.id))
            console.log('filterFiles=', filterFiles)
            const hasFolder = filterFiles.some(s => s.type === 'folder')

            if (hasFolder || filterFiles.length > 1) {

                let name = '我的文件'
                if (query.get('type') === 'personal') {
                    name = '我的文件'
                }
                if (query.get('type') === 'collaborate') {
                    name = '协作文件夹'
                }
                if (query.get('type') === 'recent') {
                    name = '最近'
                }
                if (query.get('type') === 'favorites') {
                    name = '收藏'
                }
                // if (query.get('type') === 'fileTransfer') {
                //     name = '文件传输助手'
                // }
                if (query.get('type') === 'trashbin') {
                    name = '回收站'
                }
                if (query.get('fullPath') && query.get('fullPath').includes('/')) {
                    const s = query.get('fullPath').split('/')
                    name = s[s.length - 1]
                }
                // 如果包含文件夹则打包下载
                // 使用 fetch 发起请求
                fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/file/downloadZipFile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token-id': `${session?.accessToken}`,
                    },
                    body: JSON.stringify({
                        files: filterFiles,
                        downloadFileName: name
                    }), // 发送的参数
                })
                    .then(response => {
                        if (response.ok) {
                            return response.blob(); // 将响应转为 Blob
                        } else {
                            message.error('下载失败');
                        }
                    })
                    .then(blob => {
                        // 创建一个用于下载的 URL
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = name + '.zip';  // 指定下载文件的名称
                        document.body.appendChild(a);
                        a.click();  // 模拟点击
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url); // 释放内存
                    })
                    .catch(error => {
                        message.error('下载失败');
                    });

            } else {
                filterFiles.forEach(item => {
                    fetch(encodeURI(item.url))
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
                            link.download = item.name;
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            URL.revokeObjectURL(url); // 释放URL
                            document.body.removeChild(link);
                        })
                        .catch(error => {
                            console.error('Error downloading image:', error);
                        });
                })
            }
        }
    }

    async function onFavorite(e, id) {
        console.log('e=', e)
        let _selectedRowKeys = []
        if (id) {
            _selectedRowKeys = [id]
        } else {
            _selectedRowKeys = selectedRowKeys
        }
        let result = []
        const fFilters = files.filter(item => _selectedRowKeys.includes(item.id))
        console.log('fFilters =', fFilters)
        const fs = fFilters.filter(f => !f.isFavorite)
        console.log('_selectedRowKeys length = ', _selectedRowKeys.length)
        console.log('fs length = ', fs.length)

        // fs.length === 0说明全收藏过
        // _selectedRowKeys.length === fs.length说明全部未收藏过
        if (fs.length === 0 || _selectedRowKeys.length === fs.length) {
            result = fFilters
        } else {
            // 说明只有部分收藏过，那么这里就把未收藏的查出来发送给后台收藏
            result = fs
        }
        if (_selectedRowKeys.length > 0) {
            const res = await dispatch(favoriteFile({
                files: result
            }))
            if (res.payload.data) {
                setSelectedRowKeys([])
                message.success(fs.length === 0 ? '取消收藏成功' : '收藏成功');
                dispatch(getFileListBy({
                    type: query.get('type') || 'personal',
                    fullPath: query.get('fullPath') || '/'
                }))
            } else {
                message.warning(res.payload.message || res.payload.errorMsg)
            }
        } else {
            message.warning('没有找到相关文件');
        }
    }

    function onMove(e, id) {
        let _selectedRowKeys = []
        if (id) {
            _selectedRowKeys = [id]
        } else {
            _selectedRowKeys = selectedRowKeys
        }
        console.log('selectedRowKeys---', selectedRowKeys)
        const fFilters = files.filter(item => _selectedRowKeys.includes(item.id))
        console.log('file =', fFilters)
        if (_selectedRowKeys.length > 0 && fFilters.length > 0) {
            setDlg({
                title: '移动文件',
                action: 'move',
                show: true,
                loading: false,
                files: fFilters,
                // categoryId: file[0].categoryId
            })
        } else {
            message.warning('没有找到相关文件');
        }
    }

// 重命名
    function onRename(e, id) {
        // const res = await dispatch(deleteFile({
        //   id: selectedRowKeys,
        //   name:
        // }));
        const fileId = id || selectedRowKeys[0]
        const file = files.filter(item => item.id === fileId)
        console.log('find out file =', file)
        if (file.length > 0) {
            setDlg({
                title: '编辑文件名',
                action: 'edit',
                show: true,
                loading: false,
                id: fileId,
                name: file[0].name
            })
        } else {
            message.warning('没有找到相关文件');
        }
    }

    async function onPublic() {
        if (selectedRowKeys.length <= 0) {
            message.warning('请先选择文件');
        } else {
            const res = await dispatch(setFileIsPrivate({
                fileIds: selectedRowKeys,
                isPrivate: false
            }))
            if (res.payload.status === 0) {
                message.success('设置公开文件成功');
                dispatch(getFileListBy({
                    type: query.get('type'),
                    fullPath: query.get('fullPath')
                }))
            } else {
                message.warning(res.payload.message)
            }
        }
    }

    // async function onPrivate() {
    //     if (selectedRowKeys.length <= 0) {
    //         message.warning('请先选择文件');
    //     } else {
    //         const res = await dispatch(setFileIsPrivate({
    //             fileIds: selectedRowKeys,
    //             isPrivate: true
    //         }))
    //         if (res.payload.status === 0) {
    //             message.success('设置私有文件成功');
    //             dispatch(getFileListBy({
    //                 type: query.get('type'),
    //                 fullPath: query.get('fullPath')
    //             }))
    //         } else {
    //             message.warning(res.payload.message)
    //         }
    //     }
    // }

// 删除
    function onDelete(e, id) {
        console.log('selectedRowKeys=', selectedRowKeys)
        if (selectedRowKeys.length <= 0 && !id) {
            message.warning('请先选择文件');
        } else {
            let _selectedRowKeys = []
            if (id) {
                _selectedRowKeys = [id]
            } else {
                _selectedRowKeys = selectedRowKeys
            }
            confirm({
                title: `您确定要删除？`,
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                    return new Promise(async (resolve, reject) => {
                        const fFilters = files.filter(item => _selectedRowKeys.includes(item.id))

                        const res = await dispatch(deleteFile({
                            files: fFilters,
                            deleteType: query.get('type') === 'trashbin' ? 'thoroughly' : 'delete'
                        }));
                        if (res.payload.data) {
                            setSelectedRowKeys([])
                            message.success('删除成功', 5);
                            dispatch(getFileListBy({
                                type: query.get('type') || 'personal',
                                fullPath: query.get('fullPath') || '/'
                            }))

                            dispatch(getSumFileSize())
                        } else {
                            message.warning(res.payload.message || res.payload.errorMsg)
                        }
                        resolve()
                    })

                }
            });
        }
    }

//
//     function getTableTitle() {
//         return <div className={'flex items-center justify-between'}>
//             <Space size={12}>
//                 <Button icon={<CloudDownloadOutlined/>} onClick={onDownload}>下载</Button>
//                 <Button icon={<SendOutlined/>} onClick={onMove}>移动</Button>
//                 <Button icon={<DeleteOutlined/>} onClick={onDelete}>删除</Button>
//                 {/*<Button icon={<UnlockOutlined/>} onClick={onPublic}>公开</Button>*/}
//                 {/*<Button icon={<LockOutlined/>} onClick={onPrivate}>私有</Button>*/}
//                 {selectedRowKeys.length <= 1 ? <Button icon={<EditOutlined/>} onClick={onRename}>重命名</Button> : null}
//             </Space>
//             <div className={''}>
//                 已选择<span className={'font-medium text-md px-1'}>{selectedRowKeys.length}</span>项
//             </div>
//         </div>
//     }

//把字节转换成正常文件大小
    function convertSize(size) {
        if (!size) return "";
        let num = 1024.00; //byte
        if (size < num)
            return size + "B";
        if (size < Math.pow(num, 2))
            return (size / num).toFixed(2) + "KB"; //kb
        if (size < Math.pow(num, 3))
            return (size / Math.pow(num, 2)).toFixed(2) + "MB"; //M
        if (size < Math.pow(num, 4))
            return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
        return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
    }

    function showDefaultImg(e) {
        return e.target.src = 'https://cdn.seaurl.com/space/file/default/error.png?x-oss-process=style/100X100'
    }

    function renderMenus(dom, d, qType) {
        // setSelectedRowKeys(newSelectedRowKeys);
        if (d?.isDelete) {
            return <MenuAction
                // 使用key的目的是重新渲染
                key={`isDelete-${d.id}`}
                data={d}
                recovery={onRecovery}
                thoroughly={onDelete}
                action={['recovery', 'thoroughly']}>
                {dom}
            </MenuAction>
        } else if (qType === 'sharingout') {
            return <MenuAction
                // 使用key的目的是重新渲染
                key={`sharingout-${d.id}`}
                data={d}
                download={onDownload}
                action={['download']}>
                {dom}
            </MenuAction>
        } else {
            let actions = ['edit', 'favorite', 'move', 'download', 'copyLink', 'delete']
            return <MenuAction
                // 使用key的目的是重新渲染
                key={`else-${d.id}`}
                data={d}
                edit={onRename}
                delete={onDelete}
                move={onMove}
                favorite={onFavorite}
                download={onDownload}
                copyLink={onCopyLink}
                action={actions}>
                {dom}
            </MenuAction>
        }
    }

    function openFile(d) {
        // 设置URL的有效时长为3600，单位为秒。如果不设置有效时长，则默认值为1800。
        // 参考：https://help.aliyun.com/document_detail/64052.html
        // const url = ossClient.signatureUrl(d.path, {expires: 3600});

        if (['word', 'excel', 'ppt', 'pdf'].includes(d.type)) {
            // 获取屏幕的宽度和高度
            const screenWidth = window.screen.width
            const screenHeight = window.screen.height
            // 备选：https://docs.google.com/viewer?url=
            // window.open(`https://view.officeapps.live.com/op/view.aspx?src=${url}`, '_blank')
            window.open(`/fileSpace/onlyoffice?fileId=${d.id}`, 'newWindow', "width=" + screenWidth + ",height=" + screenHeight + ",menubar=no,toolbar=no,location=no")
            // router.push(`/fileSpace/onlyoffice?fileId=${d.id}`)
            // location.href=`/fileSpace/onlyoffice?fileId=${d.id}`

            // console.log(' --- file ---', d)
            // setOnlyOfficeDlg({
            //     file: d,
            //     title: d.name,
            //     show: true
            // })
        }
        if (d.type === 'video') {
            console.log('location=', location)
            window.open(`${d.url}`, '_blank')
        }
        if (d.type === 'folder') {

            // if (query.get('type') === 'trashbin') {
            //     return
            // }

            const urlParams = {
                type: query.get('type') || 'personal',
                fullPath: d.fullPath
            }
            const queryString = new URLSearchParams(urlParams)
            router.push(`/fileSpace?${queryString}`)

            dispatch(getFileListBy({
                type: query.get('type') || 'personal',
                fullPath: d.fullPath
            }))
            dispatch(getSumFileSize())

        }
        console.log(d.url);
    }

    function renderPrev(text, d, i, qType) {
        if (d.type.includes('image')) {
            return <div className={classNames({
                'flex ': true,
                'items-center justify-between pr-2': displayMode === 'list',
                'w-full': displayMode === 'app'
            })}>
                <div className={classNames({
                    'flex ': true,
                    'flex-col gap-1 items-center w-full': displayMode === 'app',
                    'items-center w-[80%] gap-4 truncate': displayMode === 'list'
                })}>
                    <img width={displayMode === 'app' ? 66 : 36}
                         height={displayMode === 'app' ? 66 : 36}
                         className={classNames({
                             'cursor-pointer': true,
                             'rounded-xl': displayMode === 'app'
                         })}
                         onClick={() => {
                             setVisibleImage({
                                 url: encodeURI(d.url),
                                 show: true
                             })
                         }}
                         src={`${encodeURI(d.url)}?x-oss-process=style/${displayMode === 'app' ? '60X60' : '30X30'}`}
                         onError={showDefaultImg}/>
                    {/*{d.isPrivate ? <LockOutlined/> : null}*/}
                    <span className={classNames({
                        'dark:text-white cursor-pointer': true,
                        'line-clamp-2 break-all text-sm text-[#646262]': displayMode === 'app',
                        'truncate': displayMode === 'list',
                    })} title={text} onClick={() => {
                        setVisibleImage({
                            url: encodeURI(d.url),
                            show: true
                        })
                    }}>{text}</span>
                </div>
                {
                    displayMode === 'list' ? <div className={'text-xl flex items-center gap-2'}>
                        {
                            qType !== 'sharingout' ? <>
                                {d.isFavorite ? <span className={'text-[#faca08]'}><StarFilled/></span> : null}
                            </> : null
                        }

                        {!isMobile ? renderMenus(<EllipsisOutlined/>, d, qType) : null}
                    </div> : null
                }
            </div>
        } else {
            let icon = <IconFont type={'icon-unknown'} className={classNames({
                'text-4xl': displayMode === 'list',
                'text-5xl': displayMode === 'app',
            })}/>
            if (d.type.includes('folder')) {
                icon = <IconFont type="icon-folder" className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('xml')) {
                icon = <IconFont type="icon-xml" className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('video')) {
                icon = <IconFont type="icon-video" className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('audio')) {
                icon = <IconFont type={'icon-audio'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('txt')) {
                icon = <IconFont type={'icon-txt'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('pdf')) {
                icon = <IconFont type={'icon-pdf'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('excel')) {
                icon = <IconFont type={'icon-excel'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('word')) {
                icon = <IconFont type={'icon-word'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('ppt')) {
                icon = <IconFont type={'icon-ppt'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            if (d.type.includes('zip')) {
                icon = <IconFont type={'icon-zip'} className={classNames({
                    'text-4xl': displayMode === 'list',
                    'text-5xl': displayMode === 'app',
                })}/>
            }
            return <div className={classNames({
                'flex ': true,
                'items-center justify-between pr-2': displayMode === 'list',
                'w-full': displayMode === 'app'
            })}>
                <div className={classNames({
                    'flex': true,
                    'flex-col gap-1 items-center w-full': displayMode === 'app',
                    'items-center w-[80%] gap-4 truncate': displayMode === 'list'
                })}>
                    <div
                        className={classNames({
                            'flex items-center justify-center dark:border-[#474747] relative cursor-pointer': true,
                            'w-[36px] h-[36px]': displayMode === 'list',
                            'w-[66px] h-[66px]': displayMode === 'app',
                        })} onClick={() => {
                        openFile(d)
                    }}>
                        {icon}
                    </div>

                    {/*{d.isPrivate ? <LockOutlined/> : null}*/}
                    <span title={text} className={classNames({
                        'dark:text-white cursor-pointer': true,
                        'line-clamp-2 break-all text-sm text-[#646262]': displayMode === 'app',
                        'truncate': displayMode === 'list',
                        'cursor-pointer': ['word', 'excel', 'ppt', 'pdf', 'folder'].includes(d.type)
                    })}
                          onClick={() => {
                              openFile(d)
                          }}>{text}</span>
                </div>
                {
                    displayMode === 'list' ? <div className={'text-xl flex items-center gap-2'}>
                        {
                            qType !== 'sharingout' ? <>
                                {d.isFavorite ?
                                    <span className={'text-xl text-[#faca08]'}><StarFilled/></span> : null}
                            </> : null
                        }

                        {!isMobile ? renderMenus(<EllipsisOutlined/>, d, qType) : null}
                    </div> : null
                }
            </div>
        }
    }

    function renderIcon() {
        if (isMobile) {
            return !openMobileDrawer ? <MenuOutlined/> : <MenuFoldOutlined/>
        } else {
            return !openSidebar ? <MenuOutlined/> : <MenuFoldOutlined/>
        }
    }

    function onMenuClick(e) {
        console.log('e---', e)
        if (e?.key === 'move') {
            onMove()
        }
        if (e?.key === 'edit') {
            onRename()
        }
        if (e?.key === 'delete') {
            onDelete()
        }
        if (e?.key === 'refresh') {
            refreshList()
        }
        if (e?.key === 'copyLink') {
            onCopyLink()
        }
    }

    function goto(fullPath) {
        fullPath += "/"
        console.log('fullpath=', fullPath)
        const urlParams = {
            type: query.get('type') || 'personal'
        }
        if (fullPath) {
            urlParams.fullPath = fullPath
        }
        const queryString = new URLSearchParams(urlParams)
        router.push(`/fileSpace?${queryString}`)
        dispatch(getFileListBy({
            type: query.get('type') || 'personal',
            fullPath: fullPath || "/"
        }))
        dispatch(getSumFileSize())
    }

    function getBreadcrumbItems() {
        const fullPath = query.get('fullPath')
        console.log('fullPath=', fullPath)
        let items = []
        let title = <span className={'cursor-pointer'} onClick={() => goto("")}>我的文件</span>
        if (query.get('type') === 'personal') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>我的文件</span>
        }
        if (query.get('type') === 'collaborate') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>协作文件夹</span>
        }
        if (query.get('type') === 'recent') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>最近</span>
        }
        if (query.get('type') === 'favorites') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>收藏</span>
        }
        if (query.get('type') === 'share') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>共享</span>
        }
        if (query.get('type') === 'trashbin') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>回收站</span>
        }
        if (query.get('type') === 'sharingin') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>你共享的</span>
        }
        if (query.get('type') === 'sharingout') {
            title = <span className={'cursor-pointer'} onClick={() => goto("")}>共享给你的</span>
        }
        items.push({
            title: title,
        })

        let fp = fullPath?.split('/')
        console.log('fp =', fp)
        if (fp?.length > 0) {
            fp = fp.filter(f => f.trim() !== '')
        }

        let currentPath = ''
        if (isXlScreen) {
            fp?.forEach(item => {
                if (item) {
                    // 更新当前路径
                    currentPath += `/${item}`;
                    let path = currentPath
                    items.push({
                        title: <span className={'cursor-pointer'} onClick={() => goto(path)}>{item}</span>,
                    })
                }
            })
        }
        // 如果大于2个且是小屏则使用下拉菜单显示面包屑
        else if (fp?.length > 2) {
            let menus = []
            fp?.forEach((item, index) => {
                if (item && fp.length - 1 !== index) {
                    // 更新当前路径
                    currentPath += `/${item}`;
                    let path = currentPath
                    menus.push({
                        key: index,
                        label: item,
                        onClick: () => goto(path)
                    })
                }
            })

            items.push({
                title: <EllipsisOutlined/>,
                dropdownProps: {
                    arrow: true,
                    placement: 'bottomLeft'
                },
                menu: {items: menus},
            },)

            items.push({
                title: <span className={'cursor-pointer'}>{fp[fp.length - 1]}</span>,
            })
        } else {
            fp?.forEach(item => {
                if (item) {
                    // 更新当前路径
                    currentPath += `/${item}`;
                    let path = currentPath
                    items.push({
                        title: <span className={'cursor-pointer'} onClick={() => goto(path)}>{item}</span>,
                    })
                }
            })
        }
        return items
    }

    async function onRecovery(e, id) {
        if (selectedRowKeys.length <= 0 && !id) {
            message.warning('请先选择文件');
        } else {
            let _selectedRowKeys = []
            if (id) {
                _selectedRowKeys = [id]
            } else {
                _selectedRowKeys = selectedRowKeys
            }
            const fFilters = files.filter(item => _selectedRowKeys.includes(item.id))
            const res = await dispatch(recoveryFile({
                files: fFilters,
            }))
            if (res.payload.data) {
                setSelectedRowKeys([])
                message.success('恢复成功', 5);
                dispatch(getFileListBy({
                    type: query.get('type') || 'personal',
                    fullPath: query.get('fullPath') || '/'
                }))

                dispatch(getSumFileSize())
            } else {
                message.warning(res.payload.message || res.payload.errorMsg)
            }
        }
    }

    return <div className={classNames(styles.container, 'h-full')}>
        {/*{*/}
        {/*    query.get('cid') ?*/}
        <div className={'h-full flex flex-col overflow-hidden'}>
            <div
                className={'w-full px-[12px] shrink-0 inline-flex items-center justify-between border-b border-[#e9e9e9] h-[60px] dark:border-[#474747]'}>
                <div className={'flex items-center gap-[12px]'}>
                    <div
                        className={'cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2E333C] w-[36px] h-[36px] rounded-full flex items-center justify-center'}
                        onClick={() => {
                            if (isMobile) {
                                dispatch(setOpenMobileDrawer(!openMobileDrawer))
                                dispatch(setOpenSidebar(false))
                            } else {
                                dispatch(setOpenMobileDrawer(false))
                                dispatch(setOpenSidebar(!openSidebar))
                            }
                        }}>
                        {renderIcon()}
                    </div>
                    {
                        !query.get('type') || query.get('type') === 'personal' ? <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: '0',
                                        label: '上传文件',
                                        icon: <UploadOutlined style={{fontSize: '18px'}}/>,
                                        onClick: () => {
                                            uploadRef.current.click();
                                        }
                                    },
                                    {
                                        key: '33',
                                        label: '文件夹',
                                        icon: <IconFont type={'icon-folder'} style={{fontSize: '18px'}}/>,
                                        onClick: () => {
                                            // uploadRef.current.click();
                                            setDlg({
                                                title: '新建文件夹',
                                                action: 'new',
                                                show: true,
                                                loading: false,
                                                name: '文件夹',
                                                type: 'folder',
                                                fullPath: query.get('fullPath') || '/',
                                            })
                                        }
                                    },
                                    {
                                        type: 'divider',
                                    },
                                    {
                                        key: '32',
                                        label: '文本',
                                        icon: <IconFont type={'icon-txt'} style={{fontSize: '18px'}}/>,
                                        onClick: () => {
                                            setDlg({
                                                title: '新建文本文件',
                                                action: 'new',
                                                show: true,
                                                loading: false,
                                                name: '文本.txt',
                                                type: 'txt',
                                                fullPath: query.get('fullPath') || '/',
                                            })
                                        }
                                    },
                                    {
                                        key: '1',
                                        label: '文档',
                                        icon: <IconFont type={'icon-word'} style={{fontSize: '18px'}}/>,
                                        onClick: () => {
                                            setDlg({
                                                title: '新建文档',
                                                action: 'new',
                                                show: true,
                                                loading: false,
                                                name: '文档.docx',
                                                type: 'word',
                                                fullPath: query.get('fullPath') || '/'
                                            })
                                        }
                                    },
                                    {
                                        key: '2',
                                        label: '表格',
                                        icon: <IconFont type={'icon-excel'} style={{fontSize: '18px'}}/>,
                                        onClick: () => {
                                            setDlg({
                                                title: '新建表格',
                                                action: 'new',
                                                show: true,
                                                loading: false,
                                                name: '表格.xlsx',
                                                type: 'excel',
                                                fullPath: query.get('fullPath') || '/'
                                            })
                                        }
                                    },
                                    {
                                        key: '3',
                                        label: '幻灯片',
                                        icon: <IconFont type={'icon-ppt'} style={{fontSize: '18px'}}/>,
                                        onClick: () => {
                                            setDlg({
                                                title: '新建幻灯片',
                                                action: 'new',
                                                show: true,
                                                loading: false,
                                                name: '幻灯片.pptx',
                                                type: 'ppt',
                                                fullPath: query.get('fullPath') || '/'
                                            })
                                        }
                                    },
                                ], onClick: onMenuClick
                            }} trigger={'click'}>
                            <div>
                                <Button type="primary" shape="round" icon={<PlusOutlined/>}>新建</Button>
                            </div>
                        </Dropdown> : null
                    }


                    {/*{fileCategories.length <= 0 ? '提示：请先添加分类' : ''}*/}
                    {/*<Button size={'large'} icon={<SendOutlined/>} onClick={onMove}>移动</Button>*/}
                    {showTableTitle ?
                        <div className={'xl:hidden block'}>
                            <Dropdown.Button
                                menu={{
                                    items: actionItems,
                                    onClick: onMenuClick,
                                }}>
                                <div className={'flex items-center gap-2'}>
                                    {query.get('type') === 'trashbin' ? <>
                                        <HistoryOutlined onClick={onRecovery}/><span>恢复</span>
                                    </> : <>
                                        <CloudDownloadOutlined onClick={onDownload}/><span>下载</span>
                                    </>}
                                </div>
                            </Dropdown.Button>
                        </div> : null
                    }

                    {showTableTitle ? <div className={'xl:flex hidden gap-[12px]'}>
                        {
                            query.get('type') !== 'trashbin' ? <>
                                    <Button size={'middle'} shape="round" icon={<CloudDownloadOutlined/>}
                                            onClick={onDownload}>下载</Button>
                                    {!['sharingout'].includes(query.get('type')) ? <>
                                        <Button size={'middle'} shape="round"
                                                icon={btnFavoriteTxt === '收藏' ? <StarOutlined/> : <StarFilled/>}
                                                onClick={onFavorite}>{btnFavoriteTxt}</Button>
                                        <Button size={'middle'} shape="round" icon={<SendOutlined/>}
                                                onClick={onMove}>移动</Button>
                                        {/*<Button size={'middle'} shape="round" icon={<UserAddOutlined/>}*/}
                                        {/*        onClick={onShare}>共享</Button>*/}
                                    </> : null}
                                    {/*<Button icon={<UnlockOutlined/>} onClick={onPublic}>公开</Button>*/}
                                    {/*<Button icon={<LockOutlined/>} onClick={onPrivate}>私有</Button>*/}
                                    {/*{selectedRowKeys.length <= 1 ?*/}
                                    {/*    <Button size={'middle'} shape="round" icon={<EditOutlined/>}*/}
                                    {/*            onClick={onRename}>重命名</Button> : null}*/}
                                </> :
                                <Button size={'middle'} shape="round" icon={<HistoryOutlined/>}
                                        onClick={onRecovery}>恢复</Button>
                        }

                        {
                            query.get("type") !== 'sharingout' ?
                                <Button size={'middle'} shape="round" type={'primary'} icon={<DeleteOutlined/>}
                                        onClick={onDelete}
                                        danger>{query.get('type') === 'trashbin' ? '彻底删除' : '删除'}</Button> : null
                        }
                    </div> : null}
                    {!showTableTitle || query.get('type') !== 'personal' ?
                        <Button shape="round" icon={<ReloadOutlined/>} onClick={refreshList}>刷新</Button> : null}
                </div>
                <Space>
                    {/*<Input style={{width: '320px'}} placeholder={'请输入搜索内容'}/>*/}

                    <div className={'flex items-center gap-2'}>
                        {
                            files.length > 0 ? <div className={'flex items-center gap-3'}>
                                {
                                    !isMobile && showTableTitle ?
                                        <div className={'flex items-center text-sm'}>已选择<span
                                            className={'font-medium px-1'}>{selectedRowKeys.length}</span>项
                                            <div className={'flex px-1'}>/</div>
                                        </div> : null
                                }
                                <div className={'flex items-center text-sm'}>
                                    共<span className={''}>{files.length}</span>项
                                </div>
                                <Segmented
                                    value={displayMode}
                                    options={[
                                        {
                                            value: 'app',
                                            icon: <AppstoreOutlined/>,
                                        }, {
                                            value: 'list',
                                            icon: <BarsOutlined/>,
                                        }
                                    ]}
                                    onChange={(v) => {
                                        console.log('v=', v)
                                        setDisplayMode(v)
                                    }}
                                />
                            </div> : null
                        }
                    </div>
                </Space>
            </div>
            {
                displayMode === 'app' || displayMode === 'list' ?
                    <div className={'w-full p-3 shrink-0 font-semibold border-b border-[#e9e9e9] dark:border-[#474747]'}>
                        <Breadcrumb items={getBreadcrumbItems()}/>
                    </div> : null
            }
            {
                displayMode === 'app' && loadingFiles ? <div className={'flex items-center justify-center pt-16'}>
                    <LoadingOutlined
                        style={{
                            fontSize: 36,
                        }}
                        spin
                    />
                </div>: null
            }
            {
                displayMode === 'app' && !loadingFiles ?
                    files.length > 0 ?
                        <Checkbox.Group className={'w-full h-full flex flex-col overflow-hidden'} value={selectedRowKeys} onChange={(list) => {
                            setSelectedRowKeys(list)
                            setShowTableTitle(list.length > 0)

                            const fFilters = files.filter(item => list.includes(item.id))

                            const fs = fFilters.filter(f => f.isFavorite)
                            setFavoriteTxt(fs.length === list.length ? '取消收藏' : '收藏')
                        }}>
                            <div
                                className={'grid grid-cols-auto-150 auto-rows-max gap-y-[16px] gap-x-[12px] w-full overflow-y-auto flex-1 min-h-0 p-4'}>
                                {
                                    files.map((item, index) => {
                                        return <div className={classNames({
                                            'group p-2 hover:bg-[#eee] dark:hover:bg-[#2E333D] rounded-xl relative': true,
                                            'bg-[#eee] dark:bg-[#2E333D]': selectedRowKeys.includes(item.id)
                                        })}>
                                            <div className={classNames({
                                                'absolute top-2 left-2 group-hover:block ': true,
                                                'hidden': !selectedRowKeys.includes(item.id),
                                                'block ': selectedRowKeys.includes(item.id),
                                            })}><Checkbox value={item.id}></Checkbox></div>
                                            {renderPrev(item.name, item, index, query.get('type'))}
                                        </div>
                                    })
                                }
                            </div>
                        </Checkbox.Group> : <div>
                            <Empty/>
                        </div> : null
            }
            {
                displayMode === 'list' ? <div className={'w-full pb-[12px] flex-1 min-h-0 overflow-hidden'}>
                    <div className={'w-full'}>
                        <Table title={null}
                               bordered={false}
                               virtual
                               size={'large'}
                               showHeader={true}
                               loading={{
                                   spinning: loadingFiles,
                                   indicator: <LoadingOutlined
                                       style={{
                                           fontSize: 36,
                                       }}
                                       spin
                                   />
                               }}
                               rowKey={'id'}
                               rowSelection={rowSelection}
                               columns={[
                                    {
                                        title: getBreadcrumbItems().length > 1
                                            ? getBreadcrumbItems()[getBreadcrumbItems().length - 1]?.title || '名称'
                                            : '名称',
                                        dataIndex: 'name',
                                        // width: '35%',
                                        align: 'left',
                                        ellipsis: true,
                                        render: (text, record, index) => renderPrev(text, record, index, query.get('type'))
                                    },
                                   {
                                       title: '大小',
                                       dataIndex: 'size',
                                       align: 'center',
                                       width: isXlScreen ? 200 : 80,
                                       hidden: isMobile,
                                       ellipsis: true,
                                       render: (val, d, i) => {
                                           return <span>{val ? convertSize(val) : val === 0 && d?.type !== 'folder' ? '0KB' : '-'}</span>
                                       }
                                   },
                                   {
                                       title: '修改时间',
                                       dataIndex: 'updatedDt',
                                       width: isXlScreen ? 200 : 80,
                                       align: 'center',
                                       hidden: isMobile,
                                       ellipsis: true,
                                       render: (text, record, index) => {
                                           // console.log('record=', record)
                                           // console.log('session=', session)
                                           if (['sharingin', 'sharingout'].includes(query.get('type'))) {
                                               if (record?.shareToFriends?.length > 0) {
                                                   if ('sharingout' === query.get('type')) {
                                                       let fs = record.shareToFriends.filter(f => f.uid === session?.user?.uid)
                                                       // console.log('fs-', fs)
                                                       if (fs?.length > 0 && fs[0].shareDt) {
                                                           return <span>{dayjs(dayjs.utc(fs[0].shareDt).local()).fromNow()}</span>
                                                       }
                                                   } else {
                                                       let dt = record.shareToFriends[0].shareDt
                                                       return <span>{dayjs(dayjs.utc(dt).local()).fromNow()}</span>
                                                   }
                                               }
                                               return <span>-</span>
                                           } else {
                                               return <span>{dayjs(dayjs.utc(text).local()).fromNow()}</span>
                                           }
                                       },
                                   },
                                   // {
                                   //   title: '是否公开',
                                   //   dataIndex: 'isPrivate',
                                   //   width: '15%',
                                   //   align: 'center',
                                   //   ellipsis: true,
                                   //   render: (val) => {
                                   //     return <span>{!val?'公开':'私有'}</span>
                                   //   }
                                   // }
                               ]}
                               dataSource={files}
                               pagination={false}
                            // footer={() => {
                            //      return <div className={'flex items-center justify-end gap-2'}>
                            //         {
                            //             files.length > 0 ? <div className={'flex items-center'}>
                            //             {
                            //                 showTableTitle? <div className={'flex items-center text-sm'}>已选择<span
                            //                     className={'font-medium px-1'}>{selectedRowKeys.length}</span>项
                            //                     <div className={'flex px-1'}>/</div>
                            //                 </div> : null
                            //             }
                            //                 <div className={'flex items-center text-sm'}>
                            //                 共<span
                            //                 className={''}>{files.length}</span>项
                            //             </div>
                            //         </div> : null
                            //         }
                            //     </div>
                            // }}
                               scroll={{y: tableHeight}}
                        />
                    </div>
                </div> : null
            }
        </div>
        {/*// : <div className={'flex items-center justify-center h-[calc(100vh-56px)]'}>
         <div className={'inline-block text-[#333] dark:text-white text-xl font-bold'}>请先选择文件分类，或者<span
                className={'text-[#54458a] cursor-pointer'}
        //         onClick={btnAdd}>创建</span>新的文件分类
        //     </div>
        // </div>*/}
        {/*}*/}
        <FileDlg dlg={dlg} success={onFileSuccess}/>
        <FileTaskDlg dlg={fileTaskDlg}/>
        <FileCategoryDlg dlg={dlgCategory}/>
        {
            visibleImage.show ? <Image
                style={{display: 'none'}}
                src={encodeURI(visibleImage.url)}
                preview={{
                    visible: visibleImage.show,
                    src: visibleImage.url,
                    onVisibleChange: value => {
                        setVisibleImage({
                            ...visibleImage,
                            show: value
                        });
                    },
                }}
            /> : null
        }

        <Upload
            multiple
            beforeUpload={beforeUploadFile}
            customRequest={uploadFileToOss}
            showUploadList={false}
            withCredentials={true}
            disabled={btnUploadDisabled}
            onChange={onUploadFileChange}>
            {/*<Button size={'middle'} type={'primary'} icon={<CloudUploadOutlined/>}*/}
            {/*        disabled={fileCategories.length <= 0}>上传文件</Button>*/}
            <div ref={uploadRef}/>
        </Upload>
        <OnlyOfficeDlg dlg={onlyOfficeDlg}/>
    </div>

}

export default FileList
