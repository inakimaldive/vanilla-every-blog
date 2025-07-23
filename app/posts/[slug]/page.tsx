import { getPostSlugs } from "@/lib/posts"
import { notFound } from "next/navigation"
import { format } from "date-fns"

// This component will dynamically import the MDX file
export default async function PostPage({ params }) {
  const { slug } = params

  let PostContent
  let metadata: any

  try {
    // Dynamically import the MDX file. Next.js handles this with the MDX plugin.
    const mdxModule = await import(`../../../posts/${slug}.md`)
    PostContent = mdxModule.default
    metadata = mdxModule.metadata // Frontmatter is exposed as `metadata` export
  } catch (error) {
    console.error(`Failed to load post ${slug}:`, error)
    notFound() // If the post is not found, render the Next.js notFound page
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">{metadata.title}</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Published on {format(new Date(metadata.date), "MMMM dd, yyyy")}
      </p>
      {/* The 'prose' class from @tailwindcss/typography styles the markdown content */}
      <article className="prose prose-gray dark:prose-invert max-w-none">{PostContent && <PostContent />}</article>
    </div>
  )
}

/**
 * Generates static paths for all blog posts at build time.
 * This is essential for static site generation (SSG) with dynamic routes [^1].
 */
export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}
