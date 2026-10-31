'use client'
import React, { useState } from "react";
const Record = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  return (
    <div className={'flex flex-col items-center justify-center text-[#666] dark:text-[#CFCAC9] gap-0.5'}>
      {/* ©2014-2016 awbeci 皖ICP备14011269号-2 */}
      <div className={'text-xs '}>©{year} Seaurl 皖ICP备14011269号-3</div>
      <div className={'text-xs '}>南京海纳网罗科技有限公司</div>
      <div className={'text-xs '}>商务合作-<a href= "mailto:zhangwei900808@126.com">联系方式</a></div>
    </div>
  );
};
export default Record;