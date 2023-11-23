import type { Route } from "@showtime-xyz/tab-view";

export const internalPages = [
  "/", // 首页
  "/shorts", // 图文
  "/archives", // 归档页面
  "/tag", // 标签页面
  "/nft", // NFT 展示页面
];

export const disabledPages = [
  "/archives", // 归档页面
  "/tag", // 标签页面
  "/nft", // NFT 展示页面
  "/portfolios", // 作品集 (TODO)
];

export enum LinkType {
  UNKNOWN = "UNKNOWN",
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
  POST = "POST",
}

export function isHomePage(pagePath: string) {
  return pagePath === "/";
}

export function isDisabledLink(pagePath: string) {
  return disabledPages.find(p => p === pagePath);
}

export function analyzingLink(link?: Route) {
  if (!link) return {
    type: LinkType.UNKNOWN,
    slug: undefined,
    pagePath: undefined,
  };

  if (link.key.startsWith("https://") || link.key.startsWith("http://")) {
    const url = new URL(link.key);
    const pagePath = url.pathname;

    return {
      type: LinkType.EXTERNAL,
      slug: undefined,
      pagePath,
    };
  }

  if (link.key === "/") return {
    type: "INTERNAL",
    slug: undefined,
    pagePath: "/",
  };

  const slug = link.key.split("/")[2];
  const pagePath = `/${link.key.split("/")[1]}`;
  const isInternal = !!internalPages.find(p => p === pagePath && pagePath !== "/");

  if (isInternal) {
    return {
      type: LinkType.INTERNAL,
      slug,
      pagePath,
    };
  }

  return {
    type: LinkType.UNKNOWN,
    slug: undefined,
    pagePath: undefined,
  };
}
