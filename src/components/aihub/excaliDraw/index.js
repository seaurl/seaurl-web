'use client'
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import React, {memo, useEffect, useRef, useState} from "react";
import {
    addFileForText,
    addFileTransfer,
    pushFileTransferToList,
    queryUserAiTools, setExcaliDraw,
    updateDt
} from "@/lib/slices/aiSpaceSlice";
import {Excalidraw, MainMenu, THEME} from "@excalidraw/excalidraw";

import {Button, message} from "antd";
import {FolderOpenOutlined, SaveOutlined} from "@ant-design/icons";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import SaveFileDlg from "@/components/dialog/saveFileDlg";
import ExcaliDrawDb from "@/db/aiSpace/excaliDrawDb";

const ExcaliDrawPage = () => {
    const {data: session} = useSession()
    const router = useRouter();
    const query = useSearchParams()
    const excaliDrawDbRef = useRef()
    const dispatch = useDispatch()
    // const [selectedDate, setSelectedDate] = useState(dayjs());
    const isUpdate = useRef(false)
    const {platFormTheme} = useSelector(state => state.system)
    // const {excaliDraw} = useSelector(state => state.aiSpace)
    // const {initData} = excaliDraw
    const sceneData = useRef(null)
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })
    const [excalidrawAPI, setExcalidrawAPI] = useState(null);

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
        excaliDrawDbRef.current = new ExcaliDrawDb()
        return () => {
            console.log('-------sceneData---excaliDrawDbRef---', sceneData, excaliDrawDbRef)
            //销毁前将数据存储到redux中
            if (sceneData.current && excaliDrawDbRef.current) {
                saveCache()
            }
        }
    }, [])

    useEffect(() => {
        // 监听excalidrawAPI，判断indexeddb中是否有值，有则显示，
        initCache()
    }, [excalidrawAPI])

    // 监听excalidrawAPI，判断indexeddb中是否有值，有则显示，
    async function initCache() {
        if (excaliDrawDbRef.current){
            const res = await excaliDrawDbRef.current.loadCanvasData()
            if (res?.data) {
                console.log('--- init2 ---', res.data)
                // 如果 excalidrawAPI 已经准备好，直接更新 scene
                if (excalidrawAPI?.updateScene) {
                    excalidrawAPI.updateScene(res.data)
                }
            }
        }
    }

    async function saveCache() {
        console.log('sceneData.current-', sceneData.current)
        await excaliDrawDbRef.current.saveCanvasData({
            files: sceneData.current.files || '',
            elements: sceneData.current.elements,
            appState: {
                viewBackgroundColor: sceneData.current.appState.viewBackgroundColor,
                gridSize: sceneData.current.appState.gridSize
            }
        })
    }

    return <div onClick={globalUpdate} className={'w-full h-full'}>
        <Excalidraw langCode={'zh-CN'}
                    theme={platFormTheme.background === 'light' ? THEME.LIGHT : THEME.DARK}
                    onChange={(elements, appState, files) => {
                        // console.log('files=',files)
                        sceneData.current = {
                            elements,
                            appState,
                            files
                        }
                    }}
                    excalidrawAPI={(api) => {
                        console.log('api =', api)
                        setExcalidrawAPI(api)
                    }}>
            <MainMenu>
                <MainMenu.Item icon={<FolderOpenOutlined style={{fontSize: '12px'}}/>} onSelect={() => {
                    setSelectFileDlg({
                        title: '请选择文件',
                        show: true,
                        disableFileType: 'excalidraw',
                        onOk: async (d) => {
                            console.log('d=', d)
                            if (d?.url) {
                                fetch(d.url)
                                    .then(response => {
                                        if (!response.ok) {
                                            message.error("网络返回出错")
                                        }
                                        return response.text(); // 或者使用 response.json() 对于JSON文件
                                    })
                                    .then(res => {
                                        if (res) {
                                            try {
                                                const json = JSON.parse(res)
                                                console.log('draw json =', json)
                                                const sceneData = {
                                                    elements: json.elements,
                                                    appState: {
                                                        viewBackgroundColor: json.appState.viewBackgroundColor,
                                                        gridSize: json.appState.gridSize
                                                    }
                                                }
                                                if (json.files) {
                                                    console.log('json.files-', json.files)
                                                    const _files = []
                                                    for (const key in json.files) {
                                                        console.log('key -', key)
                                                        if (json.files.hasOwnProperty(key)) {
                                                            console.log('files[key]-', json.files[key])
                                                            _files.push(json.files[key])
                                                        }
                                                    }
                                                    // 注意：使用addFiles单独添加文件
                                                    excalidrawAPI.addFiles(_files)
                                                }

                                                excalidrawAPI.updateScene(sceneData)
                                                // excalidrawAPI.refresh()
                                            } catch (e) {
                                                message.error("获取文件内容出错：" + e)
                                            }
                                        }
                                    })
                                    .catch(error => {
                                        message.error("获取文件出错：" + error)
                                    });
                            }
                        }
                    })
                }}>
                    打开我的文件
                </MainMenu.Item>
                <MainMenu.Item icon={<SaveOutlined style={{fontSize: '12px'}}/>} onSelect={() => {
                    const elements = excalidrawAPI.getSceneElements()
                    const appState = excalidrawAPI.getAppState()
                    const files = excalidrawAPI.getFiles()
                    console.log('elements =', elements)
                    console.log('appState =', appState)
                    console.log('files =', files)
                    if (elements.length === 0) {
                        message.warning("请先绘制再保存")
                    } else {
                        setDlg({
                            type: 'saveAndRead',
                            title: '保存到我的文件',
                            show: true,
                            // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                            data: {
                                name: '',
                                suffix: '.excalidraw'
                            },
                            onOk: async (d) => {
                                console.log('success d=', d)
                                if (d) {
                                    const res = await dispatch(addFileForText({
                                        fileName: d.fileName + '.excalidraw',
                                        fileType: 'excalidraw',
                                        pid: d.pid,
                                        fileContent: JSON.stringify({
                                            type: "excalidraw",
                                            version: 2,
                                            elements,
                                            appState,
                                            files
                                        })
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
                    }

                }}>
                    保存到我的文件
                </MainMenu.Item>
                <MainMenu.Separator/>
                <MainMenu.DefaultItems.LoadScene/>
                <MainMenu.DefaultItems.Export/>
                <MainMenu.DefaultItems.ClearCanvas/>
                <MainMenu.DefaultItems.SaveAsImage/>
                <MainMenu.DefaultItems.Help/>
                <MainMenu.DefaultItems.ChangeCanvasBackground/>
            </MainMenu>
        </Excalidraw>
        <SaveFileDlg dlg={dlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>
    </div>
}

export default memo(ExcaliDrawPage)