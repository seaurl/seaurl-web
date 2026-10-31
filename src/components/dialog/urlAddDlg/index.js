'use client'
import {useState, useEffect, useRef, useLayoutEffect} from 'react'
import {
    Form,
    Input,
    Button,
    Typography,
    Select,
    Divider,
    Radio,
    TreeSelect,
    Spin,
    Modal,
    message,
    Tag,
    Switch
} from "antd";
import {CheckOutlined, PlusOutlined, LoadingOutlined} from "@ant-design/icons";
import {shallowEqual, useDispatch, useSelector} from 'react-redux'
import {
    getTitleAndDesc,
    addUrlCategory,
    addUrl,
    editUrl,
    copyUrl,
    queryUrlCategoryTreeList
} from '@/lib/slices/urlSpaceSlice'

const UrlAddDlg = props => {
    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const {categoryTreeList} = useSelector(state => state.urlSpace)
    // const {
    //     categoryTreeList,
    //     isLogin
    // } = useSelector((state) => {
    //     const {me, isLogin, userInfo} = state.auth
    //     return {
    //         me,
    //         isLogin,
    //         userInfo,
    //         ...state.urlSpace,
    //         hydrate: state.system.currentHydrate
    //     }
    // }, shallowEqual);

    const [treeValue, setTreeValue] = useState(undefined);
    const [btnOkLoading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [currentCategoryTree, setCurrentCategoryTree] = useState([])
    const [keywords, setKeywords] = useState([])


    const urlReg = new RegExp(
        '^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
        'i',
    );
    const [formData, setFormData] = useState({
        title: '',
        category: null,
        url: ''
    });
    const [titleInput, setTitleInput] = useState({
        validateStatus: null,
        help: null,
        loading: false
    })

    const [descriptionInput, setDescriptionInput] = useState({
        validateStatus: null,
        help: null,
        loading: false
    })


    const [urlInput, setUrlInput] = useState({
        validateStatus: null,
        help: null
    })

    const [categoryInput, setCategoryInput] = useState({
        validateStatus: null,
        help: null
    })

    // const [value, setValue] = useState(undefined);
    const antIcon = <LoadingOutlined style={{fontSize: 16}} spin/>;

    const onFinish = async formData => {
        setLoading(true)
        if (formData.url && formData.category && formData.title) {
            console.log("Success:", formData);

            // 添加
            if (props.action === 'add') {
                const res = await dispatch(addUrl({
                    url: formData.url,
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.category,
                    keywords: formData.keywords,
                    isPrivate: formData.isPrivate
                }))
                if (res.payload.status === 0 && res.payload.data) {
                    message.success("添加网址成功");
                    props.onClose(false);
                } else {
                    message.warning("添加网址失败");
                }
            }
            if (props.action === 'copy') {
                const res = await dispatch(copyUrl({
                    urlId: props.initData.urlId,
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.category,
                    keywords: formData.keywords,
                    isPrivate: formData.isPrivate
                }))
                if (res.payload.status === 0 && res.payload.data) {
                    message.success("复制网址成功");
                    // if (activity === 'latestNews') {
                    //   dispatch(getUrlsByFlag())
                    //   //todo:为什么查询完之后没有显示
                    //   // dispatch(getUrlCopyTotal({
                    //   //   userName: userInfo.userName
                    //   // }))
                    // }
                    if (props.onOk) {
                        props.onOk();
                    }
                } else {
                    message.warning("复制网址失败");
                }
            }
            // 编辑
            if (props.action === 'edit') {
                const res = await dispatch(editUrl({
                    urlId: props.initData.urlId,
                    title: formData.title,
                    description: formData.description,
                    categoryId: formData.category,
                    keywords: formData.keywords,
                    isPrivate: formData.isPrivate
                }))
                if (res.payload.status === 0 && res.payload.data) {
                    message.success("编辑网址成功");
                    // if (activity === 'latestNews') {
                    //   dispatch(getUrlsByFlag())
                    // }
                    // if (activity === 'category') {
                    //   // 重新查询网址
                    //   dispatch(getUrlByCategory({
                    //     category: choosedCategory
                    //   }))
                    // }
                    // if(activity === "fastCopyUrls"){
                    //   dispatch(getFastCopyUrl())
                    // }
                    if (props.onOk) {
                        props.onOk();
                    }
                } else {
                    message.warning("编辑网址失败");
                }
            }
            setLoading(false)
        }
    }

    function changeDesc(e) {
        if (e.target.value) {
            setDescriptionInput({
                help: null
            })
        } else {
            // setDescriptionInput({
            //   validateStatus: "error",
            //   help: "请输入标题"
            // })
        }
    }

    //标题change事件
    function changeTitle(e) {
        if (e.target.value) {
            setTitleInput({
                help: null
            })
        } else {
            setTitleInput({
                validateStatus: "error",
                help: "请输入标题"
            })
        }
    }

    // 分类change事件
    function changeCategory(data) {
        if (data) {
            setCategoryInput({
                validateStatus: "success",
                help: null
            })
        } else {
            setCategoryInput({
                validateStatus: "error",
                help: "请选择分类"
            })
        }
    }

    // 网址change事件
    function changeUrl(e) {
        const url = e.target.value;
        if (url) {
            // 防抖和节流
            setTimeout(async () => {
                // 判断输入的网址url是否正确
                if (url.match(urlReg)) {
                    setUrlInput({
                        validateStatus: "success",
                        help: null
                    })
                    setTitleInput({
                        loading: true
                    })
                    setDescriptionInput({
                        loading: true
                    })
                    // 如果正确调用接口查询标题
                    const res = await dispatch(getTitleAndDesc({
                        url
                    }));
                    console.log('getTitleAndDesc=', res)
                    //如果返回成功则显示到标题输入框中
                    if (res.payload.data) {
                        form.setFieldsValue({
                            title: res.payload.data.title || '',
                            description: res.payload.data.description || '',
                            keywords: res.payload.data.keywords || ''
                        })
                        if (res.payload.data.keywords) {

                        }
                        setTitleInput({
                            validateStatus: "success",
                            loading: false,
                            help: null
                        })
                        setDescriptionInput({
                            validateStatus: "success",
                            loading: false,
                            help: null
                        })
                    } else {
                        // 否则 标题输入框显示为空，并且提示用户，获取标题失败
                        form.setFieldsValue({
                            title: '',
                            description: '',
                            keywords: ''
                        })
                        setTitleInput({
                            validateStatus: "error",
                            loading: false,
                            help: '抱歉，没有查询到标题，请手动输入(必填)'
                        })
                        setDescriptionInput({
                            validateStatus: "error",
                            loading: false,
                            help: '抱歉，没有查询到描述，请手动输入(非必填)'
                        })
                    }
                } else {
                    setUrlInput({
                        validateStatus: "error",
                        help: "网址格式不正确，请重新输入"
                    })
                }
            }, 500)
        } else {
            setUrlInput({
                validateStatus: "error",
                help: "请输入网址"
            })
        }
    }


    // 点击确定
    const handleOk = () => {
        let isOk = true;
        const formData = form.getFieldsValue();
        if (!formData.url) {
            setUrlInput({
                validateStatus: "error",
                help: "请输入网址"
            })
            isOk = false;
        } else {
            if (!formData.url.match(urlReg)) {
                setUrlInput({
                    validateStatus: "error",
                    help: "网址格式不正确，请重新输入"
                })
                isOk = false;
            }
        }

        if (!formData.title) {
            setTitleInput({
                validateStatus: "error",
                help: "请输入标题"
            })
            isOk = false;
        }
        if (!formData.category) {
            setCategoryInput({
                validateStatus: "error",
                help: "请选择分类"
            })
            isOk = false;
        }
        if (formData.category === '0') {
            setCategoryInput({
                validateStatus: "error",
                help: "不能选择全部分类"
            })
            isOk = false;
        }
        if (isOk) {
            form.submit();
        }

    };

    const handleCancel = () => {
        props.onClose(false)
    };

    // useEffect(() => {
    //   console.log('-----props.initData', props.initData)
    //   setFormData(props.initData)
    // }, [props.initData])

    useEffect(() => {
        if (props.show) {
            setKeywords([])
            //获取分类树
            dispatch(queryUrlCategoryTreeList())
            setLoading(false)
            form.resetFields();
            form.setFieldsValue({
                isPrivate: '0'
            })
            setTitleInput({
                validateStatus: null,
                help: null,
                loading: false
            })
            setDescriptionInput({
                validateStatus: null,
                help: null,
                loading: false
            })
            setUrlInput({
                alidateStatus: null,
                help: null
            })
            setCategoryInput({
                validateStatus: null,
                help: null
            })
        }
    }, [props.show])

    useEffect(() => {
        console.log('props.initData=', props.initData)
        if (props.initData?.keywords) {
            setKeywords(props.initData.keywords.split(','))
        }
        // 监听props.initData值变化，并且赋值给表单
        // 注意：只能通过form.setFieldsValue方式才能让表单值生效
        form.setFieldsValue(props.initData)
        // form.setFieldsValue({
        //     keywords: ''
        // })
    }, [props.initData])

    useEffect(() => {
        const result = categoryTreeList.concat([{
            id: "0",
            pId: "-1",
            title: "全部分类",
            value: '0'
        }])
        setCurrentCategoryTree(result)
    }, [categoryTreeList])

    async function btnAddCategory(e) {
        if (!categoryName) {
            message.warning('请输入分类名称');
            return
        }
        const formData = form.getFieldsValue();
        console.log('formData=', formData)
        if (!formData.category) {
            message.warning('请先选择分类');
            return
        }

        const res = await dispatch(addUrlCategory({
            name: categoryName,
            pid: formData.category
        }))
        console.log('res===', res)
        if (res) {
            setCategoryName('');
            dispatch(queryUrlCategoryTreeList())
            message.success('添加成功');
        }
    }

    const onCategoryNameChange = event => {
        setCategoryName(event.target.value);
    };

    // function onAddLabels() {
    //     // if (keywords.length>10){
    //     //     message.warning('最多添加10个标签');
    //     //     return
    //     // }
    //     const formData = form.getFieldsValue();
    //     if (!formData.keywords) {
    //         // message.warning('请输入标签');
    //     } else {
    //         // if (keywords.length>3){
    //         //
    //         // }
    //         keywords.push(formData.keywords)
    //         setKeywords(keywords.slice())
    //     }
    // }

    return <div className={''}>
        <Modal title={props.title}
               open={props.show}
               onOk={handleOk}
               onCancel={handleCancel}
               footer={[
                   <Button key="back" onClick={handleCancel}>
                       取消
                   </Button>,
                   <Button key="submit" type="primary" loading={btnOkLoading} onClick={handleOk}>
                       保存
                   </Button>
               ]}
               cancelText="取消"
               maskClosable={false} okText="确定">
            <div className={''}>
                <Form form={form} layout="vertical" name="basic" onFinish={onFinish}>
                    <Form.Item label="网址"
                               name="url"
                               validateStatus={urlInput.validateStatus}
                               help={urlInput.help}
                        // rules={[{required: true, message: '请输入网址'}, {type: 'url', message: '网址不正确，请重新输入'}]}
                    >
                        <Input.TextArea placeholder="请输入网址，如：https://www.seaurl.com，或：http://192.168.0.1/"
                                        onChange={changeUrl}
                                        maxLength={500}
                                        disabled={props.action !== 'add'}
                                        autoSize={{minRows: 2, maxRows: 5}}/>
                    </Form.Item>
                    <Form.Item
                        label="标题"
                        name="title"
                        help={titleInput.help}
                        validateStatus={titleInput.validateStatus}>
                        <Input placeholder="请输入网址标题"
                               suffix={titleInput.loading ? <Spin indicator={antIcon}/> : null}
                               onChange={changeTitle} maxLength={100}/>
                    </Form.Item>
                    <Form.Item
                        label="描述"
                        name="description"
                        help={descriptionInput.help}>
                        <Input placeholder="请输入网址描述" onChange={changeDesc}
                               suffix={descriptionInput.loading ? <Spin indicator={antIcon}/> : null} maxLength={100}/>
                    </Form.Item>
                    <Form.Item
                        label="标签(多个以逗号分割)"
                        name="keywords"
                        help={descriptionInput.keywords}>
                        <Input placeholder="请输入标签" maxLength={100}/>
                    </Form.Item>
                    <Form.Item label={props.action === 'copy' ? '复制到' : '分类'}
                               name="category"
                               help={categoryInput.help}
                               validateStatus={categoryInput.validateStatus}>
                        <TreeSelect
                            showSearch
                            treeDefaultExpandAll
                            style={{width: '100%'}}
                            value={treeValue}
                            dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                            dropdownRender={(props) => {
                                return <div style={{padding: '8px'}}>
                                    {props}
                                    <div className={'flex items-center justify-between'}>
                                        <Input
                                            placeholder="请输入分类名称"
                                            onChange={onCategoryNameChange}
                                            suffix={null}
                                        />
                                        <Button type="link" icon={<PlusOutlined/>}
                                                onClick={btnAddCategory}>添加分类</Button>
                                    </div>
                                </div>
                            }}
                            treeDataSimpleMode={true}
                            placeholder="请选择分类"
                            onChange={changeCategory}
                            treeNodeFilterProp="title"
                            treeData={currentCategoryTree}>
                        </TreeSelect>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    </div>
}

export default UrlAddDlg;
