export function shallowUpdateRouterParams(params) {
    // 使用示例
    window.history.pushState(null, '', `?${params}`);
}
