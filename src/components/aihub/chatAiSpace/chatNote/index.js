import {RobotOutlined} from "@ant-design/icons";
import {Avatar} from "antd";
import React from "react";
import {useSelector} from "react-redux";

const ChatNote = (props) => {
    const {platFormTheme} =  useSelector(state =>  state.system)
    return <div className={'p-[20px]'}>
        <div className={'flex items-center flex-col'}>
            <Avatar size={108} src={props.avatar} style={{background: '#fff'}}/>
            <div className={'py-4 text-2xl font-medium'}>您好，我是{props.name}</div>
            <p className={'text-base text-[#3f3f3f] dark:text-white w-full lg:max-w-[60%] text-center'}>{props.desc}</p>
            {/*<p className={'text-base text-[#3f3f3f] dark:text-white'}>开始我们的聊天之旅吧。</p>*/}

        </div>
    </div>
}

export default ChatNote
