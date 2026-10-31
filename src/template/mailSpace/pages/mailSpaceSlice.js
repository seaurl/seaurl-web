import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'

const initialState = {
    mailboxes: [],
    mailMessageList: [],

    // 邮件列表移动端drawer是否显示
    openMailMessageListDrawer: false,
    // 左侧面板移动端drawer是否显示
    openSidebarDrawer: false,
    // 左侧面板是否显示
    showSidebar: false
}

export const mailSpaceSlice = createSlice({
    name: 'mailSpace',
    initialState,
    reducers: {
        // setChooseTag(state, action) {
        //     state.chooseTag = action.payload;
        // },
        setOpenMailMessageListDrawer: (state, action) => {
            state.openMailMessageListDrawer = action.payload
        },
        setOpenSidebarDrawer: (state, action) => {
            state.openSidebarDrawer = action.payload
        },
        setShowSidebar: (state, action) => {
            state.showSidebar = action.payload
        }
    }
})

export const {
    setOpenMailMessageListDrawer,
    setOpenSidebarDrawer,
    setShowSidebar
} = mailSpaceSlice.actions
