import path from "path"
import { promises as fs } from "fs"
import matter from "gray-matter"

export type PostMetadata = {
  title: string
  date: string
  tags: string[]
  slug: string
}

/**
 * Reads the 'posts' directory and returns an array of all post slugs.
 * A slug is the filename without the .md extension.
 */
export async function getPostSlugs(): Promise<string[]> {
  const postsDirectory = path.join(process.cwd(), "posts")
  const filenames = await fs.readdir(postsDirectory)
  return filenames.map((filename) => filename.replace(/\.md$/, ""))
}

/**
 * Reads all markdown files in the 'posts' directory, parses their frontmatter,
 * and returns an array of PostMetadata objects.
 * Posts are sorted by date in descending order.
 */
export async function getAllPosts(): Promise<PostMetadata[]> {
  const postsDirectory = path.join(process.cwd(), "posts")
  const filenames = await fs.readdir(postsDirectory)

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(postsDirectory, filename)
      const fileContent = await fs.readFile(filePath, "utf8")
      const { data } = matter(fileContent) // Parse frontmatter
      const slug = filename.replace(/\.md$/, "")
      return {
        title: data.title,
        date: data.date,
        tags: data.tags,
        slug,
      } as PostMetadata
    }),
  )

  // Sort posts by date in descending order
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return posts
}
