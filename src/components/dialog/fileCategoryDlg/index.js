'use client'
import {Modal, Input, message, TreeSelect} from 'antd'
import {useState, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  addFileCategory,
  queryFileCategory,
  editFileCategory,
  // deleteNoteCategory,
  // getUrlByCategory,
  // setChoosedCategory,
  queryFileCategoryTreeList
} from '@/lib/slices/fileSpaceSlice'
import {useRouter,usePathname, useSearchParams,useParams} from "next/navigation";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

/**
 * 标准dialog对话框显示方式
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const FileCategoryDlg = (props) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const query = useSearchParams();
  const [input, setInput] = useState('')
  const [dlg, setDlg] = useState(props.dlg)
  const [treeValue, setTreeValue] = useState(undefined);

  const {fileCategoryTreeList, fileCategories} = useSelector(state => state.fileSpace)

  // const {chooseFileCategory, fileCategoryTreeList} = useSelector((state) => {
  //   const {me, isLogin, userInfo} = state.auth
  //   return {
  //     me,
  //     ...state.fileSpace,
  //     hydrate: state.system.currentHydrate
  //   }
  // }, (_old, _new) => _old.hydrate !== _new.hydrate);



  useEffect(() => {
    setTreeValue('0')
    setDlg(props.dlg)
    setInput(props.dlg.input)

    const cid = query.get('cid')

    if (props.dlg.action === 'edit') {
      if (cid) {
        const fs = fileCategories.filter(f => f.id === cid)
        if (fs.length > 0) {
          setTreeValue(fs[0].pid)
        }
      }
    }

    if(props.dlg.action === 'add' && query.get('vid')){
      setTreeValue(query.get('vid'))
    }

    if (props.dlg.show){
      dispatch(queryFileCategoryTreeList())
    }
  }, [props.dlg])

  function handleCancel() {
    setDlg({
      show: false,
    })
  }

  async function handleOk() {
    if (input) {
      let res = null;
      if (dlg.action === 'add') {
        // 添加主分类
        res = await dispatch(addFileCategory({
          name: input,
          pid: treeValue
        }))
      }
      if (dlg.action === 'edit' && dlg.id) {
        if (treeValue === query.get('cid')){

        }else{
          res = await dispatch(editFileCategory({
            id: dlg.id,
            name: input,
            pid: treeValue
          }))
        }

      }

      if (res && res.payload.status === 0) {
        message.success(dlg.action === 'add' ? "添加成功" : '编辑成功');
        // 添加成功，重新获取主分类列表
        dispatch(queryFileCategory())
        setDlg({
          show: false,
        })
        // 只有添加才变cid
        if (dlg.action === 'add' && res?.payload?.data?.id){
          let str = 'cid=' + res?.payload?.data?.id
          if (treeValue && treeValue !== '0') {
            str += '&vid=' + treeValue
          } else if (query.get('vid')) {
            str += '&vid=' + query.get('vid')
          }
          shallowUpdateRouterParams(str)
        }
      } else {
        message.warning(dlg.action === 'add' ? "添加失败" : '编辑失败');
      }
    } else {
      message.warning('请输入分类名称')
    }

  }

  // 分类change事件
  function changeCategory(data) {
    console.log('dddd=', data)
    if (data) {
      setTreeValue(data)
    }
  }

  function getTeeData() {
    let treeData = [{
      id: '0',
      title: '全部',
      pId: '-1',
      value: '0'
    }]
    return treeData.concat(fileCategoryTreeList)
  }

  // 添加/编辑弹出框
  function renderDlg() {
    return <Modal
      title={dlg.title}
      open={dlg.show}
      confirmLoading={dlg.loading}
      okText="保存"
      cancelText="取消"
      maskClosable={false}
      width={360}
      onOk={handleOk}
      onCancel={handleCancel}>
      <div className={'flex flex-col'}>
        <div className={'pb-2'}>分类名：</div>
        <Input placeholder="请输入分类名称" value={input} onPressEnter={handleOk} onChange={(e) => {
          setInput(e.target.value)
        }
        }/>
      </div>
      {
        dlg.action === 'edit'||dlg.action === 'add'  ? <div>
          <div className={'py-2'}>
            {dlg.action === 'add'? '添加到：':'移动到：'}
          </div>
          <TreeSelect
            showSearch
            treeDefaultExpandAll
            style={{width: '100%'}}
            value={treeValue}
            dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
            treeDataSimpleMode={true}
            placeholder="请选择分类"
            treeNodeFilterProp="title"
            onChange={changeCategory}
            treeData={getTeeData()}
          >
          </TreeSelect>
        </div> : null
      }
    </Modal>
  }


  return <div className={''}>
    {renderDlg()}
  </div>
}

export default FileCategoryDlg;
