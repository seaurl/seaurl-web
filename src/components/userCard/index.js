'use client'
// import {useState, useEffect} from "react";
import {StarFilled, StarOutlined, EnvironmentOutlined} from "@ant-design/icons";
import UserAtten from '../userAtten'
// import styles from "./index.module.scss";
// import {shallowEqual, useDispatch, useSelector} from "react-redux";
// import cns from "classnames/bind";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {withRouter} from "@/hoc/withRouter";
import {useEffect, useState} from "react";

// let cx = cns.bind(styles);
const UserCard = ({userInfo, routerPush}) => {
    const {data: session} = useSession()
    const [user, setUser] = useState(null)
    // const {me, userInfo} = useSelector((state) => {
    //     const {me, isLogin, userInfo} = state.auth
    //     return {
    //         userInfo,
    //         me,
    //         hydrate: state.system.currentHydrate
    //     }
    // }, shallowEqual);

    // const [user, setUser] = useState(props.user || {});
    // const [mode, setMode] = useState(props.mode || "horizontal");
    // const [showFooter, setShowFooter] = useState(props.showFooter === undefined ? false : props.showFooter);
    // const [showIntroduction, setShowIntroduction] = useState(props.showIntroduction === undefined ? true : props.showIntroduction);
    // const [showLocation, setShowLocation] = useState(props.showLocation === undefined ? true : props.showLocation);
    const router = useRouter();

    useEffect(()=>{
        console.log('userdddddd', userInfo)
        setUser(session?.user)
    },[])

    return (
        <div className={'flex flex-col gap-2'}>
            <div className={'flex flex-col gap-4 items-center justify-center'} onClick={() => {
                // router.push(`/${session?.user?.name}`)
                routerPush(`/${session?.user?.name}`)
            }}>
                <div className={'w-[200px] h-[200px]'}>
                    {
                        user ? <img className={'w-[200px] h-[200px] rounded-full'}
                                       src={`${userInfo?.avatar}?x-oss-process=style/300X300`}/> : null
                    }
                </div>
                <div className={'text-xl cursor-pointer font-medium'}>{user?.name}</div>
            </div>
            {/*<UserAtten userData={userData}/>*/}
        </div>
    );
};

export default withRouter(UserCard);
