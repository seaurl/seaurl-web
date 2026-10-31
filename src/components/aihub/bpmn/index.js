'use client'
import {useEffect, useRef, useState} from 'react';
import BpmnModeler from 'bpmn-js/lib/Modeler';
// 必须导入的样式文件
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule
} from 'bpmn-js-properties-panel';
import customTranslate from "@/components/aihub/bpmn/customTranslate";
// Camunda 8 moddle extension
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';

// Camunda 8 behaviors
import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import {
    AimOutlined,
    CloseOutlined,
    DownloadOutlined,
    FolderOpenOutlined,
    FolderOutlined,
    MenuOutlined,
    PictureOutlined,
    SaveOutlined,
    ZoomInOutlined,
    ZoomOutOutlined
} from "@ant-design/icons";
import {Button, Dropdown, message} from "antd";
import {addFileForText, queryUserAiTools, updateDt} from "@/lib/slices/aiSpaceSlice";
import {useDispatch} from "react-redux";
import {useSearchParams} from "next/navigation";
import SaveFileDlg from "@/components/dialog/saveFileDlg";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import BpmnDb from "@/db/aiSpace/bpmnDb";

const Bpmn = () => {
    const isUpdate = useRef(false)
    const dispatch = useDispatch()
    const query = useSearchParams()
    const openFileRef = useRef(null)
    const inputRef = useRef(null);
    const bpmnDbRef = useRef(null)
    const containerRef = useRef(null);
    const propertiesPanelRef = useRef(null);
    const modelerRef = useRef(null);
    var customTranslateModule = {
        translate: ['value', customTranslate]
    };
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })

    useEffect(() => {
        if (!containerRef.current || !propertiesPanelRef.current) return;
        try {
            // 初始化 BPMN Modeler 并集成属性面板
            modelerRef.current = new BpmnModeler({
                container: containerRef.current, // ✅ 使用ref对象
                propertiesPanel: {
                    parent: propertiesPanelRef.current // ✅ 使用ref对象
                },
                additionalModules: [
                    BpmnPropertiesPanelModule,
                    BpmnPropertiesProviderModule,
                    ZeebePropertiesProviderModule,
                    ZeebeBehaviorsModule,
                    customTranslateModule
                ],
                moddleExtensions: {
                    zeebe: zeebeModdle
                }
            });
            init();
        } catch (e) {
            console.log('error =', e)
        }
        // 清理函数
        return () => {
            if (bpmnDbRef?.current && modelerRef?.current){
               saveCacheAndDestroy()
            }
            if (modelerRef?.current?.destroy) {
                modelerRef?.current.destroy();
            }
        };
    }, []);

    // 使用 async/await 确保流程创建完成,解决：TypeError: Cannot read properties of undefined (reading 'root-0')问题
    async function init() {
        try {
            if (modelerRef.current){
                bpmnDbRef.current = new BpmnDb();

                const res = await bpmnDbRef.current.loadCanvasData()
                console.log('--- loadCanvasData ---', res)
                if (res?.data){
                    await modelerRef.current.importXML(res.data);
                    console.log('流程图导入成功');
                    const canvas = modelerRef.current.get('canvas');
                    if (canvas){
                        canvas.zoom('fit-viewport'); // 自适应画布大小
                    }
                }else if (modelerRef?.current?.createDiagram) {
                    await modelerRef.current.createDiagram(); // ✅ 等待流程图创建完成
                    console.log('Root element:', modelerRef.current.get('canvas').getRootElement());
                }
            }
        } catch (err) {
            console.error('初始化失败:', err);
        }
    }

    async function saveCacheAndDestroy(){
        try {
            if (modelerRef?.current?.saveXML){
                const { xml } = await modelerRef.current.saveXML({ format: true });
                await bpmnDbRef.current.saveCanvasData(xml)
            }
        }catch(e){
            console.log('error =', e)
        }
    }

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

    async function exportSVG(fileName = 'diagram.svg') {
        try {
            if (modelerRef.current) {
                const {svg} = await modelerRef.current.saveSVG();
                const blob = new Blob([svg], {type: 'image/svg+xml'});
                const url = URL.createObjectURL(blob);

                // 触发下载
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();

                URL.revokeObjectURL(url); // 清理内存
            }
        } catch (err) {
            console.error('导出 SVG 失败:', err);
        }
    }

    async function exportBPMN(fileName = 'diagram.bpmn') {
        try {
            if (modelerRef.current) {
                const {xml} = await modelerRef.current.saveXML({format: true}); // format: true 表示格式化输出
                const blob = new Blob([xml], {type: 'application/xml'});
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.click();

                URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('导出 BPMN 失败:', err);
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // if (!isCodeFile(file)) {
            //     message.error('不支持此文件，请重新上传');
            //     return;
            // }
            openFileRef.current = file
            // console.log('File :', file);
            try {
                if (modelerRef.current) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const xml = e.target.result;
                        await modelerRef.current.importXML(xml);
                        console.log('流程图导入成功');
                    };
                    reader.readAsText(file); // 读取文件内容
                }
            } catch (e) {
                message.error('读取文件出错');
            }

        }
    };

    const items = [
        {
            key: '1',
            label: '从我的文件选择',
            icon: <FolderOpenOutlined/>
        },
        {
            key: '2',
            label: '保存到我的文件',
            icon: <SaveOutlined/>
        },
        {
            key: '3',
            label: '打开',
            icon: <FolderOutlined/>
        },
        {
            key: '4',
            label: '下载',
            icon: <DownloadOutlined/>
        },
        {
            key: '5',
            label: '下载图片',
            icon: <PictureOutlined/>
        },
    ];

    function onMenuClick(key) {
        console.log('key=', key)
        if (key === '5') {
            exportSVG()
        }
        if (key === '4') {
            exportBPMN()
        }
        if (key === '3') {
            if (inputRef.current) {
                inputRef.current.click();
            }
        }
        if (key === '2') {
            if (modelerRef.current) {
                setDlg({
                    type: 'saveAndRead',
                    title: '保存到我的文件',
                    show: true,
                    // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                    data: {
                        name: name,
                        suffix: '.bpmn'
                    },
                    onOk: async (d) => {
                        console.log('success d=', d)
                        if (d) {
                            const {xml} = await modelerRef.current.saveXML({format: true}); // format: true 表示格式化输出
                            const res = await dispatch(addFileForText({
                                fileName: d.fileName + '.bpmn',
                                pid: d.pid,
                                fileType: 'xml',
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

        }
        if (key === '1') {
            if (modelerRef.current) {
                setSelectFileDlg({
                    title: '请选择文件',
                    show: true,
                    onOk: async (d) => {
                        console.log('d=', d)
                        if (d?.url) {
                            openFileRef.current = d
                            fetch(d.url)
                                .then(response => {
                                    if (!response.ok) {
                                        return message.error("获取文件出错")
                                    }
                                    // 检查Content-Type
                                    const contentType = response.headers.get('Content-Type');
                                    console.log('contentType=', contentType)
                                    return response.text();
                                })
                                .then(async res => {
                                    console.log('setSelectFileDlg res-', res)
                                    if (typeof res === 'string') {
                                        await modelerRef.current.importXML(res);
                                        console.log('流程图导入成功');
                                    } else {
                                        message.error("不支持此文件，请重新选择")
                                    }
                                })
                                .catch(error => {
                                    message.error("获取文件出错：" + error)
                                });
                        }
                    }
                })
            }
        }
    }

    return <div className={'flex flex-col'} onClick={globalUpdate}>
        <div className={'px-3 h-[50px] flex items-center justify-between border-b border-[#ddd] dark:border-[#474747]'}>
            <div className={'flex items-center gap-4 font-medium'}>
                <Dropdown
                    menu={{
                        items,
                        onClick: ({key}) => onMenuClick(key),
                    }}>
                    <div className={'text-sm cursor-pointer flex items-center gap-1 font-medium'}>
                        <MenuOutlined/>
                        快捷菜单
                    </div>
                </Dropdown>
            </div>
            <div className={'flex items-center gap-2'}>
                <Button icon={<AimOutlined/>} onClick={() => {
                    if (modelerRef.current) {
                        const canvas = modelerRef.current.get('canvas');

                        // 重置缩放比例
                        canvas.zoom('fit-viewport'); // 自适应画布大小
                    }
                }}>自适应</Button>
                <Button icon={<ZoomInOutlined/>} onClick={() => {
                    if (modelerRef.current) {
                        const canvas = modelerRef.current.get('canvas');
                        const currentZoom = canvas.zoom();
                        canvas.zoom(Math.min(currentZoom * 1.1, 3)); // 最大放大到 300%
                    }
                }}>放大</Button>
                <Button icon={<ZoomOutOutlined/>} onClick={() => {
                    if (modelerRef.current) {
                        const canvas = modelerRef.current.get('canvas');
                        const currentZoom = canvas.zoom();
                        canvas.zoom(Math.max(currentZoom * 0.9, 0.2)); // 最小缩小到 20%
                    }
                }}>缩小</Button>
                <Button icon={<CloseOutlined/>} onClick={() => {
                    if (modelerRef.current) {
                        // modelerRef.current.clear();
                        // 清空画布并创建空流程图
                        modelerRef.current.createDiagram()
                            .then(() => {
                                console.log('画布已清空并重新创建');
                            })
                            .catch(err => {
                                console.error('清空画布失败', err);
                            });
                    }
                }}>全部清空</Button>
            </div>

        </div>
        <div className="modeler" style={{
            width: '100%',
            height: 'calc(100vh - 50px)',
            display: 'flex', // 添加flex布局
            position: 'relative'
        }}>
            <div
                ref={containerRef}
                style={{flex: 1, borderRight: '1px solid #ccc'}}
            ></div>
            <div
                ref={propertiesPanelRef}
                style={{width: '300px', overflowY: 'auto'}}
            ></div>

        </div>
        <input
            type="file"
            accept={'.bpmn'}
            ref={inputRef}
            style={{display: 'none'}}
            onChange={handleFileChange}
        />
        <SaveFileDlg dlg={dlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>
    </div>

}

export default Bpmn