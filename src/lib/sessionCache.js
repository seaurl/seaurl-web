import {getSession} from "next-auth/react";

const SESSION_TTL_MS = 30 * 1000;

let cachedPromise = null;
let cachedAt = 0;

export function getSessionCached() {
    const now = Date.now();
    if (cachedPromise && now - cachedAt < SESSION_TTL_MS) {
        return cachedPromise;
    }
    cachedAt = now;
    cachedPromise = getSession();
    // 不论成功失败，Promise settle 后保留结果，下次过期才重新发起
    return cachedPromise;
}

export function invalidateSessionCache() {
    cachedPromise = null;
    cachedAt = 0;
}
