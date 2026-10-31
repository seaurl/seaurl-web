'use client'
import React, {useState} from "react";
import {Row, Col, Space, Dropdown} from "antd";
import {StarFilled, StarOutlined, CopyOutlined, AimOutlined, EllipsisOutlined} from "@ant-design/icons";
// import styles from "./index.module.scss";
import Empty from "@/components/empty";
import {
  userClickUrl,
} from '@/lib/slices/urlSpaceSlice';
import {useDispatch, useSelector} from "react-redux";
// import cns from "classnames/bind";
import dayjs from "dayjs";
import {buildFaviconUrl, DEFAULT_FAVICON} from "@/utils/favicon";
// let cx = cns.bind(styles);

const FavoriteUrls = props => {
  const dispatch = useDispatch();
  // const {
  //   me, isLogin, userInfo
  // } = useSelector((state) => state.auth)
  const {platFormTheme} = useSelector(state => state.system)

  function getViewCount(url, text) {
    if (url.clickCount && Array.isArray(url.clickCount)) {
      return `${url.clickCount && url.clickCount.length > 0 ? url.clickCount.reduce((a, b) => a + b) : 0} ${text}`
    } else {
      return `${url.clickCount || 0} ${text}`
    }
  }

  if (props.urls.length === 0){
    return <Empty/>
  }

  return <div className={'grid grid-cols-1 gap-4 xl:grid-cols-3 md:grid-cols-2'}>
      {
            props.urls.map((url, index) => {
              return <div className={'flex flex-col p-4 gap-2 border border-[#ddd] rounded-xl bg-[#fafafa] dark:bg-[#1c2127] dark:border-[#474747]'}>
                {/*<div className={'flex items-center gap-2'}>*/}
                {/*      <span className={''}>*/}
                {/*        <img alt={""} className={'w-[16px] h-[16px]'}*/}
                {/*                                src={url.favicon || "https://com-seaurl-cdn.oss-cn-hangzhou.aliyuncs.com/space/url/www/default.png"}/>*/}
                {/*      </span>*/}
                {/*  <span className={''} onClick={() => {*/}
                {/*    window.open((new URL(url.url)).protocol + '//' + url.domain, '_blank')*/}
                {/*  }}>{url.domain}</span>*/}
                {/*</div>*/}
                <div className={'truncate flex items-center gap-2'} onClick={() => {
                  if (isLogin) {
                    dispatch(userClickUrl(url.id))
                  }
                }}>
                  <div className={'w-[26px] h-[26px] bg-[#eee] dark:bg-white border border-[#ecedef] rounded-full flex items-center justify-center shrink-0'}>
                    <img alt={""} className={'w-[16px] h-[16px]'}
                         src={buildFaviconUrl(url)} onError={(e) => {
                      e.target.onerror = null; // 防止无限循环
                      e.target.src = DEFAULT_FAVICON; // 默认图片地址
                    }}/>
                  </div>
                  <a className={'font-medium truncate text-md hover:underline'} href={url.url} target={'_blank'}>

                    {url.title}
                  </a>
                </div>
                <div className={'flex items-center gap-1 text-sm pl-[24px] text-[#1f2328] dark:text-[#cfcac9]'}>
                  <div className={''}>
                          <span className={''}>
                              {getViewCount(url, '浏览')}
                          </span>
                  </div>
                  <span className={''}>•</span>
                  <span className={''}>
                            {url.userCopyUrl_count || 0} 复制
                        </span>
                  <span className={''}>•</span>
                  <div className={''}>{dayjs(url.createdDt).fromNow()}</div>
                </div>
              </div>
            })
      }
  </div>
};

export default FavoriteUrls;
