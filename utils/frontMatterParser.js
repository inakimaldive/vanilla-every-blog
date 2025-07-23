export function parseFrontMatter(content) {
    const match = /^---\n([\s\S]*?)\n---/.exec(content);
    if (!match) return { attributes: {}, body: content };

    const attributes = {};
    match[1].split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(/:\s/);
        if (valueParts.length > 0) {
            let value = valueParts.join(':').trim();
            // Parse arrays
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(item => item.trim());
            }
            attributes[key.trim()] = value;
        }
    });

    const body = content.slice(match[0].length).trim();
    return { attributes, body };
}
