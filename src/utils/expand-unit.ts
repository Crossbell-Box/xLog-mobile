import { cloneDeep } from "@apollo/client/utilities";
import type { CharacterEntity, NoteEntity } from "crossbell";
import { nanoid } from "nanoid";

import type { Profile, ExpandedNote, ExpandedCharacter } from "@/types/crossbell";
import { toGateway } from "@/utils/ipfs-parser";

import { renderPageContent } from "./markdown";

export const expandCrossbellNote = async ({
  note,
  useStat,
  useScore,
  keyword,
  useHTML,
}: {
  note: NoteEntity
  useStat?: boolean
  useScore?: boolean
  keyword?: string
  useHTML?: boolean
}) => {
  const expandedNote: ExpandedNote = Object.assign(
    {
      metadata: {
        content: { },
      },
    },
    cloneDeep(note),
  );

  if (expandedNote.metadata?.content) {
    let rendered;
    if (expandedNote.metadata?.content?.content) {
      rendered = renderPageContent(expandedNote.metadata.content.content);

      if (keyword) {
        const position = expandedNote.metadata.content.content
          .toLowerCase()
          .indexOf(keyword.toLowerCase());
        expandedNote.metadata.content.summary = `...${expandedNote.metadata.content.content.slice(
          position - 10,
          position + 100,
        )}`;
      }
      else {
        if (!expandedNote.metadata.content.summary) {
          expandedNote.metadata.content.summary = rendered.excerpt;
        }
      }

      expandedNote.metadata.content.frontMatter = rendered.frontMatter;
    }

    expandedNote.metadata.content.cover
      = expandedNote.metadata?.content?.attachments?.find(
        attachment => attachment.name === "cover",
      )?.address || rendered?.cover;

    expandedNote.metadata.content.images = [];
    const cover = expandedNote.metadata?.content?.attachments?.find(attachment => attachment.name === "cover")?.address;
    if (cover) {
      expandedNote.metadata.content.images.push(cover);
    }
    expandedNote.metadata.content.images = expandedNote.metadata.content.images.concat(rendered?.images || []);
    expandedNote.metadata.content.images = [...new Set(expandedNote.metadata.content.images)];

    expandedNote.metadata.content.slug = encodeURIComponent(
      expandedNote.metadata.content.attributes?.find(
        a => a.trait_type === "xlog_slug",
      )?.value || "",
    );

    if (useStat) {
      const stat = await (
        await fetch(
          `https://indexer.crossbell.io/v1/stat/notes/${expandedNote.characterId}/${expandedNote.noteId}`,
        )
      ).json();
      expandedNote.metadata.content.views = stat.viewDetailCount;
    }
  }

  return expandedNote;
};

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

  if (site.avatars) {
    site.avatars = site.avatars.map(avatar => toGateway(avatar));
  }

  if (site.banners) {
    site.banners.map((banner) => {
      banner.address = toGateway(banner.address);
      return banner;
    });
  }
  delete site.metadata?.raw;

  return site;
};

export const expandCrossbellCharacter = (site: CharacterEntity) => {
  const expandedCharacter: ExpandedCharacter = Object.assign(
    {
      metadata: {
        content: {},
      },
    },
    cloneDeep(site),
  );
  if (!expandedCharacter.metadata.content) {
    expandedCharacter.metadata.content = {};
  }

  expandedCharacter.metadata.content.navigation = JSON.parse(
    (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_navigation",
    )?.value as string) || "null",
  ) || [{ id: nanoid(), label: "Archives", url: "/archives" }];
  expandedCharacter.metadata.content.css
    = expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_css",
    )?.value as string;
  expandedCharacter.metadata.content.ga
    = (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_ga",
    )?.value as string) || "";
  expandedCharacter.metadata.content.ua
    = (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_ua",
    )?.value as string) || "";
  expandedCharacter.metadata.content.custom_domain
    = (expandedCharacter.metadata?.content?.attributes?.find(
      (a: any) => a.trait_type === "xlog_custom_domain",
    )?.value as string) || "";
  expandedCharacter.metadata.content.name
    = expandedCharacter.metadata.content.name || expandedCharacter.handle;

  if (expandedCharacter.metadata.content.avatars) {
    expandedCharacter.metadata.content.avatars
      = expandedCharacter.metadata.content.avatars.map(avatar =>
        toGateway(avatar),
      );
  }
  if (expandedCharacter.metadata.content.banners) {
    expandedCharacter.metadata.content.banners.map((banner) => {
      banner.address = toGateway(banner.address);
      return banner;
    });
  }

  return expandedCharacter;
};
