import type { MDXComponents } from "mdx/types"
import Image, { type ImageProps } from "next/image"

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g., to add styling.
    // Example: h1: ({ children }) => <h1 className="text-4xl font-bold">{children}</h1>,
    img: (props) => <Image sizes="100vw" style={{ width: "100%", height: "auto" }} {...(props as ImageProps)} />,
    ...components,
  }
}
