'use client'
const TimeLine = (props) => {
  function renderBody() {
    if (props.data.content.length > 0) {
      return props.data.content.map(item => {
        return <div className={'relative flex py-[16px] gap-2'}>
          <div className={'absolute top-0 bottom-0 left-[15px] w-[2px] bg-[#d4dce3] dark:bg-[#262B31]'}></div>
          <div className={'relative z-10 flex w-[32px] h-[32px] items-center justify-center rounded-full shrink-0'}>
            <div className={'flex items-center justify-center text-md text-[#505a62] bg-[#eaeef2] dark:bg-[#1C2127] p-[5px] rounded-full'}>
              {props.icon}
            </div>
          </div>
          <div className={'min-w-0 max-w-full mt-[4px] flex-auto'}>
            <div className={''}>
              <div className={'text-sm'}>{item.title}</div>
              <div className={'mt-[12px]'}>{item.comp}</div>
            </div>
          </div>
        </div>
      })
    } else {
      return <div className={'flex items-center justify-center pt-[20px] text-[#57606a] text-sm'}>暂无数据</div>
    }

  }

  return <div className={'pb-[24px] w-full items-center'}>
    <div className={'flex mb-[10px] items-center'}>
      <div className={'whitespace-nowrap pl-[8px] pr-[16px]'}>
        <span className={'text-sm'}>{props.data.prefix}</span>
        <span className={'text-xs pl-[10px]'}>{props.data.suffix}</span>
      </div>
      <div className={'relative top-[50%] w-[95%] border-t border-[#d4dce3] h-[1px] dark:border-[#30363E]'}></div>
    </div>
    {renderBody()}
  </div>
}

export default TimeLine;