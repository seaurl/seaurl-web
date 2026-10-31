'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch} from "react-redux";
import classNames from "classnames/bind";

const LeftPanel = ({rounded}) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()

    useEffect(()=>{

    },[])

    return <div className={classNames({
        'bg-[#e9e8f0] dark:bg-[#141414] h-full': true,
        'rounded-ss-2xl dark:rounded-ss-none': !!rounded
    })}>
        left panel
    </div>
};

export default withRouter(LeftPanel);