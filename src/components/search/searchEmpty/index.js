'use client'

const SearchEmpty = (props)=>{
  return <div className={'pt-[12px] pl-[50px] pb-[20px]'}>
    <div className={'text-md'}>找不到和您查询的“<span className={'text-[red]'}>{props.content}</span>”相符的内容或信息。</div>

    <div className={'pt-[12px] text-md'}>
      建议：
      <ul>
        <li>请检查输入字词有无错误。</li>
        <li>请尝试其他查询词。</li>
        <li>请改用较常见的字词。</li>
      </ul>
    </div>
  </div>
}

export default SearchEmpty
