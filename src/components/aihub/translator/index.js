'use client'
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Select, Input, Button, Space, Segmented} from "antd";
import {CloseOutlined, PlusOutlined, SwapOutlined} from "@ant-design/icons";
import {
    startTranslation,
    startDetect,
    updateDt,
    queryUserAiTools,
    setTranslator,
    setCalculator, setCache
} from "@/lib/slices/aiSpaceSlice";
import _ from 'lodash'
import DropdownList from "@/components/aihub/translator/dropDownList";
import {setSourceLng, setTargetLng, setTargetLngTxt, setSourceLngTxt} from '@/lib/slices/aiSpaceSlice'

const {TextArea} = Input;
const Translator = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const query = useSearchParams()

    const sourceLngTxtRef = useRef(null);
    const [isLoading, setLoading] = useState(false)
    const [detectLng, setDetectLng] = useState({
        label: '',
        value: ''
    })
    const {cache} = useSelector(state => state.aiSpace)
    const isStartRef = useRef(true)

    const isUpdate = useRef(false)
    const {translator} = useSelector(state => state.aiSpace)
    const {sourceLng, targetLng, sourceLngTxt, targetLngTxt} = translator
    const [lngList, setLngList] = useState([

        {"label": "中文", "value": "zh"},
        {"label": "英语", "value": "en"},
        {"label": '日语', "value": 'ja'},
        {"label": '韩语', "value": 'ko'},
        {"label": "阿拉伯语", "value": "ar"},
        {"label": "爱沙尼亚语", "value": "et"},
        {"label": "保加利亚语", "value": "bg"},
        {"label": "波兰语", "value": "pl"},
        {"label": "波斯语", "value": "fa"},
        {"label": "拉丁语", "value": "la"},
        {"label": "丹麦语", "value": "da"},
        {"label": "德语", "value": "de"},
        {"label": "俄语", "value": "ru"},
        {"label": "法语", "value": "fr"},
        {"label": "芬兰语", "value": "fi"},
        {"label": "荷兰语", "value": "nl"},
        {"label": "捷克语", "value": "cs"},
        {"label": "拉脱维亚语", "value": "lv"},
        {"label": "立陶宛语", "value": "lt"},
        {"label": "罗马尼亚语", "value": "ro"},
        {"label": "挪威语", "value": "no"},
        {"label": "葡萄牙语", "value": "pt"},
        {"label": "瑞典语", "value": "sv"},
        {"label": "斯洛伐克语", "value": "sk"},
        {"label": "斯洛文尼亚语", "value": "sl"},
        {"label": "土耳其语", "value": "tr"},
        {"label": "西班牙语", "value": "es"},
        {"label": "希腊语", "value": "el"},
        {"label": "匈牙利语", "value": "hu"},
        {"label": "意大利语", "value": "it"},
        {"label": "印地语", "value": "hi"},
        {"label": "越南语", "value": "vi"}
    ])
    const abortExecControllerRef = useRef(null);
    const abortDetectControllerRef = useRef(null);

    // const abortDetectControllerRef = useRef(null);

    useEffect(() => {
        sourceLngTxtRef.current.focus({
            cursor: 'start',
        })
        return () => {
            isUpdate.current = false
            if (abortExecControllerRef.current?.abort) {
                abortExecControllerRef.current.abort();
            }
            if (abortDetectControllerRef.current?.abort) {
                abortDetectControllerRef.current.abort();
            }
        };
    }, [])

    // 仅在sourceLng才检测语言，因为targetLng会跟sourceLng同步修改，所以不必在targetLng变化时也检测语言
    useEffect(() => {
        if (sourceLng === 'auto') {
            console.log('source lng is auto')
            gotoDetect(sourceLngTxt, (d) => {
                console.log('gotoDetect d=', d)
                // 如果检测到源是英语，则目标设置成中文
                if (d && d === 'en' && targetLng === 'zh') {
                    dispatch(setTargetLng('zh'))
                    startExec(sourceLngTxt, 'en', 'zh')
                }else{
                    startExec(sourceLngTxt)
                }
            })
        }else{
            startExec(sourceLngTxt)
        }
    }, [sourceLngTxt, sourceLng])

    // 仅在sourceLng才检测语言，因为targetLng会跟sourceLng同步修改，所以不必在targetLng变化时也检测语言
    useEffect(() => {
        if (!targetLngTxt) {
            dispatch(setTargetLngTxt('<span style="color:#5f6368">翻译</span>'))
        }
    }, [targetLngTxt, targetLng])


    useEffect(() => {
        if (detectLng?.value) {
            if (detectLng.value === targetLng) {
                const fs = lngList.filter(f => f.value !== detectLng.value)
                if (fs.length > 0) {
                    dispatch(setTargetLng(fs[0].value))
                    startExec(sourceLngTxt, detectLng.value, fs[0].value)
                }
            }
        }
    }, [detectLng])

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

    function changeLng(type, d) {
        const _sourceLng = sourceLng
        const _targetLng = targetLng
        // 重新选择源语言
        if (type === 'source') {
            // 如果一样就不变
            if (_sourceLng === d) {
                return
            }
            dispatch(setSourceLng(d))
            if (d !== _targetLng && _sourceLng === 'auto') {
                // 因为上次是auto，所以当设置了新值，就要置空(注意：只要setSourceLng变了，都要设置这个)
                setDetectLng({
                    label: '',
                    value: ''
                })
            }
            if (d === targetLng || d === 'auto') {
                if (_sourceLng === 'auto') {
                    // 换个边
                    if (detectLng.value && detectLng.value !== 'auto') {
                        dispatch(setTargetLng(detectLng.value))
                    } else {
                        if (_targetLng === 'zh') {
                            dispatch(setTargetLng('en'))
                        } else {
                            dispatchsetTargetLng('zh')
                        }
                    }
                } else {
                    // 换个边
                    dispatch(setTargetLng(sourceLng))
                }
            }
        }
        // 重新选择目标语言
        if (type === 'target') {
            // 如果一样就不变
            if (_targetLng === d) {
                return
            }
            dispatch(setTargetLng(d))
            // 如果是auto就不需要变(因为没有检测到语言)
            if (detectLng.value === 'auto') {
                // 仅targetLng变化的话，重新翻译下
                startExec(sourceLngTxt, sourceLng, d)
                return
            }
            if (d === _sourceLng || detectLng.value === d) {
                // 继续换边
                dispatch(setSourceLng(targetLng))
                // 因为上次是auto，所以当设置了新值，就要置空(注意：只要setSourceLng变了，都要设置这个)
                setDetectLng({
                    label: '',
                    value: ''
                })
            } else {
                // 仅targetLng变化的话，重新翻译下
                startExec(sourceLngTxt, sourceLng, d)
            }
        }
    }

    function startExec(val, sl, tl) {
        if (abortExecControllerRef.current?.abort) {
            abortExecControllerRef.current.abort();
        }
        gotoExec(val, sl, tl)
    }

    const gotoDetect = useCallback(_.debounce((val, cb) => onDetectLng(val, cb), 500), [sourceLng])

    /**
     * 检测语言
     * @param val
     * @returns {Promise<void>}
     */
    async function onDetectLng(val, cb) {
        let newVal = val
        if (newVal) {
            newVal = newVal.trim()
        }

        if (!newVal) {
            if (abortDetectControllerRef.current?.abort) {
                abortDetectControllerRef.current.abort();
            }
            setDetectLng({
                label: `自动检测`,
                value: 'auto'
            })
            return
        }

        // 创建新的 AbortController
        const abortController = new AbortController();
        abortDetectControllerRef.current = abortController;
        const res = await dispatch(startDetect({
            sourceTxt: newVal.slice(0, 100),
            abortController: abortController
        }))
        console.log('startDetect res=', res)
        if (res.payload.status === 0) {
            const resData = res.payload.data
            if (resData) {
                const resJson = JSON.parse(resData)
                // console.log('resjson = ', resJson.body.detectedLanguage)
                if (resJson.body?.detectedLanguage) {
                    const lng = resJson.body?.detectedLanguage
                    console.log('检测了到的语言是：', lng)
                    const fs = lngList.filter(f => f.value === lng)
                    if (fs.length > 0) {
                        setDetectLng({
                            label: `检测到：${fs[0].label}`,
                            value: fs[0].value
                        })
                    }
                    // 检测回调
                    cb(lng)
                }else{
                    cb()
                }
            }else{
                cb()
            }
        }else{
            cb()
        }
    }

    function onChangeSourceLngTxt(e) {
        dispatch(setSourceLngTxt(e.target.value))
        if (!e.target.value) {
            dispatch(setTargetLngTxt('<span style="color:#5f6368">翻译</span>'))
        }
    }

    const gotoExec = useCallback(_.debounce((sTxt, sl, tl) => exec(sTxt, sl, tl, cache), 500), [sourceLng, targetLng, cache])

    async function onSave() {


    }

    /**
     * 切换语言
     */
    function onSwitch() {
        const _sourceLng = sourceLng
        const _targetLng = targetLng

        if (targetLngTxt === '<span style="color:#5f6368">翻译</span>') {
            // setSourceLngTxt('')
        } else {
            const rs = targetLngTxt.replace(/<br\s*\/?>/gi, '\n');
            dispatch(setSourceLngTxt(rs))
        }

        dispatch(setSourceLng(_targetLng))
        // 因为上次是auto，所以当设置了新值，就要置空(注意：只要setSourceLng变了，都要设置这个)
        setDetectLng({
            label: '',
            value: ''
        })
        //如果是自动检测
        if (_sourceLng === 'auto') {
            //检测到值
            if (detectLng.value && detectLng.value !== 'auto') {
                dispatch(setTargetLng(detectLng.value))
            } else {
                // 没办法之举，只能设置成zh
                if (_targetLng === 'zh') {
                    dispatch(setTargetLng('en'))
                } else {
                    dispatch(setTargetLng('zh'))
                }
            }
        } else {
            dispatch(setTargetLng(_sourceLng))
        }
    }

    const exec = async function (sTxt, sl, tl, cache) {
        console.log('cache.isTranslatorRequest=', cache.isTranslatorRequest)
        // 通过isUpdate来判断，因为第1次打开页面isUpdate=false，所以不用查询，就做到类似缓存的作用，只有第2次及以后才会重新查询
        if (!isUpdate.current){
            return
        }
        // 判断是否为空，为空则不往下执行
        if (!sTxt) {
            if (abortExecControllerRef.current?.abort) {
                abortExecControllerRef.current.abort();
            }
            return
        }
        // 创建新的 AbortController
        const newAbortController = new AbortController();
        abortExecControllerRef.current = newAbortController;

        setLoading(true)
        if (sourceLng && targetLng && sTxt.trim()) {
            const res = await dispatch(startTranslation({
                sourceTxt: sTxt,
                sourceLng: sl || sourceLng,
                targetLng: tl || targetLng,
                abortController: newAbortController
            }))
            setLoading(false)
            if (res.payload.status === 0) {
                const resJson = res.payload.data
                if (resJson) {
                    const resData = JSON.parse(resJson)
                    console.log('resData = ', resData)

                    if (resData.body.code === 200) {
                        const result = resData?.body?.data?.translated || ''
                        const formattedText = result.replace(/\n/g, '<br />');
                        dispatch(setTargetLngTxt(formattedText))
                    }
                }
            }
        } else {
            setLoading(false)
            dispatch(setTargetLngTxt(''))
        }
    }

    function onClearSource() {
        dispatch(setTargetLngTxt(''))
        dispatch(setSourceLngTxt(''))
        sourceLngTxtRef.current.focus({
            cursor: 'start'
        })
    }


    return <div className={'flex flex-col h-screen overflow-hidden'}  onClick={globalUpdate}>
        <div className={'flex items-center justify-center p-2 border-b border-[#ddd] dark:border-[#474747] relative'}>
            <div className={'w-full flex items-center gap-4'}>
                <div className={'flex items-center'}>
                    <DropdownList value={sourceLng}
                                  detect={detectLng}
                                  menus={[{label: '自动检测', value: 'auto'}].concat(lngList)}
                                  onChange={(d) => changeLng('source', d)}/>
                </div>

                <div className={''}>
                    <Button icon={<SwapOutlined/>} type={'text'} onClick={onSwitch} disabled={isLoading}/>
                </div>
                <div className={'flex items-center'}>
                    <DropdownList value={targetLng}
                                  menus={lngList}
                                  onChange={(d) => changeLng('target', d)}/>
                </div>
            </div>
            {/*<div className={'w-1/2 flex items-center justify-end pr-2 gap-2'}>*/}
            {/*    /!*<Button type={'primary'} icon={<PlusOutlined/>} onClick={onSave}>保存到笔记</Button>*!/*/}
            {/*    <Segmented options={[ {*/}
            {/*        label: '图片翻译',*/}
            {/*        value: 'img'*/}
            {/*    },{*/}
            {/*        label: '文档翻译',*/}
            {/*        value: 'doc'*/}
            {/*    },{*/}
            {/*        label: '证件翻译',*/}
            {/*        value: '证件翻译'*/}
            {/*    }]} block />*/}
            {/*</div>*/}
        </div>
        <div className={'w-full flex flex-col lg:flex-row h-full'}>
            <div className={'w-full h-1/2 lg:w-1/2 lg:h-[100%]'}>
                <div className={'flex flex-row h-full border-r border-[#ddd] dark:border-[#474747] relative'}>
                    <TextArea placeholder="请输入您想要翻译的文字"
                              ref={sourceLngTxtRef}
                              variant={'borderless'}
                              value={sourceLngTxt}
                              showCount={false}
                              maxLength={2000}
                              onChange={(e) => onChangeSourceLngTxt(e)}
                              style={{height: 'calc(100vh - 105px)', fontSize: '20px', resize: 'none'}}/>
                    <div className={'flex pr-2 pt-2'}>
                        {
                            sourceLngTxt ? <Button icon={<CloseOutlined/>} type={'text'} shape={'circle'}
                                                   onClick={onClearSource}></Button> : null
                        }
                    </div>
                </div>
            </div>
            <div className={'w-full h-1/2 lg:w-1/2 lg:h-[100%] bg-[#fafafa] dark:bg-[#1C2126]'}>
                <div className={'px-4 py-2 overflow-y-auto '}
                     style={{height: 'calc(100vh - 105px)', fontSize: '20px', whiteSpace: 'pre-wrap'}}
                     dangerouslySetInnerHTML={{__html: targetLngTxt}}>
                </div>
            </div>
        </div>
    </div>
};

export default withRouter(Translator);