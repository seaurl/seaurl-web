'use client'
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Menu,
  Dropdown,
  Button,
  Form,
  Input,
  Space,
  Typography,
  Tabs,
  Skeleton,
  Divider,
  Spin,
  Row,
  Collapse,
  Col, message
} from 'antd';
import {
  DashboardOutlined,
  PlusOutlined,
  EditOutlined,
  CloseCircleOutlined,
  ToolFilled,
  CaretDownOutlined,
  ToolOutlined,
  CaretRightOutlined,
  CalculatorOutlined,
  CoffeeOutlined, FireOutlined, BulbFilled, SettingOutlined
} from "@ant-design/icons";
import {useRouter} from "next/navigation";
import classNames from "classnames/bind";
// import styles from './index.module.scss';
import {useSelector, useDispatch} from "react-redux";
import dayjs from "dayjs";
import _ from 'lodash'
import {
  getOnlineToolsGroup,
  getOnlineToolsQueryBy,
  setToolsGroupId,
  clearTools,
  deleteUserTools
} from "@/lib/slices/systemSlice";
import {
  addMyOnlineTools
} from '@/lib/slices/urlSpaceSlice'
import Loading from "@/components/loading";

const {TextArea} = Input
const {Title, Paragraph, Text, Link} = Typography;
import Empty from "@/components/empty";

// let cx = classNames.bind(styles);
const RemindInHeader = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  // mode :add切换到我的工具里面添加，list:工具列表,delete切换到我的工具删除
  const [mode, setMode] = useState('list')

  const {toolsGroupList, tools, toolsGroupId} = useSelector(state => state.system)
  // const mode = useRef()
  // const {loginMenus, logoutMenus, toolsGroupList, tools, userTools, toolsGroupId, isLogin, isMobile} = useSelector((state) => {
  //   const {me, isLogin, userInfo} = state.auth
  //   return {
  //     me,
  //     isLogin,
  //     isMobile: state.layout.isMobile,
  //     ...state.system
  //   }
  // }, shallowEqual);
  // const {isMobile} = useSelector((state) => state.layout);

  const [showQuickTools, setQuickTools] = useState(false);
  const router = useRouter();
  const [page, setPage] = useState({
    pageSize: 10,
    pageNum: 1
  })
  const [loading, setLoading] = useState(true);
  const [loadingTools, setLoadingTools] = useState(true)

  useEffect(() => {
    // 显示时禁止滚动条滚动
    if (showQuickTools) {
      const top = document.documentElement.scrollTop || document.body.scrollTop;
      document.body.style.cssText += `
            position: fixed;
            width: 100%;
            left: 0;
            top: ${-top}px;
        `
      initData()
    } else {
      const top = document.body.style.top;
      document.body.style.cssText += `
            position: static;
        `;
      window.scrollTo(0, Math.abs(parseFloat(top)))
    }
  }, [showQuickTools])

  async function initData() {
    setLoading(true)
    const res = await dispatch(getOnlineToolsGroup())
    if (res.payload && res.payload.data) {
      const fd = res.payload.data.filter(item => item.sort === 1)
      if (fd.length>0){
        dispatch(setToolsGroupId(fd[0].id))
        queryTools(fd[0].id, '', 'system')
      }
    }
  }

  function gotoOnlineTools(item) {
    window.open(item.url);
  }

  // 查询工具集合
  async function queryTools(groupId, param, type) {
    setLoadingTools(true)
    await dispatch(getOnlineToolsQueryBy({
      param,
      groupId,
      type
    }))
    setLoadingTools(false)
    setLoading(false)
  }

  // 渲染左边tabs
  function renderTabs() {
    let s = _.cloneDeep(toolsGroupList)
    const toolsGroupList2 = s.sort((a, b) => a.sort - b.sort)
    return toolsGroupList2.map(item => {
      return <div className={classNames({
        'py-[4px] w-full text-center cursor-pointer hover:bg-[#eee] dark:hover:bg-[#2D333B] rounded': true,
        'bg-[#eee] dark:bg-[#2D333B] rounded': item.id === toolsGroupId
      })} onClick={() => {
        const f = toolsGroupList.filter(k => k.id === item.id && k.group === 'wdgj')
        setMode('list')
        choosedTab(item.id, f.length > 0 ? 'user' : 'system')
      }
      }>{item.groupName}</div>
    })
  }

  // 选择左边分类
  function choosedTab(key, type) {
    queryTools(key, '', type)
    dispatch(setToolsGroupId(key))
  }

  async function onFinish(formData) {
    const res = await dispatch(addMyOnlineTools({
      name: formData.toolName,
      character: formData.toolShotName,
      groupId: toolsGroupId,
      url: formData.url
    }))
    if (res.payload.status === 0 && res.payload.data) {
      message.success("添加工具成功");
      setMode('list')
      const f = toolsGroupList.filter(item => item.id === toolsGroupId && item.group === 'wdgj')
      choosedTab(toolsGroupId, f.length > 0 ? 'user' : 'system')
    } else {
      message.warning("添加工具失败");
    }
  }

  // 渲染工具列表
  const renderTools = useCallback(() => {
    const f = toolsGroupList.filter(item => item.id === toolsGroupId && item.group === 'wdgj')
    // 我的工具
    if (f.length > 0) {
      if (mode === 'add') {
        return <div className={'w-full'}>
          <div className={'px-[24px]'}>
            <Form
              name="basic"
              form={form}
              layout="vertical"
              labelCol={{
                span: 24,
              }}
              wrapperCol={{
                span: 24,
              }}
              style={{
                maxWidth: 600,
              }}
              initialValues={{
                remember: true,
              }}
              autoComplete="off"
              onFinish={onFinish}
            >
              <Form.Item
                label="网址"
                name="url"
                rules={[
                  {
                    required: true,
                    message: '请输入网址',
                  },
                  {type: 'url', message: '网址不正确'}
                ]}
              >
                <TextArea type={'url'} placeholder="请输入网址，如：https://www.seaurl.com" maxLength={500}
                          autoSize={{minRows: 2, maxRows: 5}}/>
              </Form.Item>
              <Form.Item
                label="工具名"
                name="toolName"
                rules={[
                  {
                    required: true,
                    message: '请输入工具名，最多20个字符',
                  },
                ]}
              >
                <Input placeholder={'请输入工具名'} maxLength={20}/>
              </Form.Item>
              <Form.Item
                label="工具简称"
                name="toolShotName"
                rules={[
                  {
                    required: true,
                    message: '请输入工具简称，最多2个字符',
                  },
                ]}
              >
                <Input placeholder={'请输入工具简称'} maxLength={2}/>
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                <Space>
                  <Button type="primary" htmlType="submit">
                    添加
                  </Button>
                  <Button type="default" onClick={() => {
                    setMode('list')
                    const f = toolsGroupList.filter(item => item.id === toolsGroupId && item.group === 'wdgj')
                    choosedTab(toolsGroupId, f.length > 0 ? 'user' : 'system')
                  }}>
                    取消
                  </Button>
                </Space>
              </Form.Item>
            </Form>
            <div className={''}>
              <Typography>
              <pre>
                推荐您添加平时常用的软件网址、在线工具做为快捷工具提高效率。如果您有好的想法或者建议可以反馈给我们，我们的QQ群是701558381。
              </pre>
              </Typography>
            </div>
          </div>
        </div>
      }
    }
    if (loadingTools) {
      return <div className={'w-full flex items-center justify-center'}>
        <Loading/>
      </div>
    } else {
      if (tools.length > 0) {
        return tools.map(item => {
          return <Col xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
            <div className={'flex items-center justify-center w-full py-[12px]'}>
              <div className={'flex items-center justify-center flex-col relative w-full'}>
                <div className={'w-[40px] h-[40px] min-w-[32px] min-h-[32px] flex items-center justify-center shadow rounded-md bg-[#eee] dark:bg-[#2D333B] cursor-pointer'}
                     onClick={() => {
                  gotoOnlineTools(item)
                }}>
                  <span className={'text-md'}>{item.character}</span>
                </div>
                <div className={'flex items-center justify-center flex-col pt-[6px]'}>
                  <div className={'cursor-pointer truncate hover:underline'} title={item.name} onClick={() => {
                    gotoOnlineTools(item)
                  }}>
                    {item.name}
                  </div>
                </div>
                {
                  mode === 'edit' && f.length > 0 ? <div className={'absolute right-[10px] top-[-10px]'}>
                    <CloseCircleOutlined style={{color: 'red'}} className={'text-red-600 text-md cursor-auto'} onClick={async () => {
                      const res = await dispatch(deleteUserTools({
                        id: item.id
                      }))
                      if (res.payload.status === 0 && res.payload.data) {
                        message.success("删除成功");
                        setMode('list')
                        choosedTab(toolsGroupId, 'user')
                      }
                    }}/>
                  </div> : null
                }

              </div>

            </div>
          </Col>
        })
      } else {
        return <div className={'flex items-center justify-center w-full'}>
          <Empty/>
        </div>
      }
    }

  }, [mode, tools, toolsGroupId, loadingTools])

  return <div className={''}>
    <Dropdown
      open={showQuickTools}
      onOpenChange={async visible => {
        if (visible) {
        }
        setQuickTools(visible);
      }}
      dropdownRender={(menus) => <div className={'relative m-0 bg-white dark:bg-[#1f1f1f] text-left list-none bg-clip-padding rounded outline-0 shadow-2xl'}>
        <div className={'w-full h-[560px]'}>
          <div className={'h-full flex flex-col'}>
            {
              loading ? <div className={'w-full flex items-center justify-center pt-[32px]'}>
                <Loading/>
              </div> : <>
                <div className={'p-[12px] border-b border-[#eee] dark:border-[#474747] flex items-center justify-between'}>
                  <div>
                    {/*<CoffeeOutlined className={styles.icon}/>*/}
                    <ToolOutlined style={{transform: 'rotate(-45deg)'}}/>
                    <span className={'pl-[6px]'}>快捷工具</span>
                  </div>
                  <div>
                    <Space>
                      <Button icon={<PlusOutlined />} size={'small'} type={"text"} onClick={() => {
                        const f = toolsGroupList.filter(k => k.group === 'wdgj')

                        form.resetFields();
                        console.log('mode1 ===', mode)
                        // showModal()
                        setMode('add')
                        // 清空tools列表，否则切换的时候有残留数据
                        dispatch(clearTools())
                        // mode.current = 'add'
                        console.log('mode2 ===', mode)
                        if (f.length > 0) {
                          dispatch(setToolsGroupId(f[0].id))
                        }

                      }}>添加</Button>
                      <Button icon={<EditOutlined />} size={'small'} type={"text"} onClick={() => {
                        const f = toolsGroupList.filter(k => k.group === 'wdgj')

                        if (mode === 'add') {
                          if (f.length > 0) {
                            choosedTab(f[0].id, 'user')
                          }
                        }
                        const f2 = toolsGroupList.filter(k => k.group === 'wdgj' && k.id === toolsGroupId)
                        // 如果小于0说明不是我的工具tab，所以要切换到我的工具tab
                        if (f2.length <= 0) {
                          if (f.length > 0) {
                            choosedTab(f[0].id, 'user')
                          }
                        }
                        setMode('edit')
                      }}>编辑</Button>
                    </Space>
                  </div>
                </div>
                <div className={'w-full flex items-center p-[6px] gap-2 shrink-0 bg-[#fafafa] dark:bg-[#1f1f1f]'}>
                  {renderTabs()}
                </div>
                <div className={'h-full overflow-auto p-[12px]'}>
                  <Row gutter={[24, 24]}>
                    {renderTools()}
                  </Row>
                </div>
              </>
            }
          </div>
        </div>
      </div>}
      placement={"bottomRight"}
      trigger="click"
      overlayStyle={{width: "460px"}}>
      <div className={'flex items-center h-[56px]'}>
        <ToolFilled className={'flex items-center justify-center w-[24px] h-[24px] cursor-pointer'} style={{transform: 'rotate(-45deg)'}}/>
      </div>
    </Dropdown>
  </div>
}
export default RemindInHeader;
