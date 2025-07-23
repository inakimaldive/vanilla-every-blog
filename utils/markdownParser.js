export function parseMarkdown(markdown) {
    // Basic markdown parsing implementation
    return markdown
        // Headers
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // Lists
        .replace(/^\s*\n\*/gm, '<ul>\n*')
        .replace(/^(\*.+)\s*\n([^\*])/gm, '$1\n</ul>\n$2')
        .replace(/^\*(.+)/gm, '<li>$1</li>')
        // Paragraphs
        .replace(/^\s*(\n)?(.+)/gm, function(m) {
            return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>'+m+'</p>';
        })
        // Line breaks
        .replace(/\n/g, '');
}
