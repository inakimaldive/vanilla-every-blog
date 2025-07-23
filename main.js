import { parseFrontMatter } from './utils/frontMatterParser.js';
import { parseMarkdown } from './utils/markdownParser.js';

const POSTS = [
    {
        path: '2025-07-21-15-30.md',
        date: '2025-07-21T15:30:00Z'
    },
    {
        path: '2025-07-22-15-30.md',
        date: '2025-07-22T15:30:00Z'
    }
];

async function fetchPosts() {
    try {
        const repoBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? '' 
            : '/vanilla-every-blog';
            
        console.log('Loading posts from:', `${repoBase}/posts/`);
        
        // Sort posts by date (newest first)
        const sortedPosts = [...POSTS].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Fetch post contents
        const postContents = await Promise.all(
            sortedPosts.map(async post => {
                try {
                    const response = await fetch(`${repoBase}/posts/${post.path}`);
                    if (!response.ok) {
                        console.error(`Failed to fetch ${post.path}: ${response.status}`);
                        return null;
                    }
                    const content = await response.text();
                    return { content, date: post.date };
                } catch (error) {
                    console.error(`Error fetching ${post.path}:`, error);
                    return null;
                }
            })
        );

        return postContents.filter(post => post !== null);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

function renderPost(postData) {
    try {
        const { attributes, body } = parseFrontMatter(postData.content);
        const htmlContent = parseMarkdown(body);
        
        const article = document.createElement('article');
        article.className = 'post';
        
        article.innerHTML = `
            <header class="post-header">
                <h2 class="post-title">${attributes.title || 'Untitled Post'}</h2>
                <div class="post-meta">
                    <time datetime="${postData.date}">${new Date(postData.date).toLocaleDateString()}</time>
                    ${attributes.tags ? `
                        <div class="tags">
                            ${attributes.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </header>
            <div class="post-content">
                ${htmlContent}
            </div>
        `;
        
        return article;
    } catch (error) {
        console.error('Error rendering post:', error);
        const errorArticle = document.createElement('article');
        errorArticle.className = 'post error';
        errorArticle.innerHTML = `
            <header class="post-header">
                <h2 class="post-title">Error Loading Post</h2>
                <div class="post-meta">
                    <time datetime="${postData.date}">${new Date(postData.date).toLocaleDateString()}</time>
                </div>
            </header>
            <div class="post-content">
                <p>Sorry, there was an error loading this post.</p>
            </div>
        `;
        return errorArticle;
    }
}

async function init() {
    const postsContainer = document.getElementById('posts');
    try {
        const posts = await fetchPosts();
        
        if (!posts || posts.length === 0) {
            throw new Error('No posts found');
        }

        // Render each post
        posts.forEach(post => {
            const postElement = renderPost(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="error-container">
                <h2>Error loading posts</h2>
                <p>${error.message}</p>
                <p>Technical details:</p>
                <pre>${error.stack}</pre>
                <p>Current location: ${window.location.href}</p>
                <p>Repository base: ${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? 'localhost' 
                    : '/vanilla-every-blog'}</p>
            </div>
        `;
    }
}

init();
