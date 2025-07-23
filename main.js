import { parseFrontMatter } from './utils/frontMatterParser.js';
import { parseMarkdown } from './utils/markdownParser.js';

async function fetchPosts() {
    // Since we know we have one post for now, we'll fetch it directly
    const response = await fetch('/posts/2025-07-22-15-30.md');
    const content = await response.text();
    return [content];
}

function renderPost(content) {
    const { attributes, body } = parseFrontMatter(content);
    const htmlContent = parseMarkdown(body);
    
    const article = document.createElement('article');
    article.className = 'post';
    
    article.innerHTML = `
        <header class="post-header">
            <h2 class="post-title">${attributes.title}</h2>
            <div class="post-meta">
                ${new Date(attributes.date).toLocaleDateString()}
                <div class="tags">
                    ${attributes.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </header>
        <div class="post-content">
            ${htmlContent}
        </div>
    `;
    
    return article;
}

async function init() {
    const postsContainer = document.getElementById('posts');
    try {
        const posts = await fetchPosts();
        if (!posts || posts.length === 0) {
            throw new Error('No posts found');
        }
        posts.forEach(content => {
            try {
                const postElement = renderPost(content);
                postsContainer.appendChild(postElement);
            } catch (err) {
                console.error('Error rendering post:', err);
                const errorElement = document.createElement('div');
                errorElement.className = 'post error';
                errorElement.textContent = 'Error rendering this post.';
                postsContainer.appendChild(errorElement);
            }
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    }
}

init();
