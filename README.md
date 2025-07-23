# Vanilla Every Blog

A minimalist blog engine built with vanilla JavaScript that uses Markdown files with front-matter for content. Posts are created through GitHub Actions, which can be triggered via API or manually.

## 📁 Project Structure

```
vanilla-every-blog/
├── index.html           # Main HTML file
├── main.js             # Core JavaScript functionality
├── style.css           # Styling
├── posts/              # Blog post markdown files
│   └── YYYY-MM-DD-HH-MM.md
├── utils/
│   ├── markdownParser.js    # Markdown to HTML converter
│   └── frontMatterParser.js # YAML front matter parser
└── .github/
    └── workflows/
        └── create-post.yml  # GitHub Action for post creation
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vanilla-every-blog.git
   cd vanilla-every-blog
   ```

2. Choose how to serve the blog:

   ### Local Development
   Start a local server:
   ```bash
   python3 -m http.server
   ```
   Open http://localhost:8000 in your browser

   ### GitHub Pages Deployment
   1. Go to your repository settings
   2. Navigate to "Pages" section
   3. Select "Deploy from a branch"
   4. Choose "main" branch and "/ (root)" folder
   5. Click "Save"
   
   Your blog will be available at `https://YOUR_USERNAME.github.io/vanilla-every-blog`

## 📝 Blog Post Format

Posts are stored as Markdown files in the `posts` directory with the naming format: `YYYY-MM-DD-HH-MM.md`

Example post:
```markdown
---
title: My Blog Title
date: 2025-07-22T15:30:00Z
tags: [vanilla, blog]
---

# Welcome to My Blog

This is the content of my blog post.
```

## ⚡ Creating New Posts

### Option 1: Manual GitHub Action Trigger
Go to your repository's Actions tab and trigger the "Create New Blog Post" workflow manually.

### Option 2: API Trigger with cURL
```bash
curl -X POST https://api.github.com/repos/YOUR_USERNAME/vanilla-every-blog/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -d '{"event_type":"new-post"}'
```

### Option 3: Vercel Integration

1. Create a new Vercel project and link it to your repository

2. Add these environment variables in your Vercel project settings:
   - `GITHUB_PAT`: Your GitHub Personal Access Token
   - `GITHUB_USERNAME`: Your GitHub username
   - `REPO_NAME`: vanilla-every-blog

3. Create an API route in your Vercel project:

   Create a file `api/create-post.js`:
   ```javascript
   export default async function handler(req, res) {
     if (req.method !== 'POST') {
       return res.status(405).json({ message: 'Method not allowed' });
     }

     try {
       const response = await fetch(
         `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.REPO_NAME}/dispatches`,
         {
           method: 'POST',
           headers: {
             'Accept': 'application/vnd.github+json',
             'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             event_type: 'new-post'
           })
         }
       );

       if (response.ok) {
         res.status(200).json({ message: 'Post creation triggered' });
       } else {
         res.status(response.status).json({ message: 'Failed to trigger post creation' });
       }
     } catch (error) {
       res.status(500).json({ message: error.message });
     }
   }
   ```

4. Trigger post creation using your Vercel endpoint:
   ```bash
   curl -X POST https://your-vercel-project.vercel.app/api/create-post
   ```

## 🔒 Security Notes

1. GitHub Personal Access Token (PAT):
   - Create a PAT with 'repo' scope
   - Never commit your PAT to the repository
   - Store it securely in environment variables

2. Vercel Environment Variables:
   - Use encrypted environment variables in Vercel
   - Limit API access using appropriate authentication

## 🛠️ Development

1. The blog uses pure vanilla JavaScript with ES modules
2. Posts are parsed using a custom front matter parser
3. Markdown is converted to HTML using a basic parser
4. Styling is minimal and customizable via CSS

## 📚 API Documentation

### GitHub Action Workflow
- Trigger: Manual or via repository_dispatch event
- Creates a new markdown file with current timestamp
- Commits and pushes to the repository
- Files are created in the `posts` directory

### Post Creation API
- Endpoint: `POST /api/create-post` (Vercel)
- No authentication required (add your own as needed)
- Triggers GitHub Action workflow
- Returns 200 on success

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
