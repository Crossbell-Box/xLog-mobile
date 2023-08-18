import type { Root } from "rehype-raw";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import { IS_PROD } from "@/constants";

import { toGateway } from "../ipfs-parser";

import type { MarkdownEnv } from ".";

const isExternLink = (url: string) => /^https?:\/\//.test(url);

export const rehypeImage: Plugin<Array<{ env: MarkdownEnv }>, Root> = ({
  env,
}) => {
  return (tree: Root) => {
    let first = true;
    visit(tree, { tagName: "img" }, (node) => {
      if (!node.properties) return;

      let url = node.properties.src;

      if (!url || typeof url !== "string") {
        return;
      }

      const ipfsUrl = toGateway(url);
      node.properties.src = ipfsUrl;
      url = ipfsUrl;

      if (first) {
        env.cover = url;
        first = false;
      }
      env.images.push(url);

      if (isExternLink(url)) {
        if (!url.startsWith("https:") && IS_PROD) {
          console.error(`External image url must start with https: ${url}`);
          url.replace(/^http:/, "https:");
        }
        return;
      }

      node.properties.src = url;
    });
  };
};
