'use client'
import IconFont from "@/utils/iconFont";
// import {useRouter} from "next/router";
import {Modal, Drawer, Button, Input, AutoComplete, Tooltip} from 'antd'
import React, {useEffect, useState, useRef} from "react";
import {ArrowLeftOutlined, ArrowRightOutlined, SearchOutlined, CloseOutlined} from '@ant-design/icons';
import {useDispatch, useSelector} from "react-redux";
import {
    webSearch,
    resetSearch,
    setSearchPanel,
    setSearchContent,
    setShowSearchApp,
    resetPage,
    webSearchSuggestion
} from "@/lib/slices/systemSlice";
// import _ from "lodash";
import classNames from "classnames/bind";
import SearchContainer from '@/components/search/searchContainer'
import styles from './index.module.scss'
import cns from "classnames/bind";

let cx = cns.bind(styles);
const {Search} = Input;

const SearchInHeader = (props) => {
    // const router = useRouter();
    const dispatch = useDispatch();
    const [input, setInput] = useState('')
    const {showSearchPanel, searchContent, showSearchApp, platFormTheme} = useSelector((state) => state.system);

    const [options, setOptions] = useState([])
    const inputRef = useRef(null)

    const onClose2 = () => {
        dispatch(setSearchPanel(false))
    };

    // 回车搜索
    function onSearch() {
        console.log('input =', input)
        if (input) {
            dispatch(setSearchContent(input))
            dispatch(resetSearch())
            dispatch(webSearch({
                q: input,
                pageNum: 1,
                pageSize: 20
            }))
        } else {
        }
    }

    useEffect(() => {
        // 清空搜索内容
        if (!searchContent) {
            setInput('')
        }
    }, [searchContent])

    useEffect(() => {
        if (showSearchPanel){
            inputRef.current.focus({
                cursor: 'start',
            });
        }

    }, [showSearchPanel])


    async function onSelect(value, option) {
        console.log('value option=', option)
        // window.open(option.url);
        await dispatch(setSearchContent(option.value))
        dispatch(resetSearch())
        dispatch(webSearch({
            q: option.value,
            pageNum: 1,
            pageSize: 20
        }))
    }

    return <div className={'h-[56px] flex items-center'}>
        <Tooltip title="搜索" placement={'bottom'}>
            <IconFont type="icon-sousuo1"
                      className={'flex items-center justify-center text-md w-[24px] h-[24px] cursor-pointer'}
                      onClick={() => {
                          dispatch(setSearchPanel(true))
                          dispatch(resetSearch())
                          setOptions([])
                          setInput('')
                      }}/>
        </Tooltip>

        <Modal title={<div className={'flex items-center gap-y-[12px] p-[12px]'}>
            <AutoComplete allowClear size={'large'} className={styles.input} options={options} onSelect={onSelect}
                          value={input} onChange={async (e) => {
                setInput(e)
            }} onBlur={() => {
                setOptions([])
            }}>
                <Input ref={inputRef} placeholder={'请输入搜索内容'} prefix={<SearchOutlined/>}
                       style={{borderColor: platFormTheme.color, borderWidth: '2px'}} onPressEnter={onSearch}
                       rootClassName={styles.inputRoot}/>
            </AutoComplete>
        </div>}
               width={560}
               centered
               mask={false}
               closable={false}
               footer={null}
               maskClosable
               open={showSearchPanel}
               onCancel={onClose2}
               wrapClassName={styles.myBody}
               style={{boxShadow: '0 12px 48px 0 rgba(0,0,0,.5)', borderRadius: '8px'}}>
            <SearchContainer/>
        </Modal>
    </div>
}

export default SearchInHeader;
