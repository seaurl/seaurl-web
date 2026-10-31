'use client'
import React, {useEffect, useState, useRef} from "react";
import {useSession} from "next-auth/react";
import {useRouter, useSearchParams} from "next/navigation";
import {withRouter} from "@/hoc/withRouter";
import {useDispatch, useSelector} from "react-redux";
import classNames from "classnames/bind";
import {Progress} from "antd";
import {
    AppstoreOutlined, AudioOutlined,
    BookOutlined,
    BuildOutlined,
    CaretDownOutlined,
    CaretRightOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    FileImageOutlined,
    FileOutlined, FileUnknownOutlined,
    FolderOutlined,
    FolderViewOutlined,
    GlobalOutlined,
    HistoryOutlined,
    RobotOutlined,
    StarOutlined,
    StarFilled,
    TeamOutlined,
    UserAddOutlined,
    UserOutlined, VideoCameraOutlined
} from "@ant-design/icons";
import {getFileListBy} from "@/lib/slices/fileSpaceSlice";
import IconFont from "@/utils/iconFont";
import {Tree} from "react-arborist";
import {shallowUpdateRouterParams} from "@/utils/routerHelp";

const FileSidebar = ({rounded, isDrawer}) => {
    const {data: session} = useSession()
    const router = useRouter();
    const dispatch = useDispatch()
    const {openMobileDrawer, openSidebar, fileCategories, files, myFileSize} = useSelector(state => state.fileSpace)
    const query = useSearchParams()
    const [treeHeight, setTreeHeight] = useState(0)
    const containerRef = useRef(null)

    const [treeData, setTreeData] = useState([{
        id: 'personal',
        name: '我的文件',
        // icon: <UserOutlined/>,
        children: [
            {
                id: 'image',
                name: '图片',
                icon: <FileImageOutlined/>,
            }, {
                id: 'document',
                name: '文档',
                icon: <FileOutlined/>,
            }, {
                id: 'video',
                name: '视频',
                icon: <VideoCameraOutlined/>,
            },
            {
                id: 'audio',
                name: '音频',
                icon: <AudioOutlined/>,
            }
            , {
                id: 'others',
                name: '其它',
                icon: <FileUnknownOutlined/>
            }
        ]
    }, {
        id: 'trashbin',
        name: '回收站',
        icon: <DeleteOutlined/>,
    }])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!containerRef.current) return
            const observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const { height } = entry.contentRect
                    // Subtract grid buttons (~70px) and progress bar (~60px)
                    setTreeHeight(Math.max(0, height - 130))
                }
            })
            observer.observe(containerRef.current)
            return () => observer.disconnect()
        }, 200)
        return () => clearTimeout(timer)
    }, [])

    // useEffect(() => {
    //
    // }, [query.get('type')])


    //把字节转换成正常文件大小
    function byteConvert(bytes) {
        if (isNaN(bytes)) {
            return '';
        }
        const symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        let exp = Math.floor(Math.log(bytes) / Math.log(2));
        if (exp < 1) {
            exp = 0;
        }
        const i = Math.floor(exp / 10);
        bytes = bytes / Math.pow(2, 10 * i);

        if (bytes.toString().length > bytes.toFixed(2).toString().length) {
            bytes = bytes.toFixed(2);
        }
        return bytes + ' ' + symbols[i];
    }

    function getSizePercent() {
        console.log('total sum', myFileSize)
        const myFileSizeGb = myFileSize / 1024 / 1024 / 1024
        const r = 100 * myFileSizeGb / 5
        return r
    }

    function goto(node) {
        const d = node.data.id
        if (d === 'share') {
            node.toggle()
            return
        }
        if (d) {
            shallowUpdateRouterParams('type=' + d)
            dispatch(getFileListBy({
                type: d,
                fullPath: '/'
            }))
        } else {
            shallowUpdateRouterParams('/fileSpace')
            dispatch(getFileListBy({
                type: 'personal',
                fullPath: '/'
            }))
        }
    }

    function renderPrevIcon(node) {
        if (node.data.id === '0') {
            return <GlobalOutlined/>
        } else if (node.isLeaf) {
            return null
        } else {
            if (node.isOpen) {
                return <CaretDownOutlined onClick={(e) => {
                    e.stopPropagation()
                    node.toggle()
                }}/>
            } else {
                return <CaretRightOutlined onClick={(e) => {
                    e.stopPropagation()
                    node.toggle()
                }}/>
            }
        }
    }

    function renderTreeNode({node, style, dragHandle}) {
        /* This node instance can do many things. See the API reference. */
        return <div onClick={() => goto(node)}>
            <div style={style} className={classNames({
                'bg-[#D4CEF1] dark:bg-[#1C2126] rounded-md': query.get('type') === node.data.id || (!query.get('type') && node.data.id === 'personal')
            })} ref={dragHandle}>
                <div className={'py-2 text-sm pl-2 flex items-center'}>
                        <span className={'text-xs'}>
                            {renderPrevIcon(node)}
                        </span>
                    {node.data.icon ? node.data.icon : null}
                    <div className={'inline-flex items-center justify-between pl-2 w-full'}>
                        {node.data.name}
                    </div>
                </div>
            </div>
        </div>
    }

    return <div className={classNames({
        'dark:border-r dark:border-[#474747] h-full': true,
        'rounded-ss-2xl dark:rounded-ss-none': false
    })}>
        <div ref={containerRef} className={classNames({
            'w-full overflow-hidden px-2': true,
            'h-[calc(100vh-62px)]': isDrawer,
            'h-full': !isDrawer
        })}>
            <div className={'grid grid-cols-2 grid-rows-1 gap-2 px-1 pt-3 pb-2'}>
                <div
                    className={classNames({
                        'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                        'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'recent',
                        'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'recent'
                    })} onClick={() => {
                        shallowUpdateRouterParams('type=recent')
                        dispatch(getFileListBy({type: 'recent', fullPath: '/'}))
                    }}>
                    <ClockCircleOutlined/>
                    最近使用
                </div>
                <div
                    className={classNames({
                        'flex items-center justify-center gap-2 text-sm w-full p-3 rounded-lg cursor-pointer hover:bg-[#d4cef1] dark:hover:bg-[#1C2126] shadow': true,
                        'bg-[#d4cef1] dark:bg-[#1C2126]': query.get('type') === 'favorites',
                        'bg-[#fff] dark:bg-[#000]': query.get('type') !== 'favorites'
                    })} onClick={() => {
                        shallowUpdateRouterParams('type=favorites')
                        dispatch(getFileListBy({type: 'favorites', fullPath: '/'}))
                    }}>
                    <StarFilled/>
                    收藏
                </div>
            </div>
            <Tree data={treeData}
                  width={'100%'}
                  height={treeHeight}
                  selection={query.get('type')}
                  rowHeight={36}
                  indent={12}
                  openByDefault={true}
                  disableDrop={true}
                  disableMultiSelection={true}>
                {renderTreeNode}
            </Tree>
        </div>
        <div className={'p-[12px] cursor-pointer hover:bg-[#D4CEF1] dark:hover:bg-[#2E333C]'}>
            <div className={'text-[#333] text-xs dark:text-white'}>
                已用{myFileSize === 0 ? '0' : byteConvert(myFileSize)} / 5 GB
            </div>
            <Progress percent={getSizePercent()}
                      showInfo={false}
                      percentPosition={{
                          align: 'center',
                          type: 'outer',
                      }}
                      size="small"/>
        </div>
    </div>
};

export default withRouter(FileSidebar);