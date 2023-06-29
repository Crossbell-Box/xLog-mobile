import type { TFunction } from "i18next";

import type { ExpandedCharacter, ExpandedNote } from "@/types/crossbell";

import { getSiteLink } from "./get-site-link";

export const getNoteSlugFromNote = (page: ExpandedNote) => {
  return page.metadata?.content?.attributes?.find(
    $ => $.trait_type === "xlog_slug",
  )?.value;
};

export const getTwitterShareUrl = ({
  page,
  site,
  t,
  isMyPost,
}: {
  page: ExpandedNote
  site: ExpandedCharacter
  t: TFunction<string, undefined>
  isMyPost: boolean
}) => {
  const slug = getNoteSlugFromNote(page);
  const twitterShareURL = getSiteLink({
    subdomain: site.handle!,
    domain: site.metadata?.content?.custom_domain,
  });
  const tweetContent = encodeURIComponent(
    t(
      isMyPost
        ? "Published a new post on my blockchain blog: {{title}}. Check it out now!"
        : "I found an excellent article: {{title}}. Check it out now!",
      {
        title: page.metadata?.content?.title,
      },
    ),
  );
  const twitterViaAccount = "_xLog";

  if (!slug) {
    return "";
  }

  return `https://twitter.com/intent/tweet?url=${twitterShareURL}/${encodeURIComponent(slug)}&via=${twitterViaAccount}&text=${tweetContent}`;
};
