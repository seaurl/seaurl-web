import logger from "redux-logger";

import {configureStore, combineReducers} from '@reduxjs/toolkit'
import {homeSlice} from "@/lib/slices/homeSlice";
import {systemSlice} from "@/lib/slices/systemSlice";
import {authSlice} from "@/lib/slices/authSlice";
import {squareSlice} from "@/lib/slices/squareSlice";
import {settingSlice} from "@/lib/slices/settingSlice";
import {urlSpaceSlice} from "@/lib/slices/urlSpaceSlice";
import {userSlice} from "@/lib/slices/userSlice";
import {rankSlice} from "@/lib/slices/rankSlice";
import {fileSpaceSlice} from "@/lib/slices/fileSpaceSlice";
import {noteSpaceSlice} from "@/lib/slices/noteSpaceSlice";
import {notifySlice} from "@/lib/slices/notifySlice";
import {chatAiSpaceSlice} from "@/lib/slices/chatAiSpaceSlice";
import {imageAiSpaceSlice} from "@/lib/slices/imageAiSpaceSlice";
import {aiSpaceSlice} from "@/lib/slices/aiSpaceSlice";
import {mailSpaceSlice} from "@/lib/slices/mailSpaceSlice";

const rootReducer = combineReducers({
    [homeSlice.name]: homeSlice.reducer,
    [systemSlice.name]: systemSlice.reducer,
    [authSlice.name]: authSlice.reducer,
    [squareSlice.name]: squareSlice.reducer,
    [settingSlice.name]: settingSlice.reducer,
    [urlSpaceSlice.name]: urlSpaceSlice.reducer,
    [userSlice.name]: userSlice.reducer,
    [rankSlice.name]: rankSlice.reducer,
    [fileSpaceSlice.name]: fileSpaceSlice.reducer,
    [noteSpaceSlice.name]: noteSpaceSlice.reducer,
    [notifySlice.name]: notifySlice.reducer,
    [chatAiSpaceSlice.name]: chatAiSpaceSlice.reducer,
    [imageAiSpaceSlice.name]: imageAiSpaceSlice.reducer,
    [aiSpaceSlice.name]: aiSpaceSlice.reducer,
    [mailSpaceSlice.name]: mailSpaceSlice.reducer,
})

export const makeStore = () => {

    const isProduction = process.env.NODE_ENV === 'production';

    // 配置中间件
    const middlewareEnhancer = (getDefaultMiddleware) => {
        let middleware = getDefaultMiddleware({
            serializableCheck: false, // 禁用序列化检查
            // 可以根据需要添加其他默认中间件配置
        });
        // 仅在非生产环境中添加 logger 中间件
        if (!isProduction) {
            middleware = middleware.concat(logger);
        }
        return middleware;
    };

    return configureStore({
        reducer: rootReducer,
        devTools: !isProduction,
        // middleware: new MiddlewareArray().concat(logger),
        middleware: middlewareEnhancer
    })
}