import { parseFrontMatter } from './utils/frontMatterParser.js';
import { parseMarkdown } from './utils/markdownParser.js';

async function fetchPosts() {
    // First, fetch a list of available posts
    const posts = [
        '/posts/2025-07-21-15-30.md',
        '/posts/2025-07-22-15-30.md'
    ];
    
    // Fetch each post's content
    const postContents = await Promise.all(
        posts.map(async postPath => {
            try {
                const response = await fetch(postPath);
                if (!response.ok) {
                    console.error(`Failed to fetch ${postPath}`);
                    return null;
                }
                return await response.text();
            } catch (error) {
                console.error(`Error fetching ${postPath}:`, error);
                return null;
            }
        })
    );

    // Filter out any failed fetches
    return postContents.filter(content => content !== null);
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

        // Parse all posts and sort by date
        const parsedPosts = posts
            .map(content => {
                try {
                    const { attributes, body } = parseFrontMatter(content);
                    return {
                        date: new Date(attributes.date),
                        content,
                        parsed: { attributes, body }
                    };
                } catch (err) {
                    console.error('Error parsing post:', err);
                    return null;
                }
            })
            .filter(post => post !== null)
            .sort((a, b) => b.date - a.date); // Sort newest first

        if (parsedPosts.length === 0) {
            throw new Error('No valid posts found');
        }

        // Render sorted posts
        parsedPosts.forEach(post => {
            try {
                const postElement = renderPost(post.content);
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
