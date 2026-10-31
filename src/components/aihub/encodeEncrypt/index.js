'use client'
import {useEffect, useRef, useState} from "react";
import {Button, Card, Flex, Input, message, Radio, Space, Tabs, Watermark} from 'antd';

import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import {Collapse} from "antd";
import styles from './index.module.scss'
import cns from "classnames/bind"
import CryptoJS from 'crypto-js'

import _ from 'lodash'
import {
    setEncodeEncryptUri, setEncodeEncryptMode, setResult,
    setEncodeEncryptUnicode, setEncodeEncryptActivityKey, setEncodeEncryptBase64,
    setEncodeEncryptGuid, setEncodeEncryptAesDes, setEncodeEncryptMd5, setEncodeEncryptTimeStamp,
    setEncodeEncryptJwt, updateDt, queryUserAiTools
} from '@/lib/slices/aiSpaceSlice'
import {CopyOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    fromUnixTimestamp10, fromUnixTimestamp13, toUnixTimestamp10,
    toUnixTimestamp13, generate32BitMD5, generate16BitMD5, encryptDES, decryptDES,
    encryptAES, decryptAES, encodeToBase64, decodeFromBase64, getCurrentUnixTimestamp10,
    getCurrentUnixTimestamp13, decodeFromUnicode, encodeToUnicode, generateGUID,
    // verifyToken,
    // generateToken,
    // decodeToken,
    // generateUnsecuredToken,
    // generateToken2,
    parseJwt,
    generateTokenWithEmptySecret
} from '@/utils/help'

let cx = cns.bind(styles);
const {TextArea} = Input;

const EncodeEncrypt = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const query = useSearchParams()
    const {encodeEncrypt} = useSelector(state => state.aiSpace)
    const [uriVal, setUriVal] = useState('')
    const [unicodeVal, setUnicodeVal] = useState('')
    const [base64Val, setBase64Val] = useState('')
    const [aesDesVal, setAesDesVal] = useState('')
    const [md5Val, setMd5Val] = useState({
        val16Lowercase: '',
        val32Lowercase: '',
        val16Uppercase: '',
        val32Uppercase: ''
    })

    const [jwtToken, setJwtToken] = useState('')
    const [isServer, setServer] = useState(true)

    const [timestampVal, setTimeStampVal] = useState({
        currentTimeStampVal: '',

        timestampToDateVal: '',
        dateToTimeStampVal: ''
    })
    const {uri, mode, unicode, activityKey, base64, guid, aesDes, md5, timeStamp, jwt} = encodeEncrypt

    const [time, setTime] = useState(dayjs());
    const isUpdate = useRef(false)


    useEffect(() => {
        // 获取token
        getToken(jwt.payload, jwt.signature)

        const interval = setInterval(() => {
            setTime(dayjs());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let currentTimeStampVal = ''
        let timestampToDateVal = ''
        let dateToTimeStampVal = ''

        if (timeStamp.type === '10') {
            currentTimeStampVal = getCurrentUnixTimestamp10(md5)
        }

        if (timeStamp.type === '13') {
            currentTimeStampVal = getCurrentUnixTimestamp13(md5)
        }

        if (timeStamp.timestampToDate) {
            timestampToDateVal = onTimestampConvert('timestampToDate', timeStamp.timestampToDate)
        }
        if (timeStamp.dateToTimeStamp) {
            dateToTimeStampVal = onTimestampConvert('dateToTimeStamp', timeStamp.dateToTimeStamp)
        }
        setTimeStampVal({
            currentTimeStampVal,
            timestampToDateVal,
            dateToTimeStampVal
        })
    }, [timeStamp]);

    useEffect(() => {
        if (uri) {
            let result = ''
            if (mode === 'encode') {
                result = encodeURIComponent(uri);
            }
            if (mode === 'decode') {
                result = decodeURIComponent(uri);
            }
            setUriVal(result)
        } else {
            setUriVal('')
        }
    }, [uri, mode])

    useEffect(() => {
        if (unicode) {
            let result = ''
            if (mode === 'encode') {
                result = encodeToUnicode(unicode)
            }
            if (mode === 'decode') {
                result = decodeFromUnicode(unicode)
            }
            setUnicodeVal(result)
        } else {
            setUnicodeVal('')
        }
    }, [unicode, mode])

    useEffect(() => {
        if (base64) {
            let result = ''
            if (mode === 'encode') {
                result = encodeToBase64(base64)
            }
            if (mode === 'decode') {
                result = decodeFromBase64(base64)
            }
            setBase64Val(result)
        } else {
            setBase64Val('')
        }
    }, [base64, mode])

    useEffect(() => {
        if (md5) {
            const r1 = generate16BitMD5(md5)
            const r2 = generate32BitMD5(md5)
            setMd5Val({
                val16Lowercase: r1.toLowerCase(),
                val16Uppercase: r1.toUpperCase(),
                val32Lowercase: r2.toLowerCase(),
                val32Uppercase: r2.toUpperCase()
            })
        } else {
            setMd5Val({
                val16Lowercase: '',
                val16Uppercase: '',
                val32Lowercase: '',
                val32Uppercase: ''
            })
        }
    }, [md5, mode])

    useEffect(() => {
        console.log('-----------------------', aesDes, activityKey, mode)
        if (aesDes.value) {
            let result = ''
            if (mode === 'encode' && activityKey === '6') {
                if (aesDes.type === 'aes') {
                    result = encryptAES(aesDes.value, aesDes.key)
                    setAesDesVal(result)
                }
                if (aesDes.type === 'des') {
                    result = encryptDES(aesDes.value, aesDes.key)
                    setAesDesVal(result)
                }
            }
            if (mode === 'decode' && activityKey === '6') {
                if (aesDes.type === 'aes') {
                    result = decryptAES(aesDes.value, aesDes.key)
                    if (result) {
                        setAesDesVal(result)
                    } else {
                        setAesDesVal(<span className={'text-red-600'}>解析失败</span>)
                    }
                }
                if (aesDes.type === 'des') {
                    result = decryptDES(aesDes.value, aesDes.key)
                    if (result) {
                        setAesDesVal(result)
                    } else {
                        setAesDesVal(<span className={'text-red-600'}>解析失败</span>)
                    }
                }
            }
        } else {
            setAesDesVal('')
        }
    }, [aesDes, mode])

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

    function onChangeJwt(e, type) {
        const {value} = e.target
        if (type === 'token') {
            setJwtToken(value)
            decodeTokenFromClient(value, jwt.signature)
        } else {
            dispatch(setEncodeEncryptJwt({
                which: type,
                [type]: value
            }))
            if (type === 'payload') {
                try {
                    // 确保是正确的json
                    JSON.parse(value)
                    getToken(value, jwt.signature)
                } catch (e) {
                    setJwtToken('')
                    message.error("解析出错")
                }

            }
            if (type === 'signature') {
                // 如果有payload则解析token，否则，则解析payload
                if (jwt.payload) {
                    getToken(jwt.payload, value)
                } else if (value) {
                    decodeTokenFromClient(jwtToken, value)
                }
            }
        }
    }

    async function getToken(payload, signature) {
        console.log('getToken jwt.payload=', jwt.payload)
        console.log('getToken jwt.payload=', jwt.signature)
        try {
            if (payload) {
                let result = generateTokenWithEmptySecret(JSON.parse(payload), signature)
                console.log('result token=', result)
                if (result) {
                    setJwtToken(result)
                }
            }
        } catch (e) {
            console.log('e = ', e)
        }
    }

    //解析token
    async function decodeTokenFromClient(token, signature) {
        try {
            console.log('decodeToken token=', token)
            console.log('decodeToken signature=', jwt.signature)
            if (token) {
                const result = parseJwt(token, signature)
                console.log('result -', result)
                if (result) {
                    dispatch(setEncodeEncryptJwt({
                        which: 'payload',
                        payload: JSON.stringify(result.payload, null, 2)
                    }))
                } else {
                    message.error("解析失败")
                    resetJwt()
                }
                console.log('解析的Result1=', result)
            } else {
                resetJwt()
            }
        } catch (e) {
            message.error("解析失败")
            resetJwt()
        }
    }

    function resetJwt() {
        dispatch(setEncodeEncryptJwt({
            which: 'payload',
            payload: ''
        }))
    }


    const onTimestampChange = (e, type) => {
        const {value} = e.target;

        if (type === 'timestampToDate') {
            // 只允许输入数字
            if (/^\d*$/.test(value)) {
                dispatch(setEncodeEncryptTimeStamp({
                    which: type,
                    value
                }))
            }
        }

        if (type === 'dateToTimeStamp') {
            dispatch(setEncodeEncryptTimeStamp({
                which: type,
                value
            }))
        }

    };

    function onTimestampConvert(type, val) {
        console.log('vvval=', val)
        console.log('vvval type=', type)
        if (!val) {
            // message.info("请先输入数据");
            return
        }

        if (type === 'dateToTimeStamp') {
            let result = ''
            if (timeStamp.type === '10') {
                result = toUnixTimestamp10(val)
            }
            if (timeStamp.type === '13') {
                result = toUnixTimestamp13(val)
            }
            console.log('sdfsdfsdfsdf=', result)
            return result
        }
        if (type === 'timestampToDate') {
            let result = ''
            if (timeStamp.type === '10') {
                result = fromUnixTimestamp10(val)
                return dayjs(result).format('YYYY-MM-DD HH:mm:ss')
            }
            if (timeStamp.type === '13') {
                result = fromUnixTimestamp13(val)
                return dayjs(result).format('YYYY-MM-DD HH:mm:ss.SSS')
            }
            console.log('result=', result)
            return result
        }
    }

    function onChangeCollapse(v) {
        console.log('v--', v)
        dispatch(setEncodeEncryptActivityKey(v))
    }


    function onChangeUri(e) {
        // console.log('onChangeEscape=', "")
        dispatch(setEncodeEncryptUri(e.target.value))
    }

    function onChangeUnicode(e) {
        dispatch(setEncodeEncryptUnicode(e.target.value))
    }

    function onChangeBase64(e) {
        dispatch(setEncodeEncryptBase64(e.target.value))
    }

    function onChangeAesDesKey(e) {
        dispatch(setEncodeEncryptAesDes({
            key: e.target.value,
            which: 'key'
        }))
    }

    function onChangeAesDesValue(e) {
        dispatch(setEncodeEncryptAesDes({
            value: e.target.value,
            which: 'value'
        }))
    }


    function onGenerateGuid() {
        let guidList = []
        for (let i = 0; i < 100; i++) {
            const guid = generateGUID()
            guidList.push(guid)
        }
        dispatch(setEncodeEncryptGuid(guidList))
    }

    function onChangeMd5(e) {
        dispatch(setEncodeEncryptMd5(e.target.value))
    }

    async function onCopy(val) {
        if (!val) {
            message.error("复制不能为空");
            return
        }
        try {
            await navigator.clipboard.writeText(val)
            message.success("复制成功");
        } catch (error) {
            message.error("复制失败");
        }
    }

    function renderItems() {
        if (activityKey === '1') {
            return <div className={'flex w-full flex-row h-full shrink-0 bg-white dark:bg-[#141414]'}>
                <div className={'flex flex-col w-1/2 border-r border-[#ddd] dark:border-[#474747]'}>
                    <div
                        className={'font-medium p-2 py-3 border-b border-[#ddd] dark:border-[#474747] bg-[#fafafa] dark:bg-[#1D1D1D]'}>JSON
                        Web Token (JWT)
                    </div>
                    <TextArea
                        variant={'borderless'}
                        value={jwtToken}
                        allowClear
                        placeholder="请输入JWT Token"
                        onChange={(e) => onChangeJwt(e, 'token')}
                        style={{height: '100%', resize: 'none', fontSize: '20px'}}
                    />

                </div>
                <div className={'flex w-1/2 flex-col h-full'}>
                    <div className={'h-1/3'}>
                        <div
                            className={'font-medium p-2 py-3 border-b border-[#ddd] dark:border-[#474747] bg-[#fafafa] dark:bg-[#1D1D1D]'}>头部
                            / HEADER
                        </div>
                        <div className={'h-[calc(100%-40px)]'}>
                            <TextArea
                                variant={'borderless'}
                                value={jwt.header}
                                placeholder="请输入HEADER"
                                style={{height: '100%', resize: 'none', fontSize: '16px'}}
                            />
                        </div>
                    </div>
                    <div className={'h-1/3'}>
                        <div
                            className={'font-medium p-2 py-3 border-t border-b border-[#ddd] dark:border-[#474747] bg-[#fafafa] dark:bg-[#1D1D1D]'}>载荷
                            /
                            PAYLOAD
                        </div>
                        <div className={'h-[calc(100%-40px)]'}>
                            <TextArea
                                variant={'borderless'}
                                allowClear
                                value={jwt.payload}
                                onChange={(e) => onChangeJwt(e, 'payload')}
                                placeholder="请输入PAYLOAD"
                                style={{height: '100%', resize: 'none', fontSize: '16px'}}
                            />
                        </div>
                    </div>
                    <div className={'h-1/3'}>
                        <div
                            className={'font-medium p-2 py-3 border-t border-b border-[#ddd] dark:border-[#474747] bg-[#fafafa] dark:bg-[#1D1D1D]'}>签名
                            /
                            VERIFY SIGNATURE
                        </div>
                        <div className={'h-[calc(100%-40px)]'}>
                            <TextArea
                                variant={'borderless'}
                                allowClear
                                value={jwt.signature}
                                onChange={(e) => onChangeJwt(e, 'signature')}
                                placeholder="请输入VERIFY SIGNATURE"
                                style={{height: '100%', resize: 'none', fontSize: '16px'}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        }
        if (activityKey === '2') {
            return <div className={'flex w-full flex-col h-full shrink-0 bg-white dark:bg-[#141414]'}>
                {/*{renderTop()}*/}
                <div className={'flex flex-row h-full'}>
                    <div className={'flex w-1/2 border-r border-[#ddd] dark:border-[#474747]'}>
                        <TextArea
                            value={uri}
                            variant={"borderless"}
                            maxLength={1000}
                            allowClear
                            onChange={onChangeUri}
                            placeholder="请输入文本"
                            style={{height: '100%', resize: 'none', fontSize: '16px'}}
                        />
                    </div>
                    <div
                        className={'flex w-1/2 h-full max-h-[calc(100vh-106px)] p-2 text-wrap break-all overflow-y-auto bg-[#fafafa] dark:bg-[#272727]'}>
                        {uriVal ? uriVal : <div className={'text-[#5f6368]'}>EncodeURIComponent编码</div>}
                    </div>
                </div>
            </div>
        }
        if (activityKey === '3') {
            return <div className={'flex w-full flex-col h-full shrink-0 bg-white dark:bg-[#141414]'}>
                {/*{renderTop()}*/}
                <div className={'flex flex-row h-full'}>
                    <div className={'flex w-1/2 border-r border-[#ddd] dark:border-[#474747]'}>
                        <TextArea
                            value={unicode}
                            variant={"borderless"}
                            allowClear
                            maxLength={1000}
                            onChange={onChangeUnicode}
                            placeholder="请输入文本"
                            style={{height: '100%', resize: 'none', fontSize: '16px'}}
                        />
                    </div>
                    <div
                        className={'flex w-1/2 h-full max-h-[calc(100vh-106px)] p-2 text-wrap break-all overflow-y-auto bg-[#fafafa] dark:bg-[#272727]'}>
                        {unicodeVal ? unicodeVal : <div className={'text-[#5f6368]'}>Unicode编码</div>}
                    </div>
                </div>
            </div>
        }
        if (activityKey === '4') {
            return <div className={'flex w-full flex-col h-full shrink-0 bg-white  dark:bg-[#141414]'}>
                {/*{renderTop()}*/}
                <div className={'flex flex-row h-full'}>
                    <div className={'flex w-1/2 border-r border-[#ddd] dark:border-[#474747]'}>
                        <TextArea
                            value={base64}
                            variant={"borderless"}
                            maxLength={1000}
                            allowClear
                            onChange={onChangeBase64}
                            placeholder="请输入文本"
                            style={{height: '100%', resize: 'none', fontSize: '16px'}}
                        />
                    </div>
                    <div
                        className={'flex w-1/2 h-full max-h-[calc(100vh-106px)] p-2 text-wrap break-all overflow-y-auto bg-[#fafafa] dark:bg-[#272727]'}>
                        {base64Val ? base64Val : <div className={'text-[#5f6368]'}>Base64编码</div>}
                    </div>
                </div>
            </div>
        }
        if (activityKey === '5') {
            return <div className={'flex w-full flex-col h-full shrink-0 bg-white dark:bg-[#141414]'}>
                {/*<div*/}
                {/*    className={'font-medium p-2 py-3 border-b border-[#ddd] dark:border-[#474747] bg-[#fafafa] dark:bg-[#1D1D1D]'}>MD5加密*/}
                {/*</div>*/}
                <div className={'flex flex-row h-full'}>
                    <div className={'flex w-1/2 border-r border-[#ddd] dark:border-[#474747]'}>
                        <TextArea
                            value={md5}
                            variant={"borderless"}
                            maxLength={1000}
                            allowClear
                            onChange={onChangeMd5}
                            placeholder="请输入文本"
                            style={{height: '100%', resize: 'none', fontSize: '16px'}}
                        />
                    </div>
                    <div
                        className={'flex w-1/2 flex-col items-center justify-start p-3 gap-4  bg-[#fafafa] dark:bg-[#272727]'}>
                        <Space.Compact style={{width: '100%'}}>
                            <Input addonBefore="16位小写" value={md5Val.val16Lowercase} placeholder={'待生成'}/>
                            <Button icon={<CopyOutlined/>} onClick={() => onCopy(md5Val.val16Lowercase)}>复制</Button>
                        </Space.Compact>
                        <Space.Compact style={{width: '100%'}}>
                            <Input addonBefore="16位大写" value={md5Val.val16Uppercase} placeholder={'待生成'}/>
                            <Button icon={<CopyOutlined/>} onClick={() => onCopy(md5Val.val16Uppercase)}>复制</Button>
                        </Space.Compact>
                        <Space.Compact style={{width: '100%'}}>
                            <Input addonBefore="32位小写" value={md5Val.val32Lowercase} placeholder={'待生成'}/>
                            <Button icon={<CopyOutlined/>} onClick={() => onCopy(md5Val.val32Lowercase)}>复制</Button>
                        </Space.Compact>
                        <Space.Compact style={{width: '100%'}}>
                            <Input addonBefore="32位大写" value={md5Val.val32Uppercase} placeholder={'待生成'}/>
                            <Button icon={<CopyOutlined/>} onClick={() => onCopy(md5Val.val32Uppercase)}>复制</Button>
                        </Space.Compact>
                    </div>
                </div>
            </div>
        }
        if (activityKey === '6') {
            return <div className={'flex w-full flex-col h-full shrink-0 bg-white dark:bg-[#141414]'}>
                <div
                    className={'flex w-full border-b border-[#ddd] dark:border-[#474747] p-3 bg-[#fafafa] dark:bg-[#272727]'}>
                    <Space.Compact className={'flex w-full items-center gap-2'}>
                        <Input addonBefore={<Radio.Group
                            options={[
                                {label: 'AES加密', value: 'aes'},
                                {label: 'DES加密', value: 'des'},
                            ]}
                            onChange={({target: {value}}) => {
                                dispatch(setEncodeEncryptAesDes({
                                    type: value,
                                    which: 'type'
                                }))
                            }}
                            value={aesDes.type}
                            size={'small'}
                        />} style={{width: '100%'}} value={aesDes.key} onChange={onChangeAesDesKey}
                               placeholder={'请输入密钥'}/>
                    </Space.Compact>
                </div>
                <div className={'flex w-full h-full flex-row'}>
                    <div className={'flex h-full w-1/2 border-r dark:border-[#474747] border-[#ddd] flex-shrink-0'}>
                        <TextArea
                            value={aesDes.value}
                            variant={"borderless"}
                            allowClear
                            maxLength={1000}
                            onChange={onChangeAesDesValue}
                            placeholder="请输入文本"
                            style={{height: '100%', resize: 'none', fontSize: '16px'}}
                        />
                    </div>
                    <div
                        className={'flex w-1/2 h-full max-h-[calc(100vh-162px)] p-2 flex-col flex-shrink-0 text-wrap break-all overflow-y-auto bg-[#fafafa] dark:bg-[#272727]'}>
                        {aesDesVal ? aesDesVal : <div className={'text-[#5f6368]'}>AES/DES加密</div>}
                    </div>
                </div>
            </div>
        }
        if (activityKey === '7') {
            return <div
                className={'flex w-full flex-col h-full '}>
                {/*<div*/}
                {/*    className={'font-medium p-2 py-3 border-b border-[#ddd] dark:border-[#474747] bg-[#fafafa] dark:bg-[#1D1D1D]'}>时间戳转换*/}
                {/*</div>*/}
                <div className={'flex flex-col h-full'}>
                    <div
                        className={'flex justify-between w-full border-b border-[#ddd] dark:border-[#474747] p-3 '}>
                        <span>当前时间：{time.format('YYYY-MM-DD HH:mm:ss')}</span>
                        <Radio.Group
                            options={[
                                {label: '10位时间戳', value: '10'},
                                {label: '13位时间戳', value: '13'},
                            ]}
                            onChange={({target: {value}}) => {
                                dispatch(setEncodeEncryptTimeStamp({
                                    which: 'type',
                                    type: value
                                }))
                            }}
                            value={timeStamp.type}
                            size={'small'}
                        />
                    </div>
                    <div className={'flex w-full h-full p-3 gap-3 flex-col overflow-y-auto  '}>
                        {/*<Watermark content="时间戳转换" className={'h-full w-full flex p-3 flex-col gap-3'}>*/}
                        <Space.Compact
                            style={{
                                width: '100%',
                            }}>
                            <Input addonBefore={'当前时间戳'} value={timestampVal.currentTimeStampVal}
                                   placeholder={'请输入时间戳'}/>
                            <Button type="default" icon={<CopyOutlined/>}
                                    onClick={() => onCopy(timestampVal.currentTimeStampVal)}>复制</Button>
                            {/*<Input addonBefore={'当前13位时间戳'} value={timestampVal.currentTimeStamp13Val}*/}
                            {/*       placeholder={'请输入时间戳'} allowClear/>*/}
                            {/*<Button type="default"*/}
                            {/*        onClick={() => onCopy(timestampVal.currentTimeStamp13Val)}>复制</Button>*/}
                        </Space.Compact>
                        <Space.Compact
                            style={{
                                width: '100%',
                            }}>
                            <Input addonBefore={'时间戳转换成日期'}
                                   value={timeStamp.timestampToDate}
                                   maxLength={13}
                                   placeholder={'请输入时间戳'}
                                   onChange={(e) => onTimestampChange(e, 'timestampToDate')}
                                   allowClear/>
                            {/*<Button type="primary" onClick={() => onTimestampConvert('timestampToDate', timeStamp.timestampToDate)}>开始转换</Button>*/}
                            <Input addonBefore={''} placeholder={'待生成'} value={timestampVal.timestampToDateVal}/>
                            <Button type="default" icon={<CopyOutlined/>}
                                    onClick={() => onCopy(timestampVal.timestampToDateVal)}>复制</Button>
                        </Space.Compact>
                        <Space.Compact
                            style={{
                                width: '100%',
                            }}>
                            <Input addonBefore={'日期转换成时间戳'}
                                   value={timeStamp.dateToTimeStamp}
                                   onChange={(e) => onTimestampChange(e, 'dateToTimeStamp')}
                                   placeholder={'请输入时间，格式如：2012-12-12 12:12:12'}
                                   allowClear/>
                            {/*<Button type="primary" onClick={() => onTimestampConvert('dateToTimeStamp', timeStamp.dateToTimeStamp)}>开始转换</Button>*/}
                            <Input addonBefore={''} placeholder={'待生成'} value={timestampVal.dateToTimeStampVal}/>
                            <Button type="default" icon={<CopyOutlined/>}
                                    onClick={() => onCopy(timestampVal.dateToTimeStampVal)}>复制</Button>
                        </Space.Compact>
                        {/*</Watermark>*/}

                    </div>
                </div>

            </div>
        }
        if (activityKey === '8') {
            return <div
                className={'flex w-full flex-col h-full dark:border-[#474747] shrink-0 bg-white dark:bg-[#474747]'}>
                <div
                    className={'flex w-full border-b border-[#ddd] dark:border-[#474747] p-3 bg-[#fafafa] dark:bg-[#272727]'}>
                    {/*<Space.Compact className={'w-[300px] flex items-center'}>*/}
                    {/*    <div className={'text-nowrap'}>请输入数量：</div>*/}
                    {/*    <Input defaultValue="100" placeholder={''}/>*/}
                    {/*    <Button type="primary" onClick={onGenerateGuid}>生成</Button>*/}
                    {/*</Space.Compact>*/}
                    <Button type="primary" onClick={onGenerateGuid}>生成100个</Button>
                </div>
                <div
                    className={'flex w-full h-full max-h-[calc(100vh-162px)] p-2 flex-col overflow-y-auto dark:bg-[#141414]'}>
                    {/*<Watermark content="GUID生成" className={'h-full w-full'}>*/}
                    {
                        guid.length > 0 ?
                            guid.map((item, key) => {
                                return <div key={key} className={'flex items-center '}>{item}</div>
                            }) : <div className={'text-[#5f6368]'}>Guid生成</div>
                    }
                    {/*</Watermark>*/}

                </div>
            </div>
        }

        return ''
    }

    function renderTop() {
        return <div>
            {
                ['2', '3', '4', '6', '8'].includes(activityKey) ? <div
                    className={'px-3 py-2 flex items-center justify-between border-b border-[#ddd] dark:border-[#474747] bg-white z-20 dark:bg-[#141414]'}>
                    {/*<span className={'font-medium'}>编码/加密</span>*/}
                    <Radio.Group
                        options={[
                            {label: '编码/加密', value: 'encode'},
                            {label: '解码/解密', value: 'decode'},
                        ]}
                        onChange={({target: {value}}) => {
                            dispatch(setEncodeEncryptMode(value))
                        }}
                        value={mode}
                        size={'small'}
                        optionType="button"
                        buttonStyle="solid"
                    />
                    {/*<div className={'text-xs flex items-center gap-1 cursor-pointer'} onClick={(e) => {*/}
                    {/*    e.stopPropagation()*/}
                    {/*    if (activityKey === '2') {*/}
                    {/*        onCopy(uriVal)*/}
                    {/*    }*/}
                    {/*    if (activityKey === '3') {*/}
                    {/*        onCopy(unicodeVal)*/}
                    {/*    }*/}
                    {/*    if (activityKey === '4') {*/}
                    {/*        onCopy(base64Val)*/}
                    {/*    }*/}
                    {/*}}><CopyOutlined/>复制*/}
                    {/*</div>*/}
                </div> : null
            }
        </div>
    }

    return <div className={cx({
        'flex flex-row h-[100vh] w-full overflow-hidden': true,
        'container': true
    })} onClick={globalUpdate}>
        <div className={'flex flex-col w-full h-full'}>
            <div className={'w-full px-2 pt-2'}>
                <Tabs defaultActiveKey="1"
                      tabBarExtraContent={{
                          right: renderTop()
                      }}
                      items={[
                    {
                        key: '1',
                        label: 'JWT编码'
                    }, {
                        key: '7',
                        label: '时间戳转换'
                    }, {
                        key: '2',
                        label: 'URL编码'
                    }, {
                        key: '3',
                        label: 'Unicode编码'
                    }, {
                        key: '4',
                        label: 'Base64编码'
                    }, {
                        key: '5',
                        label: 'MD5加密'
                    }, {
                        key: '6',
                        label: 'AES/DES加密'
                    }, {
                        key: '8',
                        label: 'Guid生成'
                    }]}
                      type={'card'}
                      onChange={(d) => {
                          console.log('------d-----', d)
                          onChangeCollapse(d)
                      }}
                />
            </div>
            <div className={'h-full'}>
                {renderItems()}
            </div>
        </div>
    </div>
};

export default withRouter(EncodeEncrypt);
