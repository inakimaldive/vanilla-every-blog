# vanilla-every-blog

Here's a structured plan to implement your Vanilla JS blog app that reads Markdown files with front-matter from a /posts directory, and includes a GitHub Actions workflow to create a new post file.

🔧 1. Project Structure bash Copy Edit blog-app/ ├── index.html ├── main.js ├── style.css ├── /posts/ │ ├── 2025-07-22-15-30.md │ ├── ... ├── /utils/ │ ├── markdownParser.js │ └── frontMatterParser.js ├── .github/ │ └── workflows/ │ └── create-post.yml ├── README.md 📝 2. Markdown File Format (/posts/yyyy-mm-dd-hh-mm.md) Each .md file will follow this format:
md Copy Edit
title: My Blog Title date: 2025-07-22T15:30:00Z tags: [vanilla, blog]

This is the content of the blog post. 🌐 3. index.html html Copy Edit
<title>Vanilla JS Blog</title>
My Blog
<script type="module" src="main.js"></script> 🚀 4. JavaScript Functionality /main.js Fetch all .md files in /posts

Parse front-matter and Markdown

Render posts to the DOM

/utils/frontMatterParser.js js Copy Edit export function parseFrontMatter(content) { const match = /^---\n([\s\S]*?)\n---/.exec(content); if (!match) return { attributes: {}, body: content };

const attributes = Object.fromEntries( match[1] .split('\n') .map(line => line.split(/:\s(.+)/)) .filter(arr => arr.length === 2) );

const body = content.slice(match[0].length).trim(); return { attributes, body }; } /utils/markdownParser.js You can either:

Use a lightweight Markdown parser (e.g., marked)

Or implement basic support manually if keeping dependencies to zero

⚙️ 5. GitHub Actions: Create New Post .github/workflows/create-post.yml yaml Copy Edit name: Create New Blog Post

on: workflow_dispatch: repository_dispatch: types: [new-post]

jobs: create_post: runs-on: ubuntu-latest steps: - name: Checkout repo uses: actions/checkout@v3

  - name: Create new markdown file
    run: |
      DATE=$(date -u +"%Y-%m-%d-%H-%M")
      FILE="posts/${DATE}.md"
      echo -e "---\ntitle: New Post\ndate: $(date -u +"%Y-%m-%dT%H:%M:%SZ")\ntags: []\n---\n\nWrite your content here." > $FILE

  - name: Commit and push
    run: |
      git config user.name "github-actions"
      git config user.email "github-actions@github.com"
      git add posts/
      git commit -m "Create new post: ${DATE}.md"
      git push

🧪 6. Triggering GitHub Action via curl You can use GitHub's repository_dispatch API:

bash Copy Edit curl -X POST https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches
-H "Accept: application/vnd.github+json"
-H "Authorization: token YOUR_GITHUB_PAT"
-d '{"event_type":"new-post"}' Make sure to:

Replace YOUR_USERNAME, YOUR_REPO, and YOUR_GITHUB_PAT (Personal Access Token)

Enable workflow_dispatch and/or repository_dispatch in GitHub settings
