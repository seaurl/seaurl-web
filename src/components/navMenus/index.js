'use client'
import React, {useState, useEffect} from "react";
import {useRouter} from "next/navigation";

import classNames from "classnames/bind";
import {Badge} from "antd";
import {
    CaretRightOutlined,
    CompassOutlined,
    AppstoreOutlined,
    HomeOutlined,
    IdcardOutlined,
    DatabaseOutlined,
    RightOutlined,
    PicRightOutlined,
    HomeFilled,
    UserOutlined,
    SettingOutlined,
    BellOutlined,
    MailOutlined,
    LockOutlined,
    BgColorsOutlined
} from "@ant-design/icons";
// import { useDispatch, useSelector } from "react-store";
import IconFont from "@/utils/iconFont";
import styles from "./index.module.scss";
import {useSelector} from "react-redux";
import {withRouter} from "@/hoc/withRouter";

let cx = classNames.bind(styles);

const NavMenus = props => {
    const router = useRouter();
    // const [color, setColor] = useState(props.color || "#000");
    const [mode, setMode] = useState(props.mode || 'router');
    const [size, setSize] = useState(props.size || 'large')

    const [primaryColor, setPrimary] = useState('')
    const {platFormTheme} = useSelector(state => state.system)

    useEffect(() => {
        setPrimary(platFormTheme.background === 'dark'
        || (platFormTheme.background === 'system'
            && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#fff' : platFormTheme.color)
    }, [platFormTheme]);

    function onChoosed(menu) {
        if (props.onChoosed) {
            props.onChoosed(menu);
        }
        if (mode === 'router') {
            // router.push(menu.url, {scroll: true});
            if (props.routerPush) {
                props.routerPush(menu.url)
            }
        }
    }

    function renderMenuIcon(icon) {
        switch (icon) {
            case "AppstoreOutlined":
                return <AppstoreOutlined className={''}/>;
            case "HomeFilled":
                return <HomeFilled className={''}/>;
            case "UserOutlined":
                return <UserOutlined className={''}/>;
            case "CompassOutlined":
                return <CompassOutlined className={''}/>;
            case "DatabaseOutlined":
                return <DatabaseOutlined className={''}/>;
            case "CaretRightOutlined":
                return <CaretRightOutlined className={''}/>;
            case "RightOutlined":
                return <RightOutlined className={''}/>;
            case "SettingOutlined":
                return <SettingOutlined className={''}/>;
            case "BellOutlined":
                return <BellOutlined className={''}/>;
            case "MailOutlined":
                return <MailOutlined className={''}/>;
            case "LockOutlined":
                return <LockOutlined className={''}/>;
            case "BgColorsOutlined":
                return <BgColorsOutlined className={''}/>;
            default:
                return <IconFont type={icon} className={''}/>;
        }
    }

    function renderMenus() {
        return props.menus.map((menu, index) => {
            return (
                <div className={'w-full'} key={menu.key}>
                    <div
                        style={{color: props.tab === menu.key ? primaryColor : 'inherit'}}
                        className={props.tab === menu.key ? 'dark:text-white cursor-pointer px-3 py-2 mb-1 rounded-md bg-[#eee] dark:bg-[#2d333b] font-medium gap-2 flex items-center'
                            : 'dark:text-white gap-2 flex items-center cursor-pointer px-3 py-2 mb-1 rounded-md hover:bg-[#eee] dark:hover:bg-[#2d333b]'}
                        onClick={() => {
                            onChoosed(menu);
                        }}>
                        {menu.icon ? renderMenuIcon(menu.icon) : null}
                        {menu.badge ? <Badge/> : null}
                        <span className={'text-sm'}>
              {menu.label}
            </span>
                    </div>
                </div>
            );
        });
    }

    return <div className={'w-full'}>{renderMenus()}</div>;
};

export default withRouter(NavMenus);
