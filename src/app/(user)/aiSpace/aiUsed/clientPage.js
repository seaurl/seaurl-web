'use client'

import {useRouter, useSearchParams} from "next/navigation";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {setDataFromServerForUserAiTools} from '@/lib/slices/aiSpaceSlice'
import Sidebar from "@/components/aiSpace/aiUsed/sidebar";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
import Empty from "@/components/empty";
import ImageAiSpace from "@/components/aihub/imageAiSpace";
import ChatAiSpace from "@/components/aihub/chatAiSpace";
import Calculator from "@/components/aihub/calculator";
import Translator from "@/components/aihub/translator";
import QrcodeTool from "@/components/aihub/qrcode";
import JsonFormat from "@/components/aihub/jsonFormat";
import EncodeEncrypt from "@/components/aihub/encodeEncrypt";
import CodeComparison from "@/components/aihub/codeComparison";
import CodeEditor from "@/components/aihub/codeEditor";
import FileTransfer from "@/components/aihub/fileTransfer";
// import Notepad from "@/components/aiSpace/notepad";
import HttpRequest from "@/components/aihub/httpRequest";
import OnlyOffice from "@/components/aihub/onlyoffice";
import ExcaliDraw from "@/components/aihub/excaliDraw";
import Drawio from "@/components/aihub/drawio";
import ChatList from "@/components/aihub/chatAiSpace/chatList";
import News from "@/components/aihub/news";
import Weather from "@/components/aihub/weather";
import Calendar from "@/components/aihub/calendar";
import MedicalRecord from "@/components/aihub/medicalRecord";
import Bpmn from "@/components/aihub/bpmn";
import NewChatList from "@/components/aihub/chatAiSpace/newChatList";
import KeyManage from "@/components/aihub/keyManage";
import Markdown from "@/components/aihub/markdown";
import Timesheet from "@/components/aihub/timesheet";
import PasswordManager from "@/components/aihub/passwordManager";

const ClientPage = (props) => {
    const router = useRouter();
    const dispatch = useDispatch()
    const [isServer, setServer] = useState(true)
    const query = useSearchParams()
    const {userAiToolsList} = useSelector(state => state.aiSpace)
    const {platFormTheme} = useSelector(state => state.system)

    useEffect(() => {

        if (isServer) {
            setServer(false)
            console.log('aiu sed server data=', props)
            dispatch(setDataFromServerForUserAiTools({
                userAiToolsList: props.data,
                usedId: query.get('usedId')
            }))
            if (!query.get('usedId') && props.data.length > 0) {
                shallowUpdateRouterParams("usedId=" + props.data[0].usedId)
            }
        }
    }, [])

    // useEffect(() => {
    //     if (query.get('usedId')){
    //         renderTools()
    //     }
    // }, [query.get('usedId')])

    function renderTools() {
        const usedId = query.get('usedId')
        console.log('userAiToolsList-', userAiToolsList)
        const fs = userAiToolsList.filter(f => f.usedId === usedId)
        if (fs.length > 0) {
            console.log('----------renderTools fs----------', fs)
            const type = fs[0].type
            // const model = fs[0].model
            if (type === "ai-wanx") {
                return <ImageAiSpace/>
            }
            if (type.startsWith("ai-")) {
                // 使用 key 强制重新挂载：通过为每个返回的组件添加 key 属性，可以强制 React 在每次 key 变化时重新创建和销毁组件。
                // 注意：chooseUserAiTool变了，但是子组件init方法获取的不是最新的，所以我从父组件传递过来一个新属性chatAi作为唯一判断标准
                // return <ChatList key={usedId} chatAi={fs[0]}/>
                return <NewChatList key={usedId} chatAi={fs[0]}/>
            }
            if (type.toLowerCase() === "bpmn") {
                return <Bpmn/>
            }
            if (type.toLowerCase() === "keymanage") {
                return <KeyManage />
            }
            if (type.toLowerCase() === "markdown") {
                return <Markdown/>
            }
            if (type === "medicalRecord") {
                return <MedicalRecord/>
            }
            if (type === 'calendar') {
                return <Calendar/>
            }
            if (type === 'news') {
                return <News/>
            }
            if (type === 'weather') {
                return <Weather/>
            }
            if (type === 'calculator') {
                return <Calculator/>
            }
            if (type === 'translation') {
                return <Translator/>
            }
            if (type === 'qrcode') {
                return <QrcodeTool/>
            }
            if (type === 'json-format') {
                return <JsonFormat/>
            }
            if (type === 'encode-encrypt') {
                return <EncodeEncrypt/>
            }

            if (type === 'code-comparison') {
                return <CodeComparison/>
            }
            if (type === 'code-editor') {
                return <CodeEditor/>
            }
            if (type === 'file-transfer') {
                return <FileTransfer/>
            }
            // if (type === 'file-transfer'){
            //     return <Notepad />
            // }
            if (type === 'http-request') {
                return <HttpRequest/>
            }
            if (type === 'onlyoffice') {
                return <OnlyOffice/>
            }
            if (type === 'excalidraw') {
                return <ExcaliDraw/>
            }
            if (type === 'drawio') {
                return <Drawio/>
            }
            if (type === 'timesheet') {
                return <Timesheet/>
            }
            if (type === 'passwordManager') {
                return <PasswordManager/>
            }
        }
        return null
    }

    return <div className={'flex w-[calc(100vw-60px)]'}>
        <div
            className={'flex-col w-[230px] border-r border-[#e5eaee] dark:border-[#474747] overflow-y-auto h-[100vh] hidden xl:flex shrink-0'}>
            <Sidebar/>
        </div>
        <div className={'w-full xl:w-[calc(100%-230px)] h-[100vh] shrink-0'}>
            {
                query.get('usedId') ? renderTools() :
                    <Empty title={<div className={'flex items-center justify-center text-xl py-4'}>
                        请选择左侧工具，或者去<span className={'hover:underline cursor-pointer font-medium px-2'}
                                                   style={{color: platFormTheme.color}} onClick={() => {
                        router.push('/aiSpace/aiTools')
                    }}>工具</span>中添加
                    </div>}/>
            }
        </div>
    </div>
}

export default ClientPage
