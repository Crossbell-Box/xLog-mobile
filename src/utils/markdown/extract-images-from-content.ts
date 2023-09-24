import jsYaml from "js-yaml";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { rehypeImage } from "./rehype-image";

import type { MarkdownEnv } from ".";

export interface ExtractedImages {
  images: string[]
}

export const extractImagesFromContent = (content: string): ExtractedImages => {
  if (typeof content !== "string" || content.length === 0) {
    return {
      images: [],
    };
  }
  const env = {
    images: [],
  } as MarkdownEnv;

  let result: any = null;

  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .use(rehypeImage, { env });

    result = processor.processSync(content);
  }
  catch (e) {
    console.error(e);
  }

  return {
    images: env.images,
  };
};
