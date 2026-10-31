import {auth} from "@/lib/auth";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

const SYSTEM_PROMPT = `你是 Seaurl 的 AI 助手。你可以帮助用户搜索和管理他们的网址、笔记、文件和邮件。

规则：
1. 使用提供的工具来查询数据，然后用自然语言总结结果
2. 如果第一次搜索结果为空，尝试用更短或不同的关键词重新搜索（如"阳光项目"拆成"阳光"）
3. 如果搜索结果为空，如实告知用户
4. 回复请使用中文
5. 当工具返回结果中包含 link 字段时，请将该条目渲染为 Markdown 链接格式，例如：[标题](/noteSpace?nid=xxx)
6. 网址类结果直接使用原始 url 作为链接
7. 当输出笔记内容时，如果内容中包含 <img> 标签，请将其转换为 Markdown 图片语法 ![图片](url) 输出，保留原始图片地址
8. 当用户要求创建网址、笔记、文件或发送邮件时，使用对应的 add_url, add_note, add_file, send_mail 工具
9. 创建数据时，如果必填项缺失（如分类ID、收件人等），先向用户询问，不要自行编造
10. 需要分类ID时，必须先调用 list_categories 工具查询，取返回的 id 字段（不是 name 字段！）
11. 工具返回 success: false 时，必须如实告知用户失败，并显示 error 字段的内容。绝不能在失败时说成功
12. 创建成功后，使用返回的 categoryLink 字段将分类渲染为可点击的 Markdown 链接，如 [数据库](/urlSpace?cid=xxx)。网址本身用 [标题](url) 格式`;

const tools = [
    {
        type: 'function',
        function: {
            name: 'search_urls',
            description: '搜索用户收藏的网址。支持按关键词搜索标题、描述、URL等。',
            parameters: {
                type: 'object',
                properties: {
                    keyword: {type: 'string', description: '搜索关键词'},
                    pageSize: {type: 'number', description: '返回数量，默认10'}
                },
                required: ['keyword']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_notes',
            description: '搜索用户的笔记。支持按关键词搜索标题和内容。返回标题、摘要和笔记ID。需要查看完整内容请使用 get_note_detail 工具。',
            parameters: {
                type: 'object',
                properties: {
                    keyword: {type: 'string', description: '搜索关键词，在笔记标题和内容中匹配'}
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_note_detail',
            description: '获取指定笔记的完整内容。当需要查看笔记详情或用户要求输出笔记内容时使用。',
            parameters: {
                type: 'object',
                properties: {
                    noteId: {type: 'string', description: '笔记ID'}
                },
                required: ['noteId']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_files',
            description: '搜索用户的文件列表。',
            parameters: {
                type: 'object',
                properties: {
                    fullPath: {type: 'string', description: '文件夹路径（可选，默认根目录）'}
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'search_mails',
            description: '搜索用户的邮件。',
            parameters: {
                type: 'object',
                properties: {
                    email: {type: 'string', description: '邮箱地址'},
                    folderName: {type: 'string', description: '文件夹名称，默认 INBOX'},
                    pageSize: {type: 'number', description: '每页数量，默认10'}
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'list_categories',
            description: '查询用户的网址分类、笔记分类、文件分类、邮件文件夹列表。支持按关键词模糊搜索分类名称。不传 type 则返回所有分类。',
            parameters: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['url', 'note', 'file', 'mail'],
                        description: '分类类型：url=网址分类, note=笔记分类, file=文件分类, mail=邮件文件夹。不传则返回全部。'
                    },
                    keyword: {
                        type: 'string',
                        description: '搜索关键词，模糊匹配分类名称（可选）'
                    }
                }
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_special_urls',
            description: '查询用户特定类型的网址列表：frequently=常用(最常点击), history=历史访问记录, favorite=收藏的网址, top=置顶的网址。',
            parameters: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['frequently', 'history', 'favorite', 'top'],
                        description: '网址类型：frequently=常用, history=历史, favorite=收藏, top=置顶'
                    }
                },
                required: ['type']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'get_special_notes',
            description: '查询用户特定类型的笔记列表：frequently=常用(最近使用), favorite=收藏的笔记。',
            parameters: {
                type: 'object',
                properties: {
                    type: {
                        type: 'string',
                        enum: ['frequently', 'favorite'],
                        description: '笔记类型：frequently=常用(最近使用), favorite=收藏'
                    }
                },
                required: ['type']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'add_url',
            description: '创建/收藏一个新网址。必须先调用 list_categories 获取真实的分类ID（24位MongoDB ObjectId格式），绝对不能用分类名称作为categoryId。',
            parameters: {
                type: 'object',
                properties: {
                    title: {type: 'string', description: '网址标题'},
                    url: {type: 'string', description: '网址链接，需包含 http(s)://'},
                    categoryId: {type: 'string', description: '分类ID（必须是 list_categories 返回的 id 字段，不是 name！格式如 65572750cd854b7c35b26936）'},
                    description: {type: 'string', description: '网址描述（可选）'},
                    keywords: {type: 'string', description: '关键词（可选）'}
                },
                required: ['title', 'url', 'categoryId']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'add_note',
            description: '创建一条新笔记。必须先调用 list_categories 获取真实的分类ID（24位MongoDB ObjectId格式），绝对不能用分类名称作为categoryId。',
            parameters: {
                type: 'object',
                properties: {
                    title: {type: 'string', description: '笔记标题'},
                    categoryId: {type: 'string', description: '分类ID（必须是 list_categories 返回的 id 字段，不是 name！）'},
                    content: {type: 'string', description: '笔记内容，支持 HTML 格式'}
                },
                required: ['title', 'categoryId', 'content']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'add_file',
            description: '通过文本内容创建一个文件并上传。必填：fileName, content, fileType。fileType 如 txt, json, csv, md, html 等。',
            parameters: {
                type: 'object',
                properties: {
                    fileName: {type: 'string', description: '文件名，如 meeting_notes.txt'},
                    content: {type: 'string', description: '文件内容'},
                    fileType: {type: 'string', description: '文件类型（扩展名），如 txt, json, md, csv, html'},
                    pid: {type: 'string', description: '父文件夹ID（可选，-1 或不传为根目录）'}
                },
                required: ['fileName', 'content', 'fileType']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'send_mail',
            description: '发送一封邮件。必填：senderEmail, to, subject, content。senderEmail 可通过 list_categories(type=mail) 获取用户邮箱。',
            parameters: {
                type: 'object',
                properties: {
                    senderEmail: {type: 'string', description: '发件人邮箱地址（用户已配置的邮箱）'},
                    to: {type: 'string', description: '收件人邮箱地址，多个用逗号分隔'},
                    cc: {type: 'string', description: '抄送邮箱地址，多个用逗号分隔（可选）'},
                    subject: {type: 'string', description: '邮件主题'},
                    content: {type: 'string', description: '邮件正文，支持 HTML 格式'}
                },
                required: ['senderEmail', 'to', 'subject', 'content']
            }
        }
    }
];

async function executeTool(name, args, tokenId) {
    try {
        switch (name) {
            case 'search_urls': {
                const res = await fetch(`${API_HOST}/space/crud/url/queryAndSearchUrls`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'token-id': tokenId},
                    body: JSON.stringify({
                        categoryId: '',
                        search: args.keyword || '',
                        pageNum: 1,
                        pageSize: args.pageSize || 20,
                        sortType: 'comprehensive'
                    })
                });
                const json = await res.json();
                if (json.status === 0) {
                    return (json.data?.rows || []).map(r => ({
                        title: r.title, url: r.url, description: r.description, category: r.categoryName
                    }));
                }
                return [];
            }
            case 'get_special_urls': {
                const res = await fetch(`${API_HOST}/space/crud/url/getUrlListByType?type=${args.type}`, {
                    headers: {'token-id': tokenId}
                });
                const json = await res.json();
                if (json.status === 0) {
                    return (json.data || []).map(r => ({
                        title: r.title,
                        url: r.url,
                        description: r.description,
                        categoryId: r.categoryId,
                        categoryName: r.categoryName
                    }));
                }
                return [];
            }
            case 'get_special_notes': {
                const res = await fetch(`${API_HOST}/space/crud/url/getNotesListByType?type=${args.type}`, {
                    headers: {'token-id': tokenId}
                });
                const json = await res.json();
                if (json.status === 0) {
                    return (json.data || []).map(n => ({
                        title: n.title,
                        id: n.id,
                        content: n.content ? n.content.substring(0, 100) : '',
                        categoryId: n.categoryId,
                        updatedDt: n.updatedDt,
                        link: `/noteSpace?cid=${n.categoryId}&nid=${n.id}`
                    }));
                }
                return [];
            }
            case 'search_notes': {
                const searchUrl = args.keyword
                    ? `${API_HOST}/space/crud/note/search?keyword=${encodeURIComponent(args.keyword)}`
                    : `${API_HOST}/space/crud/note/getRecentlyNotes`;
                const res = await fetch(searchUrl, {
                    headers: {'token-id': tokenId}
                });
                const json = await res.json();
                if (json.status === 0) {
                    return (json.data || []).map(n => ({
                        title: n.title,
                        id: n.id,
                        content: n.content ? n.content.substring(0, 100) : '',
                        categoryId: n.categoryId,
                        updatedDt: n.updatedDt,
                        link: `/noteSpace?cid=${n.categoryId}&nid=${n.id}`
                    }));
                }
                return [];
            }
            case 'get_note_detail': {
                const res = await fetch(`${API_HOST}/space/crud/note/queryBy/${args.noteId}`, {
                    headers: {'token-id': tokenId}
                });
                const json = await res.json();
                if (json.status === 0 && json.data) {
                    return {
                        title: json.data.title,
                        content: json.data.content || '',
                        updatedDt: json.data.updatedDt,
                        link: `/noteSpace?cid=${json.data.categoryId}&nid=${json.data.id}`
                    };
                }
                return {error: '笔记不存在或无权访问'};
            }
            case 'search_files': {
                const res = await fetch(`${API_HOST}/space/crud/file/queryFolderList`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'token-id': tokenId},
                    body: JSON.stringify({fullPath: args.fullPath || '/'})
                });
                const json = await res.json();
                if (json.status === 0) {
                    return (json.data || []).map(f => ({
                        name: f.name, type: f.type, size: f.size, fullPath: f.fullPath,
                        link: '/fileSpace'
                    }));
                }
                return [];
            }
            case 'search_mails': {
                const res = await fetch(`${API_HOST}/space/crud/mail/getMessages`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'token-id': tokenId},
                    body: JSON.stringify({
                        email: args.email,
                        folderName: args.folderName || 'INBOX',
                        pageNum: 1,
                        pageSize: args.pageSize || 10
                    })
                });
                const json = await res.json();
                if (json.status === 0) {
                    return (json.data?.messages || []).map(m => ({
                        subject: m.subject, from: m.from, date: m.date,
                        link: '/mailSpace'
                    }));
                }
                return [];
            }
            case 'list_categories': {
                const types = args.type ? [args.type] : ['url', 'note', 'file', 'mail'];
                const kw = args.keyword?.toLowerCase().trim();
                const filterByKeyword = (list) => {
                    if (!kw) return list;
                    return list.filter(item => (item.name || '').toLowerCase().includes(kw));
                };
                const result = {};

                if (types.includes('url')) {
                    const res = await fetch(`${API_HOST}/space/crud/urlCategory`, {
                        headers: {'token-id': tokenId}
                    });
                    const json = await res.json();
                    let cats = json.status === 0 ? (json.data || []).map(c => ({
                        id: c.id || c._id, name: c.name, pid: c.pid, count: c.urlCount || c.count
                    })) : [];
                    result.urlCategories = filterByKeyword(cats);
                }

                if (types.includes('note')) {
                    const res = await fetch(`${API_HOST}/space/crud/noteCategory`, {
                        headers: {'token-id': tokenId}
                    });
                    const json = await res.json();
                    let cats = json.status === 0 ? (json.data || []).map(c => ({
                        id: c.id || c._id, name: c.name, pid: c.pid, count: c.noteCount || c.count
                    })) : [];
                    result.noteCategories = filterByKeyword(cats);
                }

                if (types.includes('file')) {
                    const res = await fetch(`${API_HOST}/space/crud/fileCategory`, {
                        headers: {'token-id': tokenId}
                    });
                    const json = await res.json();
                    let cats = json.status === 0 ? (json.data || []).map(c => ({
                        id: c.id || c._id, name: c.name, pid: c.pid
                    })) : [];
                    result.fileCategories = filterByKeyword(cats);
                }

                if (types.includes('mail')) {
                    const res = await fetch(`${API_HOST}/space/crud/mail/getProvider`, {
                        headers: {'token-id': tokenId}
                    });
                    const json = await res.json();
                    let folders = [];
                    if (json.status === 0 && json.data) {
                        folders = json.data.flatMap(p =>
                            (p.mailFolderList || []).map(f => ({
                                email: p.email,
                                name: f.name,
                                realName: f.realName,
                                messageCount: f.messageCount,
                                unreadMessageCount: f.unreadMessageCount
                            }))
                        );
                    }
                    result.mailFolders = filterByKeyword(folders);
                }

                return result;
            }
            case 'add_url': {
                const res = await fetch(`${API_HOST}/space/crud/url/add`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'token-id': tokenId},
                    body: JSON.stringify({
                        urlTitle: args.title,
                        url: args.url,
                        categoryId: args.categoryId,
                        description: args.description || '',
                        keywords: args.keywords || ''
                    })
                });
                const json = await res.json();
                console.log('[add_url] response:', JSON.stringify(json));
                if (res.ok && json.status === 0 && json.data && json.data.id) {
                    return {
                        success: true,
                        id: json.data.id,
                        title: args.title,
                        url: args.url,
                        categoryId: args.categoryId,
                        categoryLink: `/urlSpace?cid=${args.categoryId}`
                    };
                }
                const errMsg = json.message || json.data?.message || `后端返回 status=${json.status}`;
                return {success: false, error: `添加网址失败：${errMsg}（请确认 categoryId 是来自 list_categories 的真实ID，不是分类名称）`};
            }
            case 'add_note': {
                const res = await fetch(`${API_HOST}/space/crud/note/addForAi`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'token-id': tokenId},
                    body: JSON.stringify({
                        title: args.title,
                        categoryId: args.categoryId,
                        content: args.content
                    })
                });
                const json = await res.json();
                console.log('[add_note] response:', JSON.stringify(json));
                if (res.ok && json.status === 0) {
                    return {
                        success: true,
                        title: args.title,
                        categoryId: args.categoryId,
                        categoryLink: `/noteSpace?cid=${args.categoryId}`
                    };
                }
                const errMsg = json.message || `后端返回 status=${json.status}`;
                return {success: false, error: `创建笔记失败：${errMsg}`};
            }
            case 'add_file': {
                const res = await fetch(`${API_HOST}/space/crud/file/addFileForText`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json', 'token-id': tokenId},
                    body: JSON.stringify({
                        fileName: args.fileName,
                        content: args.content,
                        fileType: args.fileType,
                        pid: args.pid || '-1'
                    })
                });
                const json = await res.json();
                console.log('[add_file] response:', JSON.stringify(json));
                if (res.ok && json.status === 0 && json.data) {
                    return {success: true, fileName: args.fileName, link: '/fileSpace'};
                }
                return {success: false, error: '文件上传失败'};
            }
            case 'send_mail': {
                const recipients = args.to.split(',').map(e => ({address: e.trim()}));
                const mailMessage = {
                    from: [{address: args.senderEmail}],
                    recipients,
                    ccRecipients: args.cc ? args.cc.split(',').map(e => ({address: e.trim()})) : [],
                    replyTo: [],
                    myFiles: [],
                    originFiles: [],
                    subject: args.subject,
                    content: args.content
                };
                const formData = new FormData();
                formData.append('mailMessage', JSON.stringify(mailMessage));

                const res = await fetch(`${API_HOST}/space/crud/mail/sendMessage`, {
                    method: 'POST',
                    headers: {'token-id': tokenId},
                    body: formData
                });
                const json = await res.json();
                console.log('[send_mail] response:', JSON.stringify(json));
                if (res.ok && json.status === 0) {
                    return {success: true, to: args.to, subject: args.subject};
                }
                const errMsg = json.message || `后端返回 status=${json.status}`;
                return {success: false, error: `邮件发送失败：${errMsg}`};
            }
            default:
                return {error: `Unknown tool: ${name}`};
        }
    } catch (e) {
        return {error: e.message};
    }
}

function getProviderHost(baseUrl) {
    if (!baseUrl) return 'https://api.openai.com/v1';
    let host = baseUrl.trim().replace(/\/+$/, '');
    if (!host.endsWith('/v1')) host += '/v1';
    return host;
}

async function callAI(config, messages, tokenId) {
    const host = getProviderHost(config.baseUrl);
    const url = `${host}/chat/completions`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages: [{role: 'system', content: SYSTEM_PROMPT}, ...messages],
            tools,
            tool_choice: 'auto',
            stream: true
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`AI API ${res.status}: ${errText}`);
    }

    return res;
}

async function processStream(res, messages, config, tokenId, controller) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    let toolCalls = [];
    let finishReason = null;

    while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta;
                if (!delta) continue;

                if (delta.content) {
                    content += delta.content;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({type: 'content', content})}\n\n`));
                }

                if (delta.tool_calls) {
                    for (const tc of delta.tool_calls) {
                        const idx = tc.index;
                        if (!toolCalls[idx]) {
                            toolCalls[idx] = {
                                id: tc.id,
                                type: 'function',
                                function: {name: '', arguments: ''}
                            };
                        }
                        if (tc.type) toolCalls[idx].type = tc.type;
                        if (tc.id) toolCalls[idx].id = tc.id;
                        if (tc.function?.name) toolCalls[idx].function.name += tc.function.name;
                        if (tc.function?.arguments) toolCalls[idx].function.arguments += tc.function.arguments;
                    }
                }

                if (json.choices?.[0]?.finish_reason) {
                    finishReason = json.choices[0].finish_reason;
                }
            } catch (e) {}
        }
    }

    if (finishReason === 'tool_calls' && toolCalls.length > 0) {
        const validToolCalls = toolCalls.filter(tc => tc && tc.function?.name);
        const newMessages = [...messages, {
            role: 'assistant',
            content: content || null,
            tool_calls: validToolCalls
        }];

        for (const tc of validToolCalls) {
            const args = JSON.parse(tc.function.arguments || '{}');
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({type: 'tool_call', name: tc.function.name, args})}\n\n`));
            const result = await executeTool(tc.function.name, args, tokenId);
            newMessages.push({
                role: 'tool',
                tool_call_id: tc.id,
                content: JSON.stringify(result)
            });
        }

        const nestedRes = await callAI(config, newMessages, tokenId);
        await processStream(nestedRes, newMessages, config, tokenId, controller);
        return;
    }

    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({type: 'done', content})}\n\n`));
    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
}

export async function POST(request) {
    const session = await auth();
    if (!session?.accessToken) {
        return Response.json({status: -1, message: '未登录'}, {status: 401});
    }

    const tokenId = session.accessToken;
    const body = await request.json();
    const {messages} = body;

    if (!messages || !Array.isArray(messages)) {
        return Response.json({status: -1, message: '参数错误'}, {status: 400});
    }

    const configRes = await fetch(`${API_HOST}/space/crud/ai/key`, {
        headers: {'token-id': tokenId}
    });
    const configJson = await configRes.json();

    if (configJson.status !== 0 || !configJson.data?.apiKey) {
        return Response.json({status: -1, message: '请先配置 AI 模型和 Key'}, {status: 400});
    }

    const config = {
        model: configJson.data.model,
        apiKey: configJson.data.apiKey,
        baseUrl: configJson.data.baseUrl
    };

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const res = await callAI(config, messages, tokenId);
                await processStream(res, messages, config, tokenId, controller);
                controller.close();
            } catch (e) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({type: 'error', message: e.message})}\n\n`));
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
