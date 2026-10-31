'use client'
import React, {useEffect, useState, useRef, useCallback} from "react";
import {Dropdown, Menu, Space} from "antd";
import {
    CaretDownOutlined,
    CloseOutlined,
    ReloadOutlined,
    EditOutlined,
    LockOutlined,
    PlusOutlined,
    SendOutlined,
    ToTopOutlined,
    DownloadOutlined,
    DeleteOutlined,
    HistoryOutlined,
    StarOutlined,
    StarFilled,
    SyncOutlined,
    LinkOutlined
} from "@ant-design/icons";
import _ from 'lodash'

const MenuAction = (props) => {
    // const menuRef = useRef([])
    const [menus, setMenus] = useState([])

    useEffect(() => {
        console.log('props .data---', props)
        let newMenu = []
        if (props.action) {
            if (props.action.includes('add')) {
                newMenu.push({
                    key: 'add',
                    label: '添加',
                    icon: <PlusOutlined/>
                })
            }
            if (props.action.includes('sync')) {
                newMenu.push({
                    key: 'sync',
                    label: '同步',
                    icon: <SyncOutlined />
                })
            }
            if (props.action.includes('edit')) {
                newMenu.push({
                    key: 'edit',
                    label: '编辑',
                    icon: <EditOutlined/>
                })
            }
            if (props.action.includes('favorite')) {
                newMenu.push({
                    key: 'favorite',
                    label: '收藏',
                    icon: <StarOutlined />
                })
            }
            if (props.action.includes('move')) {
                newMenu.push({
                    key: 'move',
                    label: '移动',
                    icon: <SendOutlined/>
                })
            }
            if (props.action.includes('private')) {
                newMenu.push({
                    key: 'private',
                    label: '公开/私有',
                    icon: <LockOutlined/>
                })
            }
            if (props.action.includes('top')) {
                newMenu.push({
                    key: 'top',
                    label: '置顶',
                    icon: <ToTopOutlined/>
                })
            }
            if (props.action.includes('refresh')) {
                newMenu.push({
                    key: 'refresh',
                    label: '刷新',
                    icon: <ReloadOutlined/>
                })
            }
            if (props.action.includes('download')) {
                newMenu.push({
                    key: 'download',
                    label: '下载',
                    icon: <DownloadOutlined />
                })
            }
            if (props.action.includes('copyLink')) {
                newMenu.push({
                    key: 'copyLink',
                    label: '复制链接',
                    icon: <LinkOutlined />
                })
            }
            if (props.action.includes('delete')) {
                newMenu.push({
                    key: 'delete',
                    label: '删除',
                    danger: true,
                    icon: <CloseOutlined/>
                })
            }
            if (props.action.includes('thoroughly')) {
                newMenu.push({
                    key: 'thoroughly',
                    label: '彻底删除',
                    danger: true,
                    icon: <DeleteOutlined/>
                })
            }
            if (props.action.includes('recovery')) {
                newMenu.push({
                    key: 'recovery',
                    label: '恢复',
                    icon: <HistoryOutlined/>
                })
            }
        }
        if (props.data) {
            if (props.action.includes('top')) {
                newMenu.forEach(item => {
                    if (item.key === 'top') {
                        item.label = !props.data.isTop ? '置顶' : '取消置顶'
                        console.log('props.data-', item.label)
                    }
                })
            }
            if (props.action.includes('favorite')) {
                newMenu.forEach(item => {
                    if (item.key === 'favorite') {
                        item.label = !props.data.isFavorite ? '收藏' : '取消收藏'
                        item.icon = !props.data.isFavorite?<StarOutlined />:<StarFilled />
                        console.log('props.data-', item.label)
                    }
                })
            }
            console.log('newMenu1 =', newMenu)

            setMenus(_.cloneDeep(newMenu))
        } else {
            if (props.action.includes('top')) {
                newMenu.forEach(item => {
                    if (item.key === 'top') {
                        item.label = '置顶'
                    }
                })
            }
            if (props.action.includes('favorite')) {
                newMenu.forEach(item => {
                    if (item.key === 'favorite') {
                        item.label = '收藏'
                        item.icon = !props.data?.isFavorite?<StarOutlined />:<StarFilled />

                    }
                })
            }
            console.log('newMenu2 =', newMenu)
            setMenus(_.cloneDeep(newMenu))
        }
    }, [props.data])

    function onClickMenuItem(d) {
        console.log('ddd-', d)
        if (d.key === 'add') {
            if (props.add) {
                props.add(null, props.data?.id || '')
            }
        }
        if (d.key === 'sync') {
            if (props.sync) {
                props.sync(null, props.data?.id || '')
            }
        }
        if (d.key === 'edit') {
            if (props.edit) {
                props.edit(null, props.data?.id || '')
            }
        }
        if (d.key === 'favorite') {
            if (props.favorite) {
                props.favorite(null, props.data?.id || '')
            }
        }
        if (d.key === 'move') {
            if (props.move) {
                props.move(null, props.data?.id || '')
            }
        }
        if (d.key === 'private') {
            if (props.private) {
                props.private(null, props.data?.id || '')
            }
        }
        if (d.key === 'delete') {
            if (props.delete) {
                props.delete(null, props.data?.id || '')
            }
        }

        if (d.key === 'recovery') {
            if (props.recovery) {
                props.recovery(null, props.data?.id || '')
            }
        }
        if (d.key === 'thoroughly') {
            if (props.thoroughly) {
                props.thoroughly(null, props.data?.id || '')
            }
        }
        if (d.key === 'top') {
            if (props.top) {
                props.top(null, props.data?.id || '')
            }
        }
        if (d.key === 'download') {
            if (props.download) {
                props.download(null, props.data?.id || '')
            }
        }
        if (d.key === 'copyLink') {
            if (props.copyLink) {
                props.copyLink(null, props.data?.id || '')
            }
        }
        if (d.key === 'refresh') {
            if (props.refresh) {
                props.refresh()
            }
        }
    }

    return <Dropdown menu={{items: menus, onClick: onClickMenuItem}}
                     placement="bottom"
                     trigger={['click']}
                     arrow>
        {props.children}
    </Dropdown>
}

export default MenuAction
