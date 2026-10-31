'use client'
import {RobotOutlined, PictureOutlined} from "@ant-design/icons";
import {Avatar} from "antd";
import React from "react";
import {useSelector} from "react-redux";

const EmptyNote = (props) => {
    const {platFormTheme} =  useSelector(state =>  state.system)

    return <div className={'p-[20px]'}>
        <div className={'flex items-center flex-col'}>
            <Avatar size={48} icon={<PictureOutlined />} style={{ backgroundColor: platFormTheme?.color }}/>
            <div className={'py-4 text-2xl font-medium'}>您好，我是ImageAI</div>
            <p className={'text-base text-[#3f3f3f] dark:text-white'}>作为你的智能伙伴，我能文生图像、人像重绘、图片背景替换、涂鸦作画。</p>
            <p className={'text-base text-[#3f3f3f] dark:text-white'}>开始我们的创作之旅吧。</p>
        </div>
    </div>
}

export default EmptyNote
