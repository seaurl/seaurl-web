'use client'
import React, {memo, useState} from "react";
import SearchContent from "@/components/search/searchContent";


const Search = props => {
    return <div className={'rounded-md w-full h-full overflow-hidden'}>
        <SearchContent/>
    </div>
};
export default memo(Search);
