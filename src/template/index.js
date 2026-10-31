'use client'
import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch} from "react-redux";

const UserCard = (props) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()

    useEffect(()=>{

    },[])

    return <div className={'flex flex-col gap-2'}>
        sadasd
    </div>
};

export default withRouter(UserCard);