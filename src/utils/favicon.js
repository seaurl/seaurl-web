// 把 url.domain 转成后端代理 URL，解决原站 CORP / 防盗链 / 混合内容导致 <img> 加载失败。
// 旧存量数据 url.favicon 是 OSS URL（http...）时仍直连，避免代理转发 OSS（无意义）。
import axios from "@/lib/axios";

const DEFAULT_FAVICON = 'https://cdn.seaurl.com/space/url/www/default.png';
const FAVICON_PROXY_PATH = '/space/info/favicon';

function extractDomain(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return null;
    try {
        return new URL(urlStr).hostname;
    } catch (e) {
        return null;
    }
}

// 解析出可用于代理的 domain：优先 url.domain，缺失时从 url.url 提取（兜底 dashboard rows 等不含 domain 的场景）
function resolveDomain(url) {
    if (!url) return null;
    if (url.domain) return url.domain;
    return extractDomain(url.url);
}

// 是否走代理：解析到 domain 且 favicon 不是 OSS URL / 不是 data: URI 时走代理。
// OSS URL 继续直连（用户 OSS 还在用，直连更快且省一次后端转发）。
export function shouldProxyFavicon(url) {
    if (!url) return false;
    if (url.favicon && (url.favicon.startsWith('https://cdn.seaurl.com/') || url.favicon.startsWith('https://com-seaurl-cdn.'))) {
        return false;
    }
    if (url.favicon && url.favicon.startsWith('data:')) {
        return false;
    }
    return !!resolveDomain(url);
}

// 构建代理 URL
export function buildFaviconUrl(url) {
    const domain = resolveDomain(url);
    if (!shouldProxyFavicon(url) || !domain) {
        return url?.favicon || DEFAULT_FAVICON;
    }
    const base = axios.defaults?.baseURL || '';
    return `${base}${FAVICON_PROXY_PATH}?domain=${encodeURIComponent(domain)}`;
}

export { DEFAULT_FAVICON };

