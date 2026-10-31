'use client'
import styles from './index.module.scss'
import React, {useState, useEffect, useContext, memo, useLayoutEffect} from "react";
import {useDispatch, useSelector} from 'react-redux'
import {getMsnData} from '@/lib/slices/squareSlice';

import {useRouter, useParams, useSearchParams} from "next/navigation";
import {StarFilled, StarOutlined, CopyOutlined, AimOutlined, SearchOutlined} from "@ant-design/icons";
import dayjs from "dayjs";
import {Typography, Button, Input, Tabs, List, Avatar} from "antd";
import InfiniteScroll from 'react-infinite-scroll-component';
import Empty from "@/components/empty";
import Loading from "@/components/loading";
import {useAppSelector} from "@/lib/hooks";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
const ClientPage = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams()
  const searchParams = useSearchParams()
  const [page, setPage] = useState({
    pageNum: 0,
    total: 0
  })
  const {platFormTheme} = useAppSelector(state => state.system)
  const [isServe, setIsServe] = useState(true)
  const query = useSearchParams()


  const tabList = [

    {
      key: 'Y_77f04c37-b63e-46b4-a990-e926f7d129ff',
      label: '资讯'
    },
    {
      key: 'Y_49e75779-668d-4379-952f-8f366d0a1acf',
      label: '科技'
    },
    {
      key: 'finance_news',
      label: '财经'
    },
    {
      key: 'Y_ffca5126-f1eb-4232-a09d-0cc253506007',
      label: '娱乐'
    },
    {
      key: 'Y_21b7d513-d3fa-45e0-91c8-c9a2ea25272f',
      label: '生活'
    },
    {
      key: 'Y_0319d67d-6e91-4b00-8ed8-0f3d5f957680',
      label: '教育'
    },
    {
      key: 'Y_a66938e0-1d0f-4e74-9a37-a8a2513a59f0',
      label: '汽车'
    },
    {
      key: 'Y_da8de783-28cd-4248-9b12-ca42f01520ff',
      label: '体育'
    }, {
      key: 'Y_b2251eaa-d926-441a-97de-ce74046fc6a8',
      label: '悦读'
    },
  ];
  const [msnDataList, setMsnDataList] = useState([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isServe){
      // console.log('props ===',props)
      let sections = props.data
      if (sections && sections[0].subSections.length > 0) {
        setResToList(sections)
      }
      setIsServe(false)
    }else{
      loadMoreData()
    }
  }, [searchParams])


  function setResToList(sections){
    let list = []
    if (query.get('tab') === 'finance_news'){
      sections[0].subCards?.forEach(item => {
        list = list.concat(item)
      })
    }else{
      sections[0].subSections?.forEach(item => {
        list = list.concat(item.cards)
      })
    }
    const flist = list.filter(f => f.id)
    const newList = msnDataList.concat(flist)
    setMsnDataList(newList)
    setPage({
      pageNum: page.pageNum + 1
    })
  }

  async function loadMoreData() {
    setLoading(true)
    // console.log('------msnDataList-----',msnDataList)
    const result = await dispatch(getMsnData({
      tabId: searchParams.get('tab') || tabList[0].key,
      pageNo: page.pageNum
    }))
    setLoading(false)
    // console.log('loadMoreData result=', result)
    // console.log('initData result.data=', result.data)
    let sections = []
    if (query.get('tab') === 'finance_news'){
      sections = result.payload.value
    }else{
      sections = result.payload.sections
    }

    if (sections && sections.length > 0) {
      setResToList(sections)
    }
  }

  function renderList() {
    return msnDataList.map((item, index) => {
      return <div key={`${item.id}-${index}`} className={'flex items-start flex-col self-stretch rounded-xl'}
                  style={{backgroundColor: platFormTheme.background === 'dark'
                    || (platFormTheme.background === 'system'
                        && window.matchMedia('(prefers-color-scheme: dark)').matches)?'#333':
                        item.colorSamples ? item.colorSamples[1].hexColor : '#fff'}}
                  onClick={() => {
                    window.open(item.url, '_blank')
                  }}>
        {item.images && item.images.length > 0 ?
          <div className={'w-full h-[157px] '}>
            <img src={item.images[0].url} className={'w-full h-full object-cover rounded-tl-xl rounded-tr-xl'}/>
          </div> : null
        }
        <div className={'p-3'}>
          {
            item.provider ? <div className={'flex flex-row gap-2 items-center  pb-2'}>
              <div className={'w-[16px] h-[16px]'}>
                <img src={item.provider.logoUrl} className={'w-full h-full'}/>
              </div>
              <div className={'text-sm cursor-pointer'}>{item.provider.name}</div>
              <div className={'text-sm'}>{dayjs(dayjs.utc(item.publishedDateTime).local()).fromNow()}</div>
            </div> : null
          }
          <div className={styles.info} title={item.title}>
            {item.title}
          </div>
        </div>
      </div>
    })
  }

  function onTabClick(key, event) {
    if (key) {
      console.log('key===', key)
      setLoading(true)
      setMsnDataList([])
      setPage({
        pageNum: 0
      })
      // router.push(`/news?tab=${key}`, {scroll: true})
      shallowUpdateRouterParams(`tab=${key}`)
    }
  }


  return <div className={'w-full h-full overflow-y-auto px-[16px] py-[12px]'}>
    <div className={'max-w-[900px]'}>
    <div className={styles.container}>
    {/*//这里使用hidden 和 block解决tabs属性centered时显示问题*/}
    <div className={'block lg:hidden w-full sticky top-0 bg-white dark:bg-[#1C2127] dark:text-white'}>
      <Tabs defaultActiveKey={searchParams.get('tab') || tabList[0].key} items={tabList} size={'large'}
            animated={false}
            onTabClick={onTabClick}/>
    </div>
    <div className={'hidden lg:block w-full sticky top-0 bg-white dark:bg-[#1C2127] dark:text-white'}>
      <Tabs defaultActiveKey={searchParams.get('tab') || tabList[0].key} centered items={tabList} size={'large'}
            animated={false}
            onTabClick={onTabClick}/>
    </div>
    <div className={''}>
      {/*注意：这里不能写成id='scrollableDiv2'，我也不知道为什么*/}
      <div id={styles.scrollableDiv2}>
        {
          loading && page.pageNum === 0 ?
              <div className={'flex items-center justify-center w-full'}><Loading/></div> : msnDataList.length > 0 ?

                  <InfiniteScroll
                      //注意：dataLength={remindList.length}要写remindList.length不能写成remindListTotal,切记！
                      dataLength={msnDataList.length}
                      next={loadMoreData}
                      hasMore={msnDataList.length < 200}
                      loader={<div className={'flex items-center justify-center w-full'}>
                        {loading ? <Loading/> : null}
                      </div>}
                      scrollableTarget="scrollableDiv2">
                    <div className={'grid grid-cols-auto-300 gap-[20px] p-[16px]'}>
                      {renderList()}
                    </div>
                  </InfiniteScroll> : <div className={'flex items-center justify-center w-full'}><Empty/></div>
        }
      </div>
    </div>
    </div>
  </div>
  </div>
}


export default ClientPage
