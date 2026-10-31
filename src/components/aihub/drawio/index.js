'use client'
import {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {addFileForText, queryUserAiTools, setDrawio, updateDt} from "@/lib/slices/aiSpaceSlice";
import {message, Spin} from "antd";
import Loading from "@/components/loading";
import SaveFileDlg from "@/components/dialog/saveFileDlg";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import DrawioDb from "@/db/aiSpace/drawioDb";

const Drawio = (props) => {
    const {data: session} = useSession()
    const query = useSearchParams()
    const drawioDbRef = useRef(null)

    const router = useRouter()
    const isUpdate = useRef(false)
    const drawioRef = useRef(null);
    const [currentData, setCurrentData] = useState()
    const {drawio, aiToolsWillChangeFunc} = useSelector(state => state.aiSpace)
    // const {initData} = drawio
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(true);
    const gotoRef = useRef(null)
    const {platFormTheme} = useSelector(state => state.system)
    const containerRef = useRef();

    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })

    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })

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
        drawioDbRef.current = new DrawioDb();
        // 父窗口中监听从 iframe 返回的消息
        window.addEventListener("message", getMessageFromDrawio);
        return () => {
            //注意：因为组件卸载的时候drawioRef=null，所以发送不了消息，也就获取不了drawio中的图形数据，所以才曲线解决
            window.removeEventListener("message", getMessageFromDrawio);
        }
    }, [])


    useEffect(() => {
        // 监听是否拦截了
        if (aiToolsWillChangeFunc) {
            // 确定拦截之后，将当前方法做为参数传递过去
            // 这里的goto就是跳转的function方法
            aiToolsWillChangeFunc((goto) => {
                if (goto) {
                    // 如果存在，则暂存goto，数据缓存成功后要执行
                    gotoRef.current = goto
                }
                // 同时请求drawio的导出
                if (drawioRef.current) {
                    // 请求导出
                    drawioRef.current?.contentWindow?.postMessage(JSON.stringify({
                        action: 'export',
                        format: 'xmlsvg'
                    }), "*")
                }
            })
        }
    }, [aiToolsWillChangeFunc])

    useEffect(() => {
        //注意：currentData使用的是useState而不是useRef，因为useRef不会导致重新渲染
        if (currentData && drawioDbRef?.current?.saveCanvasData) {
            // dispatch(setDrawio({
            //     initData: currentData
            // }))
            drawioDbRef.current.saveCanvasData(currentData)
            // 当获取到了要暂存的数据之后，这里就要执行上面暂存的goto方法了
            if (gotoRef.current) {
                gotoRef.current()
            }
        }
    }, [currentData])

    useEffect(() => {
        // 默认加载空的画板
        if (drawioRef.current) {
            drawioRef.current?.contentWindow?.postMessage(JSON.stringify({
                action: 'load',
                xml: ''
            }), "*")
        }
        // 第一次进来的时候选择模板
        if (drawioRef.current && !isLoading) {
            // 打开template窗口
            drawioRef.current?.contentWindow?.postMessage(JSON.stringify({
                action: 'template'
            }), "*")
        }

        // 如果有initData说明有数据缓存，则加载这个缓存数据到drawio中
        if (drawioRef.current) {
            init()
        }
    }, [isLoading])

    async function init() {
        if (drawioDbRef?.current?.loadCanvasData) {
            try {
                const res = await drawioDbRef.current.loadCanvasData()
                console.log('------loadCanvasData-------', res)
                if (res?.data) {
                    drawioRef.current?.contentWindow?.postMessage(JSON.stringify({
                        action: 'load',
                        xml: res.data
                    }), "*")
                }
            } catch (e) {
                console.log('error:', e)
            }
        }
    }

    // 打开我的文件
    function openMyFile() {
        setSelectFileDlg({
            title: '请选择文件',
            show: true,
            disableFileType: 'xml',
            onOk: async (d) => {
                console.log('d=', d)
                if (d?.url) {
                    fetch(encodeURI(d.url))
                        .then(response => {
                            if (!response.ok) {
                                message.error("网络返回出错")
                            }
                            return response.text(); // 或者使用 response.json() 对于JSON文件
                        })
                        .then(res => {
                            if (res) {
                                try {
                                    if (drawioRef.current && res) {
                                        drawioRef.current?.contentWindow?.postMessage(JSON.stringify({
                                            action: 'load',
                                            xml: res
                                        }), "*")
                                    }
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
    }

    // 保存到我的文件
    function saveMyFile(xml) {
        setDlg({
            type: 'saveAndRead',
            title: '保存到我的文件',
            show: true,
            // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
            data: {
                name: '',
                suffix: '.xml'
            },
            onOk: async (d) => {
                console.log('success d=', d)
                if (d) {
                    const res = await dispatch(addFileForText({
                        fileName: d.fileName + '.xml',
                        fileType: 'xml',
                        pid: d.pid,
                        fileContent: xml
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

    // 监听drawio的消息
    function getMessageFromDrawio(event) {
        try {
            const data = JSON.parse(event?.data);
            console.log('event data=', data)
            if (data.event === "clickDrawio") {
                globalUpdate()
            }
            if (data.event === 'importFromSeaurl') {
                openMyFile()
            }
            if (data.event === "saveFromSeaurl") {
                saveMyFile(data.xml)
            }
            // 页面初始化完成
            if (data?.event === 'init') {
                setIsLoading(false)
            }
            // 用户发起了导出命令
            if (data?.event === "export") {
                setCurrentData(data.xml)
            }
            if (event.origin === "*") {
                console.log("Message received from iframe:", event.data);
            }
        } catch (e) {

        }
    }

    return <div className={'w-full h-screen relative'} onClick={globalUpdate}>
        {isLoading ?
            <div
                className={'flex items-center justify-center h-full w-full absolute top-0 left-0 right-0 bottom-0 z-20 bg-white dark:bg-[#141414]'}>
                <Loading/>
            </div> : null}
        <iframe ref={drawioRef}
                className={'w-full h-full min-h-[400px] min-w-[400px] border-0'}
                src={`https://drawio.seaurl.com/?embed=1&compress=1&libraries=0&proto=json&ui=min&${platFormTheme.background === 'light' ? "dark=0" : "dark=1"}&spin=0&noExitBtn=1&noSaveBtn=1&saveAndExit=0&lang=zh`}
                title="seaurl.com"></iframe>
        <SaveFileDlg dlg={dlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>
    </div>
};

export default withRouter(Drawio);