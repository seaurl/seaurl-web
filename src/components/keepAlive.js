import {useRef} from "react";

const KeepAlive = ({ children, cacheKey }) => {
    const cacheRef = useRef({});

    if (!cacheRef.current[cacheKey]) {
        cacheRef.current[cacheKey] = children;
    }

    return cacheRef.current[cacheKey];
};

export default KeepAlive
