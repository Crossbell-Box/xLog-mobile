import jsYaml from "js-yaml";
import type { Root } from "mdast";
import type { Result as TocResult } from "mdast-util-toc";
import rehypeInferDescriptionMeta from "rehype-infer-description-meta";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { rehypeAudio } from "./rehype-audio";
import { rehypeImage } from "./rehype-image";

export interface MarkdownEnv {
  excerpt: string
  frontMatter: Record<string, any>
  cover: string
  audio: string
  images: string[]
  toc: TocResult | null
  tree: Root | null
}

export interface Rendered {
  excerpt: string
  frontMatter: Record<string, any>
  cover: string
  audio: string
  images: string[]
  toc: TocResult | null
  tree: Root | null
}

export const renderPageContent = (content: string): Rendered => {
  const env: MarkdownEnv = {
    excerpt: "",
    frontMatter: {},
    cover: "",
    audio: "",
    images: [],
    toc: null,
    tree: null,
  };

  let result: any = null;

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ["yaml"])
      .use(() => (tree) => {
        const yaml = tree.children.find(node => node.type === "yaml");
        if ((yaml as any)?.value) {
          try {
            env.frontMatter = jsYaml.load((yaml as any)?.value) as Record<
            string,
            any
            >;
          }
          catch (e) {
            console.error(e);
          }
        }

        // Remove the frontmatter from the original content for processing the rest of the content
        tree.children = tree.children.filter(node => node.type !== "yaml");
      })
      .use(remarkRehype)
      .use(rehypeStringify)
      .use(rehypeInferDescriptionMeta)
      .use(rehypeImage, { env })
      .use(rehypeAudio, { env });

    result = processor.processSync(content);
  }
  catch (e) {
    console.error(e);
  }

  return {
    excerpt: result?.data.meta.description,
    frontMatter: env.frontMatter,
    cover: env.cover,
    audio: env.audio,
    images: env.images,
    toc: env.toc,
    tree: env.tree,
  };
};
