import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { parseFrontMatter } from './utils/frontMatterParser.js';
import { parseMarkdown } from './utils/markdownParser.js';

const POSTS_DIR = './posts';
const BUILD_DIR = './build';
const POSTS_BUILD_DIR = join(BUILD_DIR, 'posts');

// Template for individual post pages
const postTemplate = (title, date, tags, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="../style.css">
</head>
<body>
    <main>
        <article class="post">
            <header class="post-header">
                <h1 class="post-title">${title}</h1>
                <div class="post-meta">
                    <time datetime="${date}">${new Date(date).toLocaleDateString()}</time>
                    ${tags ? `
                        <div class="tags">
                            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </header>
            <div class="post-content">
                ${content}
            </div>
        </article>
    </main>
</body>
</html>
`;

async function convertPost(filename) {
    try {
        const content = await readFile(join(POSTS_DIR, filename), 'utf-8');
        const { attributes, body } = parseFrontMatter(content);
        const htmlContent = parseMarkdown(body);
        const date = filename.substring(0, 19).replace(/-/g, ':') + 'Z';
        
        const html = postTemplate(
            attributes.title || 'Untitled Post',
            date,
            attributes.tags,
            htmlContent
        );
        
        const htmlFilename = filename.replace('.md', '.html');
        await writeFile(join(POSTS_BUILD_DIR, htmlFilename), html);
        
        return {
            title: attributes.title || 'Untitled Post',
            path: 'posts/' + htmlFilename,
            date: date,
            tags: attributes.tags || []
        };
    } catch (error) {
        console.error(`Error converting ${filename}:`, error);
        return null;
    }
}

async function build() {
    try {
        // Create build directories
        await mkdir(BUILD_DIR, { recursive: true });
        await mkdir(POSTS_BUILD_DIR, { recursive: true });
        
        // Copy static files
        await writeFile(join(BUILD_DIR, 'style.css'), await readFile('style.css', 'utf-8'));
        
        // Convert all posts
        const files = await readdir(POSTS_DIR);
        const posts = await Promise.all(
            files
                .filter(file => file.endsWith('.md'))
                .map(convertPost)
        );
        
        // Generate index page
        const validPosts = posts.filter(post => post !== null)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
            
        const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blog</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <main id="posts">
        ${validPosts.map(post => `
            <article class="post">
                <header class="post-header">
                    <h2 class="post-title">
                        <a href="${post.path}">${post.title}</a>
                    </h2>
                    <div class="post-meta">
                        <time datetime="${post.date}">${new Date(post.date).toLocaleDateString()}</time>
                        ${post.tags.length > 0 ? `
                            <div class="tags">
                                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </header>
            </article>
        `).join('')}
    </main>
</body>
</html>`;

        await writeFile(join(BUILD_DIR, 'index.html'), indexHtml);
        console.log('Build completed successfully!');
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
