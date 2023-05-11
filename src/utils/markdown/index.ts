import jsYaml from "js-yaml";
import type { Root } from "mdast";
import { toc } from "mdast-util-toc";
import type { Result as TocResult } from "mdast-util-toc";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { unified } from "unified";

export interface MarkdownEnv {
  excerpt: string
  frontMatter: Record<string, any>
  toc: TocResult | null
  tree: Root | null
}

export interface Rendered {
  excerpt: string
  frontMatter: Record<string, any>
  toc: TocResult | null
  tree: Root | null
}

export const renderPageContent = (content: string): Rendered => {
  const env: MarkdownEnv = {
    excerpt: "",
    frontMatter: {},
    toc: null,
    tree: null,
  };

  try {
    const tree = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, ["yaml"])
      .parse(content);

    const yamlNode = tree.children.find(node => node.type === "yaml");

    if ((yamlNode as any)?.value) {
      try {
        env.frontMatter = jsYaml.load((yamlNode as any)?.value) as Record<string, any>;
        env.excerpt = env.frontMatter.description || "";
      }
      catch (e) {
        console.error(e);
      }
    }

    env.toc = toc(tree, { tight: true, ordered: true });
  }
  catch (e) {
    console.error(e);
  }
  return {
    excerpt: env.excerpt,
    frontMatter: env.frontMatter,
    toc: env.toc,
    tree: env.tree,
  };
};
