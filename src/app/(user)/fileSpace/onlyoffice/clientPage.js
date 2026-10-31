'use client'
import React, {useEffect, useState} from 'react';
import {DocumentEditor} from "@onlyoffice/document-editor-react";
import {useDispatch, useSelector} from "react-redux";
import {editFileName} from "@/lib/slices/fileSpaceSlice";
import {message} from "antd";
import Loading from '@/components/loading'; // 确保引入Loading组件

const OnlyOffice = ({file, myselfInfo}) => {
    const {platFormTheme} = useSelector(state => state.system)
    const [config, setConfig] = useState(null); // 使用状态存储配置
    const [loadingFile, setLoadingFile] = useState(true)
    const dispatch = useDispatch();

    useEffect(() => {
        if (!file || !myselfInfo) return;

        console.log('effect file = ', file)
        console.log('effect myselfInfo = ', myselfInfo)
        let documentType = ''
        if (file.type === 'excel') {
            documentType = 'cell'
        } else if (file.type === 'word') {
            documentType = 'word'
        } else if (file.type === 'ppt') {
            documentType = 'slide'
        } else if (file.type === 'pdf') {
            documentType = 'pdf'
        }

        const newConfig = {
            "height": "100%",
            "width": "100%",
            "document": {
                key: file.id,
                "fileType": getFileExtension(file.name),
                "title": file.name,
                "url": `${encodeURI(file.url)}?t=${new Date().getTime()}`,
            },
            "documentType": documentType,
            "editorConfig": {
                "mode": "edit",
                user: {
                    group: '',
                    id: myselfInfo.uid,
                    name: myselfInfo.name,
                    image: myselfInfo.image
                },
                customization: {
                    "autosave": true,
                    "forcesave": true,
                    "anonymous": {
                        "request": false,
                        "label": "您"
                    },
                    "uiTheme": platFormTheme.background === 'dark' ||
                    (platFormTheme.background === 'system' &&
                        window.matchMedia('(prefers-color-scheme: dark)').matches) ?
                        "theme-dark" : "theme-light",
                    "logo": {
                        "image": "https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png",
                        "imageDark": "https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png",
                        "url": "https://www.seaurl.com",
                        "visible": true
                    },
                },
                lang: "zh",
                "callbackUrl": `${process.env.NEXT_PUBLIC_API_HOST}/space/info/file/office/save`
            }
        };

        setConfig(newConfig);
        setLoadingFile(false);
    }, [file, myselfInfo, platFormTheme]); // 添加所有依赖项

    function getFileExtension(filename) {
        const match = filename.match(/\.\w+$/);
        return match ? match[0].substring(1) : '';
    }

    const onDocumentReady = function (event) {
        console.log("Document is loaded", event);
        try {
            if (window.DocEditor?.reloadDocument) {
                window.DocEditor.reloadDocument();
            }
        } catch (e) {
            console.error("Error reloading document", e);
        }
    };

    const onLoadComponentError = function (errorCode, errorDescription) {
        console.error('ONLYOFFICE loading error:', errorCode, errorDescription);
        message.error(`文档加载失败: ${errorDescription}`);
    };

    if (loadingFile || !config) {
        return <Loading />;
    }

    return (
        <div className={'w-screen h-screen'}>
            <DocumentEditor
                id="docxEditor"
                documentServerUrl="https://onlyoffice.seaurl.com"
                config={config}
                events_onDocumentReady={onDocumentReady}
                events_onRequestRename={async (d) => {
                    if (d.data) {
                        const newName = `${d.data}.${getFileExtension(file.name)}`;
                        try {
                            const res = await dispatch(editFileName({
                                id: file.id,
                                name: newName
                            })).unwrap();

                            if (res.status === 0) {
                                message.success('重命名成功');
                                // 更新配置中的标题
                                setConfig(prev => ({
                                    ...prev,
                                    document: {
                                        ...prev.document,
                                        title: newName
                                    }
                                }));
                            } else {
                                message.warning('重命名失败');
                            }
                        } catch (err) {
                            message.error('操作出错');
                        }
                    }
                }}
                events_onRequestSaveAs={(d) => {
                    console.log('SaveAs event:', d);
                    // message.info('另存为功能待实现');
                }}
                onLoadComponentError={onLoadComponentError}
            />
        </div>
    )
}

export default OnlyOffice;