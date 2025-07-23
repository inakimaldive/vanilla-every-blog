Based on your repository, your GitHub Action for new post creation is defined in `.github/workflows/create-post.yml`. Here’s how it’s supposed to work:

### How it Works (from your README)
- The workflow can be triggered manually (`workflow_dispatch`) or programmatically by `repository_dispatch` (e.g., via a curl request).
- When triggered, it:
  1. Checks out your repository.
  2. Creates a new Markdown file in `/posts` using the current date-time as filename.
  3. Commits and pushes the new file.

### How You Trigger It
You can manually trigger it in the Actions tab, or you can use this command:
```bash
curl -X POST https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token YOUR_GITHUB_PAT" \
  -d '{"event_type":"new-post"}'
```
Replace `YOUR_USERNAME`, `YOUR_REPO`, and `YOUR_GITHUB_PAT`.

---

### How to Fix
**If your workflow isn’t working:**
- Make sure your `.github/workflows/create-post.yml` exists and is valid.
- Ensure your GitHub token has `repo` scope and permission to push.
- Check that the workflow creates the markdown file in `/posts/` with correct front-matter.

**If you want a sample/fix for your workflow file, please paste its content or let me know the specific error you’re seeing (e.g., file not created, commit fails, etc.).**

Would you like me to generate a new/fixed `create-post.yml` for you? If yes, specify:
- Should the post have a template (title/content/tags)?
- Any other requirements?

Let me know, or paste your current workflow file for a direct fix!




----

Annotations
1 error

create_post
Process completed with exit code 128.



curl -X POST https://api.github.com/repos/inakimaldive/vanilla-every-blog/dispatches \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_PAT" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"new-post"}'
