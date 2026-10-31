import {useEffect, useMemo, useRef, useState} from "react";
import {message, Image as AntImage} from 'antd'
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import mdKatex from "@traptitech/markdown-it-katex";
import "highlight.js/styles/github-dark.min.css";
import cns from "classnames/bind";

const MarkdownMessage = ({content, isDeepThink}) => {
    const containerRef = useRef(null)
    const [previewSrc, setPreviewSrc] = useState('')

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleClick = (e) => {
            const target = e.target
            if (target.classList.contains('code-block-header__copy')) {
                const pre = target.closest('.pre-code-box')
                const code = pre?.querySelector('code')?.textContent
                if (code) {
                    navigator.clipboard.writeText(code)
                        .then(() => {
                            message.success("复制成功");

                        })
                        .catch(() => message.error("复制失败"))
                }
            }
            if (target.tagName === 'IMG') {
                const src = target.getAttribute('src')
                if (src) {
                    setPreviewSrc(src)
                }
            }
        }

        container.addEventListener('click', handleClick)
        return () => container.removeEventListener('click', handleClick)
    }, [])

    const mdi = useMemo(() => {
        const md = new MarkdownIt({
            html: true,
            linkify: true,
            highlight(code, language) {
                const validLang = !!(language && hljs.getLanguage(language))
                if (validLang) {
                    const lang = language ?? ''
                    return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
                }
                return highlightBlock(hljs.highlightAuto(code).value, '')
            }
        })
        md.linkify.set({fuzzyLink: false});
        md.renderer.rules.table_open = () => '<div class="table-container"><table>';
        md.renderer.rules.table_close = () => '</table></div>';
        md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const hrefIndex = token.attrIndex('href');
            if (hrefIndex >= 0) {
                token.attrPush(['target', '_blank']);
                token.attrPush(['rel', 'noopener noreferrer']);
            }
            return self.renderToken(tokens, idx, options);
        };

        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const src = token.attrGet('src') || '';
            const alt = token.content || '';
            return `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;display:block;cursor:zoom-in;" />`;
        };

        md.use(mdKatex, {blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000'})
        return md
    }, [])


    function highlightBlock(code, lang) {
        return '<pre class="pre-code-box"><div class="pre-code-header"><span class="code-block-header__lang">' + lang
            + '</span><span class="code-block-header__copy">复制代码</span></div><div class="pre-code"><code class="hljs code-block-body break-all '+lang
            +'">'+code+'</code> </div></pre>'
    }

    return (
        <>
            <div
                className={cns({
                    'border border-[#54458a] dark:border-white rounded-2xl px-3 py-2 my-2 text-[#54458a] dark:text-white leading-[28px]': isDeepThink
                })}
                ref={containerRef}
                dangerouslySetInnerHTML={{__html: mdi.render(content)}}
            />
            <div style={{display: 'none'}}>
                <AntImage
                    src={previewSrc}
                    preview={{
                        visible: !!previewSrc,
                        onVisibleChange: (vis) => { if (!vis) setPreviewSrc('') }
                    }}
                />
            </div>
        </>
    )
}

export default MarkdownMessage
