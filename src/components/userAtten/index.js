'use client'
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {withRouter} from "@/hoc/withRouter";

const UserAtten = ({userData, routerPush}) => {
    const {data: session} = useSession()

    const router = useRouter();

    function gotoUserUrlSpace() {
        if (session) {
            // router.push(`/${session?.user?.name}`)
            routerPush(`/${session?.user?.name}`)
        } else {
            // router.push(`/login`)
            routerPush(`/login`)
        }
    }

    function gotoUserNoteSpace() {
        if (session) {
            // router.push(`/noteSpace`)
            routerPush(`/noteSpace`)
        } else {
            // router.push(`/login`)
            routerPush(`/login`)
        }
    }

    function gotoUserFileSpace() {
        if (session) {
            // router.push(`/fileSpace`)
            routerPush(`/fileSpace`)
        } else {
            // router.push(`/login`)
            routerPush(`/login`)
        }
    }

    // function gotoUserOnlineTools() {
    //     router.push(`/${userInfo.userName}?tab=following`)
    // }

    return <div className={'flex items-center justify-between px-4'}>
            <div className={'flex flex-col items-center justify-center cursor-pointer '} onClick={gotoUserUrlSpace}>
                <span className={'text-base font-medium'}>{userData?.urlCount}</span>
                <span className={'text-[#333] dark:text-[#CFCAC9] text-xs'}>网址</span>
            </div>
            <div className={'flex flex-col items-center justify-center cursor-pointer'} onClick={gotoUserNoteSpace}>
                <span className={'text-base font-medium'}>{userData?.noteCount}</span>
                <span className={'text-[#333] dark:text-[#CFCAC9] text-xs'}>笔记</span>
            </div>
            <div className={'flex flex-col items-center justify-center cursor-pointer'} onClick={gotoUserFileSpace}>
                <span className={'text-base font-medium'}>{userData?.fileCount}</span>
                <span className={'text-[#333] dark:text-[#CFCAC9] text-xs'}>文件</span>
            </div>
        </div>
}

export default withRouter(UserAtten);
