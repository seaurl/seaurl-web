'use client'
import React, {useEffect, useState} from "react";
import {Button} from 'antd'
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import {useSelector} from "react-redux";

const MenusInHeader = props => {
  const router = useRouter();
  const {data: session} = useSession()
  const {loginMenus, logoutMenus} = useSelector(state => state.system)

  function renderMenus() {
    const menus = session ? loginMenus.filter(item => item.type === 'top-menus') : logoutMenus.filter(item => item.type === 'top-menus')
    return menus.map((item, index) => {
      if (item.key === '2') {
        return null
      } else {
        return <div key={index} className={'cursor-pointer text-sm hover:text-[#eee] dark:hover:text-[#eee]'} onClick={() => {
          props.onChoosed(item.url);
        }}>
          {item.label}
        </div>
      }

    })
  }

  return <div className={'flex items-center text-white gap-4'}>
    {renderMenus()}
  </div>
};

export default MenusInHeader;
