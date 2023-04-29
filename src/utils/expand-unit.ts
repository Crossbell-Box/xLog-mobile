import { nanoid } from "nanoid";

import type { Profile } from "@/types/crossbell";
import { toGateway } from "@/utils/ipfs-parser";

export const expandUnidataProfile = (site: Profile) => {
  site.navigation = JSON.parse(
    site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_navigation",
    )?.value || "null",
  )
    || site.metadata?.raw?._xlog_navigation
    || site.metadata?.raw?._crosslog_navigation || [
    { id: nanoid(), label: "Archives", url: "/archives" },
  ];
  site.css
    = site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_css",
    )?.value
    || site.metadata?.raw?._xlog_css
    || site.metadata?.raw?._crosslog_css
    || "";
  site.ga
    = site.metadata?.raw?.attributes?.find((a: any) => a.trait_type === "xlog_ga")
      ?.value || "";
  site.custom_domain
    = site.metadata?.raw?.attributes?.find(
      (a: any) => a.trait_type === "xlog_custom_domain",
    )?.value || "";
  site.name = site.name || site.username;
  site.description = site.bio;

  if (site.avatars)
    site.avatars = site.avatars.map(avatar => toGateway(avatar));

  if (site.banners) {
    site.banners.map((banner) => {
      banner.address = toGateway(banner.address);
      return banner;
    });
  }
  delete site.metadata?.raw;

  return site;
};
