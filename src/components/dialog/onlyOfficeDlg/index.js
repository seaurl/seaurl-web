'use client'
import React, {useEffect, useRef, useState} from 'react';
import {DocumentEditor} from "@onlyoffice/document-editor-react";
import {useDispatch, useSelector} from "react-redux";
import Loading from "@/components/loading";
import {editFileName} from "@/lib/slices/fileSpaceSlice";
import {message, Modal, TreeSelect} from "antd";
import {useSession} from "next-auth/react";
import styles from './index.module.scss'
import {CloseCircleOutlined} from "@ant-design/icons";


const OnlyOfficeDlg = (props) => {
    const {platFormTheme} = useSelector(state => state.system)
    const configRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch();
    const {data: session} = useSession()


    useEffect(() => {
        // console.log('effect file = ', file)
        // console.log('effect myselfInfo = ', myselfInfo)

        console.log('con====', configRef.current)
        // setConfig(con)
        if (props.dlg.file){
            initOffice(props.dlg.file)
        }
    }, [props.dlg.show])


    function initOffice(file){
        let documentType = ''
        if (file?.type === 'excel') {
            documentType = 'cell'
        }
        if (file?.type === 'word') {
            documentType = 'word'
        }
        if (file?.type === 'ppt') {
            documentType = 'slide'
        }
        if (file?.type === 'pdf') {
            documentType = 'pdf'
        }
        configRef.current = {
            "height": "100%",
            "width": "100%",
            "document": {
                key: file.id,
                "fileType": getFileExtension(file.name),
                "title": file?.name,
                "url": `${file?.url}?t=${new Date().getTime()}`,  // 添加时间戳
                // permissions: {
                //     // 禁用协作功能
                //     edit: true,
                //     comment: false,
                //     download: true,
                //     print: true,
                //     review: false,
                //     fillForms: true,
                //     modifyFilter: false,
                //     modifyContentControl: false,
                //     copy: true,
                //     commentGroups: false,
                //     reviewGroups: false
                // }
            },
            // 编辑器类型，支持 word、cell（表格）、slide（PPT）、pdf
            "documentType": documentType,
            "editorConfig": {
                "mode": "edit",
                // 添加用户信息
                user: {
                    group: '',
                    id: session.uid,
                    name: session.name,
                    image: session.image
                },
                customization: {
                    // 强制保存
                    "autosave": true,
                    "forcesave": true,
                    "anonymous": {
                        "request": false,
                        "label": "您"
                    },
                    // hideRightMenu: true,
                    "uiTheme": platFormTheme.background === 'dark'
                    || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches) ? "theme-dark" : "theme-light",
                    "logo": {
                        "image": "https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png",
                        "imageDark": "https://cdn.awbeci.com/seaurl/logo/seaurl_logo.png",
                        "url": "https://www.seaurl.com",
                        "visible": true
                    },
                },
                lang: "zh",  // 设置为中文
                "callbackUrl": `${process.env.NEXT_PUBLIC_API_HOST}/space/info/file/office/save`
            }
        }
    }

    function getFileExtension(filename) {
        // 使用正则表达式来匹配文件扩展名
        const match = filename.match(/\.\w+$/);
        return match ? match[0].substring(1) : '';
    }

    const onDocumentReady = function (event) {
        console.log("Document is loaded", event);
        setLoading(false)

        try {
            // 检查是否需要重新加载文档
            window.DocEditor && window.DocEditor.reloadDocument();
        }catch (e) {

        }
    };

    const onLoadComponentError = function (errorCode, errorDescription) {
        console.log('errorCode----', errorCode)
        console.log('errorDescription----', errorDescription)
        switch (errorCode) {
            case -1: // Unknown error loading component
                console.log('-----------1-----------', errorDescription);
                break;

            case -2: // Error load DocsAPI from http://documentserver/
                console.log('-----------2-----------', errorDescription);
                break;

            case -3: // DocsAPI is not defined
                console.log('-----------3-----------', errorDescription);
                break;
        }
    }

    function renderOffice (){
       return <div className={'w-[100%] h-[calc(100vh-46px)]'}>
            <DocumentEditor
                id="docxEditor"
                documentServerUrl="https://onlyoffice.seaurl.com"
                config={configRef.current}
                events_onDocumentReady={onDocumentReady}
                events_onRequestRename={async (d) => {
                    console.log('ddd-', d)
                    if (d.data) {
                        let fileName = d.data + '.' + getFileExtension(file.name)
                        //修改文档名
                        const res = await dispatch(editFileName({
                            id: file.id,
                            name: fileName
                        }))
                        if (res && res.payload.status === 0) {
                            message.success('编辑成功');
                        } else {
                            message.warning('编辑失败');
                        }
                    }

                }}
                events_onRequestSaveAs={(d) => {
                    console.log('ddd-', d)
                    //另存为
                }}
                onLoadComponentError={onLoadComponentError}
                onDocumentStateChange={() =>{

                }}
            />
        </div>
    }

    function handleOk() {
        
    }

    function handleCancel() {
        
    }

    return <div>
        <Modal
            wrapClassName={styles.container}
            title={null}
            open={props.dlg.show}
            closable={false}
            styles={{
                header: {
                    padding: '4px 12px',
                    marginBottom: '0'
                }
            }}
            style={{
                top: 0,
            }}
            footer={<div className={'w-full flex items-center justify-center relative'}>
                <span>关闭</span>
                {/*<span className={'absolute right-0'}><CloseCircleOutlined /></span>*/}
            </div>}
            maskClosable={false}
            width={'100%'}>
            {renderOffice()}
        </Modal>
    </div>
}

export default OnlyOfficeDlg