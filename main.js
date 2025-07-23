import { parseFrontMatter } from './utils/frontMatterParser.js';
import { parseMarkdown } from './utils/markdownParser.js';

async function loadPosts() {
    try {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages 
            ? 'https://api.github.com/repos/inakimaldive/vanilla-every-blog/contents/posts'
            : '/posts';
            
        if (isGitHubPages) {
            // Use GitHub API to list directory contents
            const response = await fetch(repoBase);
            if (!response.ok) {
                throw new Error(`Failed to load posts directory: ${response.status} ${response.statusText}`);
            }
            
            const files = await response.json();
            return files
                .filter(file => file.name.endsWith('.md'))
                .map(file => ({
                    path: file.name,
                    date: file.name.substring(0, 19).replace(/-/g, ':') + 'Z'
                }));
        } else {
            // Local development - use fetch to get directory listing
            const response = await fetch('/posts');
            if (!response.ok) {
                throw new Error(`Failed to load posts directory: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            // Parse the directory listing HTML to get .md files
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = Array.from(doc.querySelectorAll('a'));
            
            return links
                .map(link => link.href)
                .filter(href => href.endsWith('.md'))
                .map(href => {
                    const filename = href.split('/').pop();
                    return {
                        path: filename,
                        date: filename.substring(0, 19).replace(/-/g, ':') + 'Z'
                    };
                });
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        throw error;
    }
}

async function fetchPosts() {
    try {
        // Determine if we're on GitHub Pages or localhost
        const isGitHubPages = window.location.hostname.includes('github.io');
        const repoBase = isGitHubPages 
            ? 'https://raw.githubusercontent.com/inakimaldive/vanilla-every-blog/main'
            : '';
            
        console.log('Environment:', {
            hostname: window.location.hostname,
            isGitHubPages,
            repoBase
        });
        
        // Load posts from index.json
        const posts = await loadPostIndex();
        
        // Sort posts by date (newest first)
        const sortedPosts = [...posts].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Fetch post contents
        const postContents = await Promise.all(
            sortedPosts.map(async post => {
                try {
                    const postUrl = `${repoBase}/posts/${post.path}`;
                    console.log(`Fetching post from: ${postUrl}`);
                    
                    const response = await fetch(postUrl);
                    console.log(`Fetch response for ${post.path}:`, {
                        status: response.status,
                        ok: response.ok,
                        statusText: response.statusText
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const content = await response.text();
                    console.log(`Content received for ${post.path}:`, content.substring(0, 100) + '...');
                    
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
                <p>Hostname: ${window.location.hostname}</p>
                <p>Is GitHub Pages: ${window.location.hostname.includes('github.io')}</p>
                <p>Repository base: ${window.location.hostname.includes('github.io') 
                    ? 'https://raw.githubusercontent.com/inakimaldive/vanilla-every-blog/main'
                    : '(local)'}</p>
                <p>Index JSON URL: ${window.location.hostname.includes('github.io')
                    ? 'https://raw.githubusercontent.com/inakimaldive/vanilla-every-blog/main/posts/index.json'
                    : '/posts/index.json'}</p>
                <div class="test-links">
                    <p>Test links:</p>
                    <ul>
                        ${(posts || []).map(post => `
                            <li>
                                <a href="${window.location.hostname.includes('github.io')
                                    ? 'https://raw.githubusercontent.com/inakimaldive/vanilla-every-blog/main/posts/' + post.path
                                    : '/posts/' + post.path}" 
                                   target="_blank">${post.path}</a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }
}

init();
