'use client'
import {useEffect, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Card, Input, QRCode, Space, ColorPicker, Button, Upload, message} from 'antd';
import {
    DownloadOutlined, InboxOutlined,
    LoadingOutlined,
    MinusOutlined,
    PlusOutlined,
    ReloadOutlined, SaveOutlined,
    UploadOutlined
} from "@ant-design/icons";
import styles from './index.module.scss'
import classNames from "classnames/bind";
import SaveFileDlg from "@/components/dialog/saveFileDlg";
import SelectFileDlg from "@/components/dialog/selectFileDlg";
import {
    queryUserAiTools, updateDt, uploadFileAndReadByUrl,
    setQrCodeText, setQrcodeParsing, setQrcodeParsing2, setQrcodeSize, setQrcodeColor, setQrcodeIcon
} from "@/lib/slices/aiSpaceSlice";
import {addFileForQrcode, addFileForQrcodeAndRead} from "@/lib/slices/fileSpaceSlice";

const {Dragger} = Upload;
let cx = classNames.bind(styles);
const {TextArea} = Input;

const QrcodeTool = () => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()

    // const [text, setText] = useState('https://www.seaurl.com/');
    // const [parsingQrcode, setParsingQrcode] = useState('')
    // const [parsingQrcode2, setParsingQrcode2] = useState('')
    // const [size, setSize] = useState(250);
    // const [color, setColor] = useState(platFormTheme.color || '#000')
    // const [icon, setIcon] = useState('')

    const {platFormTheme} = useSelector(state => state.system)

    const {qrcode} = useSelector(state => state.aiSpace)

    const {text, parsingQrcode, parsingQrcode2, size, color, icon} = qrcode

    // 保持最新的 session 引用，避免 paste 事件监听器中的闭包过期问题
    const sessionRef = useRef(session);
    sessionRef.current = session;

    const query = useSearchParams()

    const [isUpdate, setUpdate] = useState(false)
    const [dlg, setDlg] = useState({
        title: '',
        show: false
    })
    const [selectFileDlg, setSelectFileDlg] = useState({
        title: '',
        show: false
    })
    const props = {
        // 不显示上传文件列表
        showUploadList: false,
        name: 'file',
        accept: "image/png, image/jpeg",
        multiple: false,
        maxCount: 1,
        action: `${process.env.NEXT_PUBLIC_API_HOST}/space/crud/qrcode/uploadAndRead`,
        headers: {
            'token-id': session?.accessToken,
        },
        onChange(info) {
            console.log('info=>', info)
            const {status} = info.file;
            if (status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (status === 'done') {
                const res = info.file.response
                if (res.status === 0 && res?.data) {
                    message.success(`解析成功`);
                    const {text} = res?.data
                    dispatch(setQrcodeParsing(text))
                } else {
                    message.error(`解析失败`);
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} 文件上传失败.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    const props2 = {
        // 不显示上传文件列表
        showUploadList: false,
        // name: 'file',
        accept: "image/png, image/jpeg",
        multiple: false,
        maxCount: 1,
        beforeUpload: async (file) => {
            console.log('file=>', file)
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('二维码上传文件不能大于2MB!');
            }

            setDlg({
                // type: 'saveAndRead',
                title: '保存到我的文件',
                show: true,
                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                data: {
                    name: file.name || ''
                },
                onOk: async (d) => {
                    if (d){
                       const res = await dispatch(addFileForQrcodeAndRead({
                            fileName: d.fileName,
                            pid: d.pid,
                            file: file
                        }))

                        if (res?.payload?.status === 0 && res.payload.data?.text){
                            message.success("解析成功")
                            dispatch(setQrcodeParsing2(res.payload.data.text))
                        }else{
                            message.error("解析失败")
                        }
                    }else{
                        message.error("解析失败")
                    }
                }
            })
            return false;
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    useEffect(() => {
        document.addEventListener('paste', uploadFromPaste);
        return () => {
            setUpdate(false)
            document.removeEventListener('paste', uploadFromPaste);
        }
    }, [])


    // 粘贴图片来解析二维码内容
    async function uploadFromPaste(d) {
        console.log('-- d ---', d)
        const items = d.clipboardData?.items;
        console.log('Clipboard items:', items);

        let file = null;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                file = items[i].getAsFile();
                break;
            }
        }
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/space/crud/qrcode/uploadAndRead`, {
                method: 'POST',
                body: formData,
                headers: {'token-id': `${sessionRef.current?.accessToken}`},
            })
            if (!res.ok) {
                throw new Error('Failed to fetch data')
            }
            const resData = await res.json()
            if (resData.status === 0) {
                message.success(`解析成功`);
                const {text} = resData?.data
                dispatch(setQrcodeParsing(text))
            } else {
                message.error(`解析失败`);
            }
            console.log('resData=', resData)
        } else {
            // message.error(`没有找到图片`);
        }
        console.log('file----', file)
    }

    const MIN_SIZE = 100;
    const MAX_SIZE = 300;

    function globalUpdate() {
        if (!isUpdate) {
            const usedId = query.get('usedId')
            if (usedId) {
                // 更新时间并置顶
                dispatch(updateDt({
                    usedId
                }))
                dispatch(queryUserAiTools())
            }
            setUpdate(true)
        }
    }

    function getMaxSize() {
        const newSize = size + 10;
        if (newSize >= MAX_SIZE) {
            return MAX_SIZE;
        }
        return newSize;
    }

    function getMinSize() {
        const newSize = size - 10;
        if (newSize <= MIN_SIZE) {
            return MIN_SIZE;
        }
        return newSize;
    }


    const increase = () => {
        dispatch(setQrcodeSize(getMaxSize()))
    };
    const decline = () => {
        dispatch(setQrcodeSize(getMinSize()))
    };

    const downloadQRCode = () => {
        const canvas = document.getElementById('myqrcode')?.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL();
            const a = document.createElement('a');
            a.download = 'QRCode.png';
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    function colorChange(e) {
        console.log('colorChange =', e.toHexString())
        dispatch(setQrcodeColor(e?.toHexString() || '#000'))
    }

    const onChange = async (info) => {
        console.log('info=>', info)
        if (info.file.status === "done") {
            let imgsrc = info.file.url;

            if (!imgsrc) {
                imgsrc = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.readAsDataURL(info.file.originFileObj);
                    reader.onload = () => resolve(reader.result);
                });
            }
            console.log('imgsrc=', imgsrc)
            dispatch(setQrcodeIcon(imgsrc))
        }
    };

    function saveMyFileSpace() {
        const canvas = document.getElementById('myqrcode')?.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL();
            let base64Data = url.replace(/^data:image\/(png|jpeg|jpg|gif|bmp);base64,/, '');
            console.log('saveMyFileSpace base64Data=', base64Data)
            setDlg({
                // type: 'save',
                title: '保存到我的文件',
                show: true,
                // 使用marked把markdown格式转换成html格式供ckeditor富文本编辑器使用
                data: {
                    name: ''
                },
                onOk: async (d) => {
                    if (d) {
                        const res = await dispatch(addFileForQrcode({
                            fileName: d.fileName,
                            pid: d.pid,
                            qrcodeImg: base64Data
                        }))
                        if (res?.payload?.status === 0 && res.payload?.data) {
                            message.success("添加成功")
                        } else {
                            message.info("添加失败")
                        }
                    }else{
                        message.info("添加失败")
                    }
                }
            })
        }
    }

    return <div className={'w-full flex flex-col lg:flex-row h-screen overflow-y-auto'}
                onClick={globalUpdate}>
        <div className={'w-full lg:w-1/2 min-h-[740px] border-r border-[#ddd] dark:border-[#474747]'}>
            <div className={'p-3 border-b border-[#ddd] dark:border-[#474747] font-medium'}>生成二维码</div>
            <div className={'flex items-center flex-col gap-4 justify-center  p-2 pb-4'}>
                <TextArea rows={3}
                          placeholder="请输入您要生成二维码的文本"
                          value={text}
                          style={{
                              resize: 'none'
                          }}
                          allowClear
                          onChange={(e) => {
                              dispatch(setQrCodeText(e.target.value))
                          }}
                />
                <div className={'flex items-center flex-col justify-center gap-4'}>
                    <div id="myqrcode" className={'w-[300px] h-[300px] flex items-center justify-center'}>
                        <QRCode
                            size={size}
                            color={color}
                            iconSize={size / 4}
                            value={text || '-'}
                            icon={icon}
                            errorLevel={'H'}
                            bgColor="#fff"/>
                    </div>
                    <div className={'flex items-center'}>
                        <span className={'text-base'}>设置二维码颜色：</span>
                        <ColorPicker defaultValue={color || platFormTheme.color} onChangeComplete={colorChange}/>
                    </div>
                    <Button.Group
                        style={{
                            marginBottom: 16,
                        }}>
                        <Button onClick={decline} disabled={size <= MIN_SIZE} icon={<MinusOutlined/>}>
                            缩小
                        </Button>
                        <Button onClick={() => dispatch(setQrcodeSize(250))}>
                            默认
                        </Button>
                        <Button onClick={increase} disabled={size >= MAX_SIZE} icon={<PlusOutlined/>}>
                            放大
                        </Button>
                    </Button.Group>
                    <div className={cx({
                        'w-full flex': true,
                        'uploadIcon': true
                    })}>
                        <Upload showUploadList={false} block style={{width: '100%'}} accept={ "image/png, image/jpeg"} onChange={onChange}>
                            <Button type={'default'} block icon={<UploadOutlined/>}
                                    style={{width: '100%'}}>上传图标</Button>
                        </Upload>
                    </div>
                    <Button type={'primary'} block icon={<DownloadOutlined/>}
                            onClick={downloadQRCode}>下载二维码</Button>
                    <Button type={'default'} block icon={<SaveOutlined/>}
                            onClick={saveMyFileSpace}>保存到我的文件</Button>
                </div>
            </div>
        </div>
        <div className={'flex flex-col gap-2 w-full lg:w-1/2 h-full'}>
            <div className={'h-full lg:h-1/2 min-h-[365px]'}>
                <div
                    className={'p-3 border-b border-t lg:border-t-0 border-[#ddd] dark:border-[#474747] flex items-center justify-between font-medium'}>
                    <div>解析二维码(仅解析)</div>
                    <Button icon={<UploadOutlined/>}
                            size={'small'}
                            type={'text'}
                            onClick={() => setSelectFileDlg({
                                title: '请选择文件',
                                show: true,
                                disableFileType: 'image',
                                onOk: async (d) => {
                                    console.log('d=', d)
                                    if (d && d.url) {
                                        const res = await dispatch(uploadFileAndReadByUrl({
                                            url: d.url
                                        }))
                                        if (res.payload.status === 0 && res.payload.data) {
                                            message.success("解析成功")
                                            if (res.payload?.data?.text) {
                                                dispatch(setQrcodeParsing(res.payload?.data?.text))
                                            }
                                        } else {
                                            message.error("解析失败")
                                        }
                                    } else {
                                        message.error("选择文件时出了点问题，请重新选择")
                                    }
                                }
                            })}>从文件中选取</Button>
                </div>
                <div className={'flex w-full items-center flex-col justify-center py-3 px-2'}>
                    <div className={'flex items-center justify-center gap-4 w-full'}>
                        <Dragger {...props} className={'w-full'}>
                            <div className={'flex w-full flex-col'}>
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined/>
                                </p>
                                <p className="ant-upload-text">单击或将文件拖动到此区域以上传</p>
                                <p className="ant-upload-text">或者直接Control + V粘贴图片解析</p>
                                <p className="ant-upload-text">（提示：仅解析）</p>
                            </div>
                        </Dragger>
                    </div>
                    {/*<Button block type={'dashed'} className={'mt-4'} onClick={uploadFromPaste}>点击粘贴图片解析</Button>*/}
                    <div className={'flex w-full py-3'}>
                        <TextArea rows={4}
                                  placeholder="请先上传您要解析的二维码图片"
                                  value={parsingQrcode}
                                  allowClear
                                  style={{
                                      resize: 'none'
                                  }}
                                  onChange={(e) => dispatch(setQrcodeParsing(e.target.value))}
                        />
                    </div>
                </div>
            </div>
            <div className={'h-full lg:h-1/2 min-h-[365px]'}>
                <div
                    className={'p-3 border-b border-t border-[#ddd] dark:border-[#474747] flex items-center justify-between font-medium'}>
                    解析二维码(先保存到文件再解析)
                </div>
                <div className={'p-2'}>
                    <div className={'flex items-center justify-center gap-4 w-full'}>
                        <Dragger {...props2} className={'w-full'}>
                            <div className={'flex w-full flex-col'}>
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined/>
                                </p>
                                <p className="ant-upload-text">单击或将文件拖动到此区域以上传</p>
                                <p className="ant-upload-text">（提示：先保存到我的文件再解析）</p>
                            </div>
                        </Dragger>
                    </div>
                    <div className={'flex w-full py-3'}>
                        <TextArea rows={4}
                                  placeholder="请先上传您要解析的二维码图片"
                                  value={parsingQrcode2}
                                  allowClear
                                  style={{
                                      resize: 'none'
                                  }}
                                  onChange={(e) => dispatch(setQrcodeParsing2(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
        <SaveFileDlg dlg={dlg}/>
        <SelectFileDlg dlg={selectFileDlg}/>
    </div>
};

export default withRouter(QrcodeTool);