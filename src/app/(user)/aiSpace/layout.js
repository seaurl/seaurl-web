'use client'
import {useSelector} from "react-redux";
import {usePathname, useSearchParams} from "next/navigation";
import {useState} from "react";
import {withRouter} from "@/hoc/withRouter";
import {Button, Drawer} from "antd";
// import ChatAiSpace from "@/components/aiSpace/chatAiSpace/sideList";
import ImageAiSidebar from "@/components/aihub/imageAiSpace/controlPanel";
import AiToolsSidebar from "@/components/aiSpace/aiTools/sidebar";
import AiUsedSidebar from "@/components/aiSpace/aiUsed/sidebar";
import {loader } from '@monaco-editor/react';
// 从本地文件加载，而不是cdn
loader.config({
    paths: {
        // vs: 'https://cdn.seaurl.com/space/ai/monaco/package/min/vs'
        vs: '/monaco-editor/min/vs'
    },
    'vs/nls': {
        availableLanguages: {
            '*': 'en',
        },
    }
})

// children:will be a page or nested layout
function AiSpaceLayout({children, routerPush}) {
    const pathname = usePathname()
    const query = useSearchParams()

    const [open, setOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState(false)
    const {userAiToolsList} = useSelector(state => state.aiSpace)
    const onClose = () => {
        setOpen(false);
        setOpenMenu(false)
    };

    function renderDrawerByPath() {
        const usedId = query.get('usedId')
        const fs = userAiToolsList.filter(f => f.usedId === usedId)
        if (fs.length > 0){
            // 如果是通义万相就显示
            if (fs[0].type.includes('wanx')){
                return <ImageAiSidebar isDrawer onClickGenerate={() => setOpen(false)}/>
            }
        }
        return null
    }

    function renderMenu() {
        if (pathname.includes('aiSpace/aiUsed')) {
            return <AiUsedSidebar onClickTool={() => setOpenMenu(false)}/>
        }
        if (pathname.includes('aiSpace/aiTools')) {
            return <AiToolsSidebar onClickTool={() => setOpenMenu(false)}/>
        }
        return null
    }

    function showBottomBtn() {
        const usedId = query.get('usedId')
        const fs = userAiToolsList.filter(f => f.usedId === usedId)
        if (fs.length > 0){
            // 如果是通义万相就显示
            if (fs[0].type.includes('wanx')){
                return true
            }
        }
        return false
    }

    return (
        <div className={'w-full flex'}>
            {children}
            <Drawer title="" width={320} placement="left" onClose={onClose} closable={false} open={open} styles={{
                body: {padding: '0'}
            }}>
                {renderDrawerByPath()}
            </Drawer>

            <Drawer title="" width={280} placement="left" onClose={onClose} closable={false} open={openMenu} styles={{
                body: {padding: '0'}
            }}>
                {renderMenu()}
            </Drawer>
        </div>
    )
}

export default withRouter(AiSpaceLayout)
