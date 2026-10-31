export async function* chatWithAIStream(messages) {
    const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({messages})
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({message: `HTTP ${res.status}`}));
        throw new Error(err.message || `请求失败: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
                yield json;
            } catch (e) {}
        }
    }
}
