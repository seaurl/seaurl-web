'use client'
import React, {useEffect, useState} from "react";
import styles from './index.module.scss'
import {userClickUrl, getTop10LikeUrlsInWeek, getTop10ClickUrlsInWeek} from '@/lib/slices/urlSpaceSlice'
import {useDispatch, useSelector} from "react-redux";
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import Empty from "@/components/empty";
import Loading from '@/components/loading'
import {buildFaviconUrl} from "@/utils/favicon";

const RecommendedUrls = ({isLogin, topUrls = []}) => {
  const dispatch = useDispatch();

  function renderList(){
    if (topUrls?.length===0){
      return <div className={''}>
        {/*<span className={styles.tip}>暂无数据</span>*/}
        {/*<p className={styles.desc}>暂无数据</p>*/}
        <Empty/>
      </div>
    }
    return topUrls.slice(0, 6).map((item, index) => {
      return <div key={index} className={'flex items-center justify-center gap-1 py-2 truncate'}>
        <span className={'flex items-center justify-center w-[20px] h-[20px] bg-white rounded-full shrink-0 truncate overflow-ellipsis'}>
          <img src={buildFaviconUrl(item)} className={'w-[16px] h-[16px]'}/></span>
          <a href={item.url} title={item.title} className={'text-sm hover:underline truncate overflow-ellipsis'} target={'_blank'} onClick={() => {
            if (isLogin) {
              dispatch(userClickUrl(item._id))
            }
          }}>{item.title}</a>
      </div>
    })
  }

  return renderList()
}

export default RecommendedUrls
