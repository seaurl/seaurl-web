'use client'
import {List, Avatar} from 'antd'
import {
  CheckOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseOutlined,
  FileOutlined
} from "@ant-design/icons";
import {useEffect, useState} from "react";

const FileTaskDlg = (props) => {
  const [dlg, setDlg] = useState({
    show: false
  })

  //把字节转换成正常文件大小
  function convertSize(size) {
    if (!size) return "";
    let num = 1024.00; //byte
    if (size < num)
      return size + "B";
    if (size < Math.pow(num, 2))
      return (size / num).toFixed(2) + "KB"; //kb
    if (size < Math.pow(num, 3))
      return (size / Math.pow(num, 2)).toFixed(2) + "MB"; //M
    if (size < Math.pow(num, 4))
      return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
    return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
  }

  useEffect(() => {
    setDlg(props.dlg)
    renderTask()
  }, [props.dlg])

  function onClose() {
    setDlg({
      show: false
    })
  }

  function getFileStatusIcon(file) {
    if (file.status === 'done') {
      return <Avatar size={26} icon={<CheckOutlined/>} style={{color: '#fff', background: '#0AA770'}}/>
    }
    if (file.status === 'uploading') {
      return <Avatar size={26} icon={<SyncOutlined spin/>} style={{background: '#00a3ff'}}/>
    }
    if (file.status === 'error') {
      return <Avatar size={26} icon={<CloseOutlined/>} style={{color: '#fff', background: 'red'}}/>
    }
  }

  function getFileStatusName(file) {
    if (file.status === 'done') {
      return '上传成功'
    }
    if (file.status === 'uploading') {
      return '正在上传'
    }
    if (file.status === 'error') {
      return '上传失败'
    }
  }

  function getUploadFileCount() {
    if (props.dlg.task && props.dlg.task.fileList) {
      // 把没有status的文件过滤掉(没有status的文件说明是取消上传的文件)
      const filterFileList = props.dlg.task.fileList.filter(item => item.status)
      const successList = props.dlg.task.fileList.filter(item => item.status === 'done')
      return `(${successList.length}/${filterFileList.length})`
    }
    return ''
  }

  function renderTask() {
    console.log('props.dlg.taskList=', props.dlg.task)
    if (props.dlg.task && props.dlg.task.fileList.length > 0) {
      // 把没有status的文件过滤掉(没有status的文件说明是取消上传的文件)
      const filterFileList = props.dlg.task.fileList.filter(item => item.status)
      return <List
        itemLayout="horizontal"
        dataSource={filterFileList}
        renderItem={item => (
          <List.Item
            //   extra={<div className={styles.fileStatus}>
            //   <CheckCircleOutlined className={styles.icon}/>
            // </div>}
          >
            <List.Item.Meta
              avatar={getFileStatusIcon(item)}
              title={<div className={'w-[350px] overflow-hidden truncate'}>{item.name}</div>}
              description={<div className={'text-sm'}>{item.size !== 0 ? convertSize(item.size) : '0KB'}
                <span className={'px-[12px]'}>{getFileStatusName(item)}</span>
              </div>}
            />

          </List.Item>
        )}
      />
    } else {
      return null
    }
  }

  return <div className={'w-[420px] fixed right-[20px] bottom-[20px] box-border shadow-2xl bg-white dark:bg-[#141414] border overflow-hidden h-[300px] transition-all duration-300 dark:border-[#474747] rounded-2xl'}
              style={{display: `${dlg.show ? 'block' : 'none'}`}}>
    <div className={'p-[12px] border-b border-[#ddd] flex items-center justify-between dark:border-[#474747]'}>
      <span className={'text-sm'}>上传完成{getUploadFileCount()}</span>
      <CloseOutlined className={'text-md cursor-pointer'} onClick={onClose}/>
    </div>
    <div className={'p-[12px] overflow-y-auto h-[calc(300px-48px)]'}>
      {renderTask()}
    </div>
  </div>
}

export default FileTaskDlg
