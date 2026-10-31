'use client'
import React, {useEffect, useMemo, useState, useRef, memo, useCallback, useLayoutEffect} from "react";
import {Input, Radio, Select, Segmented, Flex, message, Space} from 'antd';
import {RobotOutlined, CloudUploadOutlined, FileImageOutlined, FileSyncOutlined} from "@ant-design/icons";
import {Button} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {useRouter, useSearchParams} from "next/navigation";
import {
    generate,
    add,
    concatImageAiInImageList,
    setImageRatio,
    resetPage,
    queryImageList
} from '@/lib/slices/imageAiSpaceSlice'
import classNames from "classnames/bind";
import {withRouter} from "@/hoc/withRouter";
import {queryUserAiTools, updateDt} from "@/lib/slices/aiSpaceSlice";

const {TextArea} = Input;

const ControlPanel = ({onClickGenerate, isDrawer, routerPush, prompt}) => {
    const [messageApi, contextHolder] = message.useMessage();

    const dispatch = useDispatch();
    const router = useRouter();
    // const {query} = router;
    const query = useSearchParams()

    const [value, setValue] = useState('');
    const [ratio, setRatio] = useState('1024*1024');
    const [aiModel, setAiModel] = useState('wanx-v1');
    const [size, setSize] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPrompt, setShowPrompt] = useState(true)

    const {loadingImageList, loadingGenerateImage, imageList} = useSelector((state) => state.imageAiSpace);

    useEffect(() => {
        if (prompt) {
            setValue(prompt)
        }
    }, [prompt])

    useEffect(() => {
        if (imageList.length >0){
            setLoading(imageList[0].status === "2")
        }
    }, [imageList])



    function onSwitchAi() {
        console.log('switch to chat ai')
        // router.push(`/aiSpace/chatAi`)
        routerPush(`/aiSpace/chatAi`)
    }

    function onChangeAiModel(e) {
        console.log('onChangeAiModel e=', e)
        setAiModel(e)
    }

    function onChangeRatio(e) {
        dispatch(setImageRatio(e))
        setRatio(e)
    }

    function onGenerate() {
        if (onClickGenerate) {
            onClickGenerate()
        }
        generateImage()
    }

    async function generateImage() {
        if (value) {
            const res1 = await dispatch(add({
                aiModel,
                count: 1,
                ratio: ratio,
                prompt: value
            }))
            console.log('generateImage res1 = ', res1)
            if (res1.payload && res1.payload.data && res1.payload.data.imageAiId) {
                let result = null
                if (aiModel === 'wanx-v1') {
                    result = await dispatch(generate({
                        imageAiId: res1.payload.data.imageAiId
                    }))
                }
                // if (aiModel === 'wanx-style-cosplay-v1') {
                //     result = await dispatch(generate({
                //         imageAiId: res1.payload.data.imageAiId
                //     }))
                // }
                //
                // if (aiModel === 'wanx-style-repaint-v1') {
                //     result = await dispatch(generate({
                //         imageAiId: res1.payload.data.imageAiId
                //     }))
                // }
                console.log('generateImage result = ', result)
                if (result?.payload?.status === 0) {
                    // setLoading(false)
                }else{
                    generateError()
                }
            }else{
                generateError()
            }
        } else {
            messageApi.info('请输入图片描述');
        }

    }

    async function generateError() {
        messageApi.error('图片生成失败');
        await dispatch(resetPage())
        dispatch(queryImageList())
    }

    return <div className={classNames({
        'relative overflow-y-auto dark:bg-[#141414]': true,
        'h-screen': isDrawer,
        'h-[calc(100vh-60px)]': !isDrawer
    })}>
        {contextHolder}
        <div className={'pt-[12px] px-[16px] flex items-center justify-between'}>
            <div className={'text-xl font-medium'}>图片生成</div>
            <div className={''}>
                {/*<Button type="default" block size={'large'} icon={<RobotOutlined />} onClick={onSwitchAi}>*/}
                {/*    切换到ChatAI*/}
                {/*</Button>*/}
            </div>
        </div>
        <div className={'flex flex-col px-[16px] py-[12px]'}>
            <div className={'text-sm pb-[12px]'}>模型</div>
            <div>
                {/*<Radio.Group defaultValue="a" size="large" optionType="button"*/}
                {/*             buttonStyle="solid">*/}
                {/*    <Radio value="a">文本生成图像</Radio>*/}
                {/*    <Radio value="b">人像风格重绘</Radio>*/}
                {/*    <Radio value="c">图像背景生成</Radio>*/}
                {/*    <Radio value="d">涂鸦作画</Radio>*/}
                {/*</Radio.Group>*/}
                <Select
                    disabled
                    defaultValue="文本生成图像"
                    style={{width: '100%'}}
                    onChange={onChangeAiModel}
                    options={[
                        {value: 'wanx-v1', label: '文本生成图像'},
                        {value: 'wanx-style-cosplay-v1', label: 'Cosplay动漫人物生成'},
                        {value: 'wanx-style-repaint-v1', label: '人像风格重绘'},
                        {value: 'wanx-background-generation-v2', label: '图像背景生成'},
                        {value: 'wanx-sketch-to-image-lite', label: '涂鸦作画'},
                        {value: 'wanx-anytext-v1', label: '图文融合'},
                    ]}
                />
                {/*<Segmented size={'large'} options={['文生图', '人像重绘', '背景替换', '涂鸦作画']} block onChange={onChangeAiModel}/>*/}

            </div>
        </div>

        {['wanx-v1', 'wanx-anytext-v1'].includes(aiModel) ? <div className={'flex flex-col px-[16px] py-[12px]'}>
            <div className={'text-sm pb-[12px]'}>输入</div>
            <div>
                <TextArea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="描述想要生成的图片"
                    autoSize={{minRows: 3, maxRows: 5}}
                />
            </div>
        </div> : null}
        {!['wanx-v1'].includes(aiModel) ? <div className={'flex flex-col px-[16px] py-[12px]'}>
            <div className={'text-sm pb-[12px]'}>上传</div>
            <div>
                <Button icon={<CloudUploadOutlined/>} block>导入参考图</Button>
            </div>
        </div> : null}
        <div className={'flex flex-col px-[16px] py-[12px]'}>
            <div className={'text-sm pb-[12px]'}>比例</div>
            <div>
                <Select
                    defaultValue="1024*1024"
                    style={{width: '100%'}}
                    size={'large'}
                    onChange={onChangeRatio}
                    options={[
                        {
                            value: '1024*1024',
                            label: <div className={'flex items-center gap-[12px]'}>
                                <div className={'w-[40px]'}>1024*1024</div>
                                {/*<div className={styles.b169}></div>*/}
                            </div>
                        },
                        {
                            value: '720*1280',
                            label: <div className={'flex items-center gap-[12px]'}>
                                <div className={'w-[40px]'}>720*1280</div>
                                {/*<div className={styles.b32}></div>*/}
                            </div>
                        },
                        {
                            value: '1280*720',
                            label: <div className={'flex items-center gap-[12px]'}>
                                <div className={'w-[40px]'}>1280*720</div>
                                {/*<div className={styles.b43}></div>*/}
                            </div>
                        },

                    ]}
                />
            </div>
        </div>

        <div className={'absolute bottom-0 left-0 right-0 w-full'}>
            <div className={'px-[16px] py-[12px]'}>
                <Flex gap="middle">
                    {/*<Button type="default" block size={'large'} icon={<RobotOutlined />} onClick={onSwitchAi}>*/}
                    {/*    切换到ChatAI*/}
                    {/*</Button>*/}
                    <Button size={'large'}
                            block={true}
                            type={'primary'}
                            loading={loading}
                            icon={<FileSyncOutlined/>}
                            onClick={onGenerate}>{loading ? '正在生成...' : '立即生成'}</Button>
                </Flex>
            </div>
        </div>
    </div>
}

export default withRouter(ControlPanel)