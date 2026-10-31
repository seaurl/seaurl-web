'use client'
import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import styles from "./index.module.scss";
import {message, Spin, Tooltip} from "antd";
import {CloudUploadOutlined, LoadingOutlined, VerticalAlignBottomOutlined} from "@ant-design/icons";
import IconFont from "@/utils/iconFont";
import {setMailMessageUrl, uploadAttachment} from "@/lib/slices/mailSpaceSlice";
import {getFileType, isHTML} from "@/utils/help";

const Index = () => {
    const {
        showSidebar,
        openSidebarDrawer,
        openMailMessageListDrawer,
        chooseMailMessage
    } = useSelector(state => state.mailSpace)
    const dispatch = useDispatch()

    const containerRef = useRef();
    const [fileList, setFileList] = useState([]);
    const [uploadFileId, setUploadFileId] = useState('');
    const abortControllerRef = useRef(null)

    useEffect(() => {
        return () => {
            if (abortControllerRef.current?.abort) {
                abortControllerRef.current.abort();
            }
        }
    }, [])

    useEffect(() => {
        // 中止之前的请求，防止内存溢出
        if (abortControllerRef.current?.abort) {
            abortControllerRef.current.abort();
        }
        // 确保 Shadow DOM 已经被创建
        let shadowRoot = containerRef.current.shadowRoot;
        if (!shadowRoot) {
            shadowRoot = containerRef.current.attachShadow({mode: "open"});
        }
        const content = chooseMailMessage.content.trim();
        if (content) {
            // 1. 统计 HTML 标签数量
            const htmlTags = content.match(/<\/?[a-z][\s\S]*?>/gi) || [];
            const htmlTagCount = htmlTags.length;

            // 2. 统计 `<<<` 和 `>>>` 出现次数
            const protocolMatches = content.match(/<<</g) || [];
            const protocolCount = protocolMatches.length;

            // 3. 确定是否是 HTML
            const isHtml = htmlTagCount > protocolCount;

            // console.log("HTML 标签数:", htmlTagCount, "协议符号数:", protocolCount, "最终判断 isHtml:", isHtml);

            shadowRoot.innerHTML = isHtml
                ? content // 直接插入 HTML
                : content.replace(/\r\n|\r|\n/g, "<br>"); // 替换换行符
        }

        // 初次渲染时设置
        updateLinks(shadowRoot);
        //
        // // 监听 content 动态更新时再执行
        // new MutationObserver(updateLinks).observe(shadowRoot, {childList: true, subtree: true});
    }, [chooseMailMessage]);

    // 确保每次内容更新时处理 <a> 标签,设置成打开新标签页
    const updateLinks = (shadowRoot) => {
        if (shadowRoot?.querySelectorAll) {
            const links = shadowRoot.querySelectorAll("a");
            const imgs = shadowRoot.querySelectorAll("img");
            links.forEach((link) => {
                // 设置为在新标签页打开
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
            });
            imgs.forEach((img) => {
                img.setAttribute("style", "height:auto;max-width: 100%;");
            })
        }
    };

    const props = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            console.log('file=', file);
            setFileList([...fileList, file]);
            return false;
        },
        fileList: [{
            // uid: "rc-upload-1736480305985-3",
            // lastModified: 1736473737682,
            name: "3befed6e-c5f1-4d39-b424-e4a228325960.zip",
            // size: 4579628
        }],
    };

    function renderIcon(fileType) {
        let icon = <IconFont type={'icon-unknown'} className='text-2xl'/>
        if (fileType.includes('folder')) {
            icon = <IconFont type="icon-folder" className='text-2xl'/>
        }
        if (fileType.includes('image')) {
            icon = <IconFont type="icon-image" className='text-2xl'/>
        }
        if (fileType.includes('xml')) {
            icon = <IconFont type="icon-xml" className='text-2xl'/>
        }
        if (fileType.includes('video')) {
            icon = <IconFont type="icon-video" className='text-2xl'/>
        }
        if (fileType.includes('audio')) {
            icon = <IconFont type={'icon-audio'} className='text-2xl'/>
        }
        if (fileType.includes('txt')) {
            icon = <IconFont type={'icon-txt'} className='text-2xl'/>
        }
        if (fileType.includes('pdf')) {
            icon = <IconFont type={'icon-pdf'} className='text-2xl'/>
        }
        if (fileType.includes('excel')) {
            icon = <IconFont type={'icon-excel'} className='text-2xl'/>
        }
        if (fileType.includes('word')) {
            icon = <IconFont type={'icon-word'} className='text-2xl'/>
        }
        if (fileType.includes('ppt')) {
            icon = <IconFont type={'icon-ppt'} className='text-2xl'/>
        }
        if (fileType.includes('zip')) {
            icon = <IconFont type={'icon-zip'} className='text-2xl'/>
        }
        return icon
    }

    return <div className={styles.container}>
        <div ref={containerRef} className={'px-2'}/>
        <div className={'p-2 text-sm'}>
            {chooseMailMessage?.attachments?.length > 0 ? <div className={'pb-2'}>附件：</div> : null}
            <div className={'flex flex-col gap-2'}>
                {
                    chooseMailMessage?.attachments?.map(item => {
                        return <div className={'inline-flex'}>
                            <Spin spinning={uploadFileId === item.fileId} indicator={<LoadingOutlined spin/>}>
                                <div className={'p-3 bg-[#eee] dark:bg-[#1c2126] rounded-xl inline-flex items-center gap-2 '}>
                                    {
                                        item.url ? renderIcon(getFileType(item.fileName)) :
                                            <Tooltip title="保存到我的文件" placement={'bottomLeft'} arrow={false}>
                                                <CloudUploadOutlined className={'text-xl cursor-pointer'}
                                                                     onClick={async () => {
                                                                         if (uploadFileId) {
                                                                             message.info("正在下载，请稍候！")
                                                                         } else {
                                                                             setUploadFileId(item.fileId)
                                                                             if (abortControllerRef.current?.abort) {
                                                                                 abortControllerRef.current.abort();
                                                                             }

                                                                             // 创建新的 AbortController
                                                                             abortControllerRef.current = new AbortController();
                                                                             //1、回来修改附件设置url，2、添加上传进度条,4、axios加取消请求
                                                                             const res = await dispatch(uploadAttachment({
                                                                                 data: {
                                                                                     email: chooseMailMessage?.email,
                                                                                     folderName: chooseMailMessage?.folderName,
                                                                                     mid: chooseMailMessage?.mid,
                                                                                     name: item?.fileName,
                                                                                     fileId: item?.fileId,
                                                                                     fileType: getFileType(item.fileName)
                                                                                 },
                                                                                 abortController: abortControllerRef.current
                                                                             }))
                                                                             if (res.payload.status === 0 && res.payload.data) {
                                                                                 const url = res.payload.data
                                                                                 if (url) {
                                                                                     // item.url = url
                                                                                     dispatch(setMailMessageUrl({
                                                                                         url: url,
                                                                                         fileId: item.fileId,
                                                                                         messageId: chooseMailMessage?.id
                                                                                     }))
                                                                                 }
                                                                             }
                                                                             setUploadFileId('')
                                                                         }
                                                                     }}/>
                                            </Tooltip>
                                    }

                                    <div className={'flex items-center flex-col '}>
                                        <div className={'max-w-[220px] line-clamp-1'}
                                             title={item.fileName}>{item.fileName}</div>
                                        {/*<Progress percent={30} showInfo={false} size={'small'}/>*/}
                                    </div>
                                    {
                                        item.url ? <Tooltip title="立即下载" placement={'bottom'} arrow={false}>
                                            <VerticalAlignBottomOutlined className={'text-xl cursor-pointer'}
                                                                         onClick={async () => {
                                                                             if (item.url && item.fileName) {
                                                                                 console.log('------------url----------', item.url)
                                                                                 const encodeurl = encodeURI(item.url);
                                                                                 console.log('encodeurl----', encodeurl)
                                                                                 fetch(encodeurl)
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
                                                                                         link.download = item.fileName;
                                                                                         link.style.display = 'none';
                                                                                         document.body.appendChild(link);
                                                                                         link.click();
                                                                                         URL.revokeObjectURL(url); // 释放URL
                                                                                         document.body.removeChild(link);
                                                                                     })
                                                                                     .catch(error => {
                                                                                         message.error("下载失败！")
                                                                                         console.error('Error downloading image:', error);
                                                                                     });
                                                                             } else {
                                                                                 message.info("下载地址和文件名不能为空！")
                                                                             }

                                                                         }}/>
                                        </Tooltip> : null
                                    }
                                </div>
                            </Spin>

                        </div>
                    })
                }
            </div>

        </div>
    </div>
}

export default Index