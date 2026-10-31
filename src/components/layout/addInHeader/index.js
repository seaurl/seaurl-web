'use client'
import React, {useState} from 'react';
import IconFont from "@/utils/iconFont";
import UrlAddDlg from '@/components/dialog/urlAddDlg'
import {Tooltip} from "antd";

const AddInHeader = props => {
  const [showDlg, setShowDlg] = useState(false)

  return <div>
    <div className='flex items-center h-[56px]'>
      <Tooltip title="添加网址" placement={'bottom'}>
        <IconFont
            type="icon-jia"
            className={'flex items-center justify-center text-md w-[24px] h-[24px] cursor-pointer'}
            onClick={() => {
              setShowDlg(true)
            }}
        />
      </Tooltip>

    </div>
    <UrlAddDlg action="add" title="添加新的网址" show={showDlg} onClose={() => {
      setShowDlg(false)
    }
    }/>
  </div>
}

export default AddInHeader;
