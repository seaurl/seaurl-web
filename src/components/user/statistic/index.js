'use client'
import {useRouter} from "next/navigation";
import {useDispatch, useSelector} from 'react-redux'
import {withRouter} from "@/hoc/withRouter";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";
const Statistic = ({guysData, guysInfo, routerPush}) => {
  const router = useRouter();
  const {platFormTheme} = useSelector(state => state.system)

  function gotoRank(){
    // router.push(`/rank`)
    routerPush(`/rank`)
  }

  function gotoUrlSpace(type) {
    // router.push(`/${guysInfo.userName}/urlSpace`)
    routerPush(`/${guysInfo.userName}/urlSpace`)
  }

  function gotoNoteSpace() {
    // router.push(`/noteSpace`)
    routerPush(`/noteSpace`)
  }

  function gotoFileSpace() {
    // router.push(`/fileSpace`)
    routerPush(`/fileSpace`)
  }

  // function gotoFollowing(type) {
  //   router.replace(`/${guysInfo.userName}?tab=${type}`)
  // }
  function gotoFollower() {
    // router.replace(`/${guysInfo.userName}?tab=follower`)
    shallowUpdateRouterParams('tab=follower')
  }

  function gotoBrowse() {
    // router.replace(`/${guysInfo.userName}?tab=browse`)
    shallowUpdateRouterParams('tab=browse')
  }

  return <div className={'pb-6 pt-2 grid grid-cols-1 xl:grid-cols-4 md:grid-cols-2 gap-4'}>
    <div className='flex flex-col-reverse bg-[linear-gradient(-63deg,#fff,#f4f5b2)] dark:bg-[#1c2127] dark:bg-none py-4 px-6 gap-3 rounded-2xl dark:border dark:border-[#474747]'>
      <div className={'flex items-center gap-2'}>
        <span className={'text-md font-medium'} style={{
          color: platFormTheme.background === 'dark'
              || (platFormTheme.background === 'system'
                  && window.matchMedia('(prefers-color-scheme: dark)').matches)?platFormTheme.color:'#333'
        }}>积分</span>
        <span className={''}>/</span>
        <span className={'text-sm'}>等级</span>
      </div>
      <div className={'flex items-center gap-2 '}>
        <span className={'text-2xl cursor-pointer'}  onClick={() => {gotoRank()}}>{guysData?.points}</span>
        <span className={''}>/</span>
        <span className={'text-xl text-[#444] dark:text-white'}>{guysData?.level}</span>
      </div>
    </div>
    <div className='flex flex-col-reverse bg-[linear-gradient(-63deg,#fff,#bcf3fb)] dark:bg-[#1c2127] dark:bg-none py-4 px-6 gap-3 rounded-2xl dark:border dark:border-[#474747]'>
      <div className={'flex items-center gap-2'}>
        <span className={'text-md font-medium'} style={{
          color: platFormTheme.background === 'dark'
          || (platFormTheme.background === 'system'
              && window.matchMedia('(prefers-color-scheme: dark)').matches)?platFormTheme.color:'#333'
        }}>网址</span>
        <span className={''}>/</span>
        <span className={'text-sm'}>复制</span>
      </div>
      <div className={'flex items-center gap-2'}>
        <span className={'text-2xl cursor-pointer'}  onClick={() => {
          gotoUrlSpace()}}>{guysData?.urlCount}</span>
        <span className={''}>/</span>
        <span className={'text-xl text-[#444] dark:text-white'}>{guysData?.copyUrlCount}</span>
      </div>
    </div>
    <div className='flex flex-col-reverse bg-[linear-gradient(-63deg,#fff,#ece0f8)] dark:bg-[#1c2127] dark:bg-none py-4 px-6 gap-3 rounded-2xl dark:border dark:border-[#474747]'>
      <div className={'flex items-center gap-2'}>
        <span className={'text-md font-medium'} style={{
          color: platFormTheme.background === 'dark'
          || (platFormTheme.background === 'system'
              && window.matchMedia('(prefers-color-scheme: dark)').matches)?platFormTheme.color:'#333'
        }}>粉丝</span>
        <span className={''}>/</span>
        <span className={'text-sm'}>关注</span>
      </div>
      <div className={'flex items-center gap-2 '}>
        <span className={'text-2xl cursor-pointer'} onClick={gotoFollower}>{guysData?.followerCount}</span>
        <span className={''}>/</span>
        <span className={'text-xl text-[#444] dark:text-white'}>{guysData?.followingCount}</span>
      </div>
    </div>
    <div className='flex flex-col-reverse bg-[linear-gradient(-63deg,#fff,#d0def5)] dark:bg-[#1c2127] dark:bg-none py-4 px-6 gap-3 rounded-2xl dark:border dark:border-[#474747]'>
      <div className={'flex items-center gap-2'}>
        <span className={'text-md font-medium'} style={{
          color: platFormTheme.background === 'dark'
          || (platFormTheme.background === 'system'
              && window.matchMedia('(prefers-color-scheme: dark)').matches)?platFormTheme.color:'#333'
        }}>今日浏览</span>
        <span className={''}>/</span>
        <span className={'text-sm'}>全部浏览</span>
      </div>
      <div className={'flex items-center gap-2'}>
        <span className={'text-2xl cursor-pointer'}  onClick={gotoBrowse}>{guysData?.todayWatchMeCount}</span>
        <span className={''}>/</span>
        <span className={'text-xl text-[#444] dark:text-white'}>{guysData?.totalWatchMeCount}</span>
      </div>
    </div>
  </div>
}

export default withRouter(Statistic);
