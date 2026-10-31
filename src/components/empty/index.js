'use client'
import React, {useState} from 'react';
import EmptyImg from './empty'
const Empty = (props) => {
  const [title, setTitle] = useState(props.title || '暂无数据')
  return <div className={'flex items-center justify-between w-full p-6 flex-col'}>
    {/*<EmptyData description={title}/>*/}
    <div className={'max-w-[300px] w-full h-[100px] flex flex-col items-center justify-center  mx-auto'}>
      <EmptyImg/>
    </div>

    <div className={'text-[#5F6367]'}>{title}</div>
    {/*<img src={emptyImg} alt="Logo" />*/}
  </div>
}

export default Empty;
