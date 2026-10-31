'use client'
import React, {useEffect, useRef, useState} from "react";
import UrlTags from "@/components/square/urlTags";
import {useDispatch, useSelector} from 'react-redux'

import {getGithubData} from '@/lib/slices/squareSlice';
import {useRouter, useParams, useSearchParams} from "next/navigation";
import {SearchOutlined, StarOutlined, PicRightOutlined, FireOutlined} from "@ant-design/icons";

import {Button, Drawer, Input, Typography} from "antd";
import InfiniteScroll from 'react-infinite-scroll-component';
import Empty from "@/components/empty";
import Loading from "@/components/loading";
import styles from './index.module.scss'
import cns from "classnames/bind";
import {withRouter} from "@/hoc/withRouter";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

let cx = cns.bind(styles);


const ClientPage = ({data, routerPush}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams()
  const searchParams = useSearchParams()

  // const {query} = router;
  const [loading, setLoading] = useState(true);
  const langList = useRef([])
  const [open, setOpen] = useState(false);

  const [searchValue, setSearchValue] = useState('')
  const pageNum = useRef(1)
  const finished = useRef(false)
  const {tagList, chooseTag} = useSelector(state => state.square)
  const [total, setTotal] = useState(0)
  const [isServe, setIsServe] = useState(true)


  // useEffect(() => {
  //   if (!isMobile) {
  //     setOpen(false)
  //   }
  // }, [isMobile])

  // useEffect(() => {
  //   // 使用 window.scrollTo() 方法将滚动条置顶
  //   // window.scrollTo({
  //   //   top: 0, // 指定垂直偏移量为0，即将滚动条置顶
  //   //   behavior: 'smooth' // 可选，表示平滑滚动动画效果，默认值为 'auto'
  //   // });
  //   // setSearchValue(searchParams.get('search') || '')
  //   // if (data){
  //   //   langList.current = data.rows
  //   //   setTotal(data.total)
  //   //   pageNum.current += 1
  //   // }
  //   // setLoading(false)
  // }, [])

  useEffect(() => {
    setSearchValue(searchParams.get('search') || '')
    if (isServe){
      if (searchParams.get('category')){
        if (data){
          langList.current = data.rows
          setTotal(data.total)
          pageNum.current += 1
        }
        setLoading(false)
        setIsServe(false)
      }else{
        if (tagList.length > 0) {
          // router.push(`/square?category=${tagList[0].code}`, {scroll: true})
          // shallowUpdateRouterParams(`category=${tagList[0].code}`)
          routerPush(`/square?category=${tagList[0].code}`)
        }
      }
    }else{
      if (searchParams.get('category')) {
        setLoading(true)
        langList.current = []
        pageNum.current = 1
        loadMoreData()
      } else {
        if (tagList.length > 0) {
          // router.push(`/square?category=${tagList[0].code}`, {scroll: true})
          // routerPush(`/square?category=${tagList[0].code}`)
          // shallowUpdateRouterParams(`category=${tagList[0].code}`)
          routerPush(`/square?category=${tagList[0].code}`)
        }
      }
    }
  }, [searchParams])

  async function loadMoreData() {
    setLoading(true)
    const fs = tagList.filter(f => f.name === searchParams.get('category'))
    if (fs.length > 0) {
      const result = await dispatch(getGithubData({
        lang: fs[0].code,
        pageNo: pageNum.current,
        param: searchParams.get('search') || ''
      }))
      setLoading(false)
      if (result.payload.data){
        console.log('langList =', langList.current)
        const list = result.payload.data.rows
        const total = result.payload.data.total
        setTotal(total)
        // if ((pageNum.current > 1 && list.length === 0) || langList.current.length >= total) {
        //   finished.current = true
        // }
        langList.current = langList.current.concat(list)
        pageNum.current += 1
      }
    }
  }

  function formatNumber(num) {
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      const formatted = (num / 1000).toFixed(1);
      return `${formatted}k`;
    } else {
      const formatted = (num / 1000000).toFixed(1);
      return `${formatted}w`;
    }
  }

  function goto(url) {
    window.open(url, '_blank')
  }

  const onClose = () => {
    setOpen(false);
  };

  return <div className={'flex items-center justify-center h-full'}>
    <div className={'flex items-start max-w-[1280px] best-w:gap-0 w-full h-full px-[16px]'}>
      <div className={'best-w:invisible best-w:w-0 best-w:pr-0 best-w:border-0 h-[calc(100vh-56px)] flex  sticky top-[56px] border-solid border-[#ddd] dark:border-[#474747] border-r-[1px] pr-[12px] overflow-y-auto flex-shrink-0'}>
        <div className={'w-[160px]'}>
          <UrlTags showTitle={true}/>
        </div>
      </div>

      <div className={'h-full w-full'}>
        <div className={'flex items-center justify-between sticky top-[56px] text-xl font-medium py-2 pr-0 bg-white dark:bg-[#141414] dark:text-white z-20 border-solid border-[#ddd] dark:border-[#474747] border-b-[1px]'}>
          <div className={'best-w:gap-[12px] flex items-center'}>
            <div className={'best-w:visible best-w:w-full w-0 invisible'}>
              <Button size={'small'} icon={<PicRightOutlined className={''} />} onClick={() => {
                setOpen(true)
              }
              }></Button>
            </div>

            <span className={'pl-2 best-w:pl-0'}>{searchParams.get('category') || ''}</span>
          </div>
          <div>
            <Input
                defaultValue={searchParams.get('search') || ''}
                value={searchValue || ''}
                className={''}
                placeholder="请输入搜索内容"
                onChange={(e) => {
                  setSearchValue(e.target.value)
                }}
                onPressEnter={(e) => {
                  if (searchParams.get('category') && e.target.value) {
                    // router.push(`/square?category=${searchParams.get('category')}&search=${e.target.value}`, {scroll: true})
                    shallowUpdateRouterParams(`category=${searchParams.get('category')}&search=${e.target.value}`)
                  } else {
                    // router.push(`/square?category=${searchParams.get('category')}`, {scroll: true})
                    shallowUpdateRouterParams(`category=${searchParams.get('category')}`)
                  }
                }}
                prefix={<SearchOutlined onClick={() => {
                }
                }/>}
                style={{borderRadius: 8, borderWidth: 2}}
                allowClear
            />
          </div>
        </div>
        {/*注意：这里不能写成id='scrollableDiv2'，我也不知道为什么*/}
        <div id={styles.scrollableDiv2} className={'py-[12px]'}>
          {
            loading && pageNum.current === 1 ?
                <div className={'flex items-center justify-center w-full'}>
                  <Loading/>
                </div> : langList.current.length > 0 ?
                    <InfiniteScroll
                        //注意：dataLength={remindList.length}要写remindList.length不能写成remindListTotal,切记！
                        dataLength={langList.current.length}
                        next={loadMoreData}
                        hasMore={langList.current.length < total}
                        loader={<div className={'w-full flex justify-center items-center'}>
                          {loading ? <Loading/> : null}
                        </div>}
                        scrollableTarget="scrollableDiv2">
                      <div className={'grid grid-cols-auto-250 auto-rows-max gap-y-[42px] gap-x-[24px] items-center pl-[32px] best-w:pl-0'}>
                        {
                          langList.current.map((item, index) => {
                            return <div key={`${item.node_id}-${index}`} className={'flex flex-start self-stretch flex-row gap-2'}>
                              <div onClick={() => goto(item.html_url)} className={'w-[56px] h-[56px] flex-shrink-0 rounded-full shadow flex items-center justify-center'}>
                                {
                                  item && item.owner && item.owner.avatar ? <img src={item.owner.avatar} className={'w-[36px] h-[36px]'}/> :
                                      item.owner.avatar_url ? <img src={item.owner.avatar_url} className={'w-[36px] h-[36px] flex-shrink-0'}/> :
                                          <FireOutlined style={{fontSize: '20px'}}/>
                                }
                              </div>
                              <div className={'flex items-start flex-col'}>
                                <div onClick={() => goto(item.html_url)} className={cx({
                                  'font-medium':true,
                                  'text-xl': true,
                                  'cursor-pointer': true,
                                  'name': true,
                                  'hover:underline': true
                                })}>{item.name || '-'}</div>
                                {/*{item.homepage ? <a href={item.homepage} target={'_blank'}>{item.homepage}</a> : null}*/}
                                <div title={item.description} className={styles.desc}>{item.description}</div>
                                <div className={'pt-2'}>
                                  <Button type="default" size={'small'} icon={<StarOutlined/>} onClick={() => {
                                    goto(item.html_url + '/stargazers')
                                  }
                                  }>{formatNumber(item.stargazers_count)}</Button>
                                </div>
                              </div>
                            </div>
                          })
                        }
                      </div>
                    </InfiniteScroll> : <div className={'flex items-center justify-center w-full'}><Empty/></div>
          }
        </div>
      </div>
    </div>
    <Drawer title="开发语言" width={280} placement="left" onClose={onClose} open={open} styles={{
      body: {
        padding: '0',
      },
    }}>
      <div className={'w-full px-2'}>
        <UrlTags showTitle={false} choose={onClose}/>
      </div>
    </Drawer>
  </div>
}
export default withRouter(ClientPage)
