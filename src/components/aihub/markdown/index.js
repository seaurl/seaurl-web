'use client'
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'
import { message, Input, Dropdown } from 'antd';
import {FolderOpenOutlined, FolderOutlined, MenuOutlined} from '@ant-design/icons';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.min.css';
import classNames from 'classnames';
import SelectFileDlg from '@/components/dialog/selectFileDlg';
import {useSearchParams} from "next/navigation";
import {useDispatch} from "react-redux";
import {updateDt, queryUserAiTools} from '@/lib/slices/aiSpaceSlice'

const { TextArea } = Input;

const Markdown = ({ content: initialContent = '', className, isDeepThink }) => {
  const [markdownContent, setMarkdownContent] = useState(initialContent);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const query = useSearchParams()
  const dispatch = useDispatch()
  const isUpdate = useRef(false)
  const [selectFileDlg, setSelectFileDlg] = useState({
    title: '',
    show: false
  });

  // 当外部传入的 content 变化时，更新内部状态
  useEffect(() => {
    if (initialContent !== undefined) {
      setMarkdownContent(initialContent);
    }
  }, [initialContent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 高亮代码块（包括自定义的代码块和默认的代码块）
    const codeBlocks = container.querySelectorAll('pre code, code.hljs');
    codeBlocks.forEach((block) => {
      if (!block.classList.contains('hljs')) {
        try {
          hljs.highlightElement(block);
        } catch (error) {
          // 如果高亮失败，使用自动检测
          try {
            hljs.highlightElement(block);
          } catch (e) {
            console.warn('Code highlighting failed:', e);
          }
        }
      }
    });

    // 处理代码块复制功能
    const handleClick = (e) => {
      const target = e.target;
      // 检查点击的是否是"复制代码"按钮
      if (target.classList.contains('code-copy-btn')) {
        const codeContainer = target.closest('.code-block-container');
        const code = codeContainer?.querySelector('code')?.textContent;
        if (code) {
          navigator.clipboard.writeText(code)
            .then(() => {
              message.success('复制成功');
            })
            .catch(() => message.error('复制失败'));
        }
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [markdownContent]);

  // 自定义代码块渲染
  const components = {
    pre({ children, ...props }) {
      // 检查是否是代码块
      const codeElement = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === 'code'
      );

      if (codeElement) {
        const codeProps = codeElement.props;
        const codeClassName = codeProps.className || '';
        const match = /language-(\w+)/.exec(codeClassName);
        const language = match ? match[1] : '';
        const codeString = String(codeProps.children).replace(/\n$/, '');

        if (language) {
          return (
            <div className="my-4 rounded-md overflow-hidden bg-[#0d1117] code-block-container">
              <div className="flex justify-between items-center px-3 py-2 bg-[#161b22] border-b border-[#30363d] text-xs text-[#8b949e]">
                <span className="font-medium">{language}</span>
                <span className="cursor-pointer text-[#58a6ff] hover:text-[#79c0ff] transition-colors code-copy-btn">复制代码</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <code className={`hljs ${language} block p-0 m-0 bg-transparent text-sm leading-[1.45] break-all`}>
                  {codeString}
                </code>
              </div>
            </div>
          );
        }
      }

      return <pre {...props}>{children}</pre>;
    },
    code({ node, inline, className: codeClassName, children, ...props }) {
      // 行内代码
      if (inline) {
        return (
          <code className="px-[0.2em] py-0 my-0 text-[85%] bg-[rgba(175,184,193,0.2)] rounded-[3px] font-mono" {...props}>
            {children}
          </code>
        );
      }
      // 代码块由 pre 组件处理，这里只返回默认结构
      return (
        <code className={codeClassName} {...props}>
          {children}
        </code>
      );
    },
    a({ node, href, children, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#58a6ff] no-underline hover:underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="my-4 overflow-x-auto">
          <table className="w-full border-collapse my-0">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead>{children}</thead>;
    },
    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="even:bg-[#f6f8fa]">{children}</tr>;
    },
    th({ children }) {
      return (
        <th className="px-[13px] py-[6px] border border-[#d0d7de] bg-[#f6f8fa] font-semibold">
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="px-[13px] py-[6px] border border-[#d0d7de]">
          {children}
        </td>
      );
    },
    h1({ children }) {
      return (
        <h1 className="mt-4 mb-2 text-[2em] font-semibold leading-[1.25] border-b border-[#eaecef] pb-[0.3em]">
          {children}
        </h1>
      );
    },
    h2({ children }) {
      return (
        <h2 className="mt-4 mb-2 text-[1.5em] font-semibold leading-[1.25] border-b border-[#eaecef] pb-[0.3em]">
          {children}
        </h2>
      );
    },
    h3({ children }) {
      return (
        <h3 className="mt-4 mb-2 text-[1.25em] font-semibold leading-[1.25]">
          {children}
        </h3>
      );
    },
    h4({ children }) {
      return (
        <h4 className="mt-4 mb-2 text-base font-semibold leading-[1.25]">
          {children}
        </h4>
      );
    },
    h5({ children }) {
      return (
        <h5 className="mt-4 mb-2 text-[0.875em] font-semibold leading-[1.25]">
          {children}
        </h5>
      );
    },
    h6({ children }) {
      return (
        <h6 className="mt-4 mb-2 text-[0.85em] font-semibold leading-[1.25] text-[#6a737d]">
          {children}
        </h6>
      );
    },
    p({ children }) {
      return <p className="my-2">{children}</p>;
    },
    ul({ children }) {
      return <ul className="my-2 pl-8">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="my-2 pl-8">{children}</ol>;
    },
    li({ children }) {
      return <li className="my-1">{children}</li>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="px-4 my-2 text-[#6a737d] border-l-[0.25em] border-[#d0d7de]">
          {children}
        </blockquote>
      );
    },
    hr() {
      return <hr className="h-1 p-0 my-6 bg-[#d0d7de] border-0" />;
    },
    img({ src, alt }) {
      return (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-md my-4"
        />
      );
    },
  };

  const items = [
    {
      key: '1',
      label: '从我的文件选择',
      icon: <FolderOpenOutlined/>
    },
    {
      key: '3',
      label: '打开',
      icon: <FolderOutlined/>
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          setMarkdownContent(content);
          message.success('文件加载成功');
        };
        reader.readAsText(file); // 读取文件内容
      } catch (e) {
        message.error('读取文件出错');
      }
    }
  };

  function onMenuClick(key) {
    console.log('key=', key);
    if (key === '3') {
      // 打开本地文件
      if (inputRef.current) {
        inputRef.current.click();
      }
    }
    if (key === '1') {
      // 从我的文件选择
      setSelectFileDlg({
        title: '请选择文件',
        show: true,
        allowedExtensions: [
          'md',
          'markdown',
          'txt'                 // Text
        ],
        onOk: async (d) => {
          console.log('d=', d);
          if (d?.url) {
            fetch(d.url)
              .then(response => {
                if (!response.ok) {
                  return message.error("获取文件出错");
                }
                // 检查Content-Type
                const contentType = response.headers.get('Content-Type');
                console.log('contentType=', contentType);
                return response.text();
              })
              .then(res => {
                console.log('setSelectFileDlg res-', res);
                if (typeof res === 'string') {
                  setMarkdownContent(res);
                  message.success('文件加载成功');
                } else {
                  message.error("不支持此文件，请重新选择");
                }
              })
              .catch(error => {
                message.error("获取文件出错：" + error);
              });
          }
        }
      });
    }
  }

  function globalUpdate() {
    if (!isUpdate.current) {
      const usedId = query.get('usedId')
      if (usedId) {
        dispatch(updateDt({ usedId }))
        dispatch(queryUserAiTools())
      }
      isUpdate.current = true
    }
  }

  return (
    <div onClick={globalUpdate} className={classNames('flex flex-col w-full h-screen', className)}>
      <div className="flex items-center gap-4 font-medium px-3 h-[49px] border-b border-[#ddd] dark:border-[#474747]">
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => onMenuClick(key),
          }}
        >
          <div className={'text-sm cursor-pointer flex items-center gap-1 font-medium'}>
            <MenuOutlined />
            快捷菜单
          </div>
        </Dropdown>
      </div>
      <div className="flex w-full flex-col lg:flex-row" style={{ height: 'calc(100vh - 50px)' }}>
        <div className="flex-1 w-full h-1/2 lg:w-1/2 lg:h-full border-b lg:border-r border-[#ddd] dark:border-[#474747] px-4 overflow-hidden flex flex-col">
            <TextArea
            variant="borderless"
            placeholder="请输入 Markdown 文本..."
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="flex-1 min-h-0"
            style={{
                resize: 'none',
                fontSize: '14px',
                fontFamily: 'monospace',
                border: 'none',
                outline: 'none',
            }}
            />
        </div>
        <div className="flex-1 w-full h-1/2 lg:w-1/2 lg:h-full px-4 overflow-y-auto ">
            <div
            ref={containerRef}
            className={classNames(
                'leading-7 break-words',
                {
                'border border-[#54458a] dark:border-white rounded-2xl p-3 my-2 text-[#54458a] dark:text-white': isDeepThink,
                }
            )}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{markdownContent}</ReactMarkdown>
            </div>
        </div>
      </div>
      <input
        type="file"
        accept=".md,.markdown,.txt"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <SelectFileDlg dlg={selectFileDlg} />
    </div>
  );
};

export default Markdown;

