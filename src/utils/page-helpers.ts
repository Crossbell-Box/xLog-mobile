import type { NoteEntity } from "crossbell";
import dayjs from "dayjs";

import { PageVisibilityEnum } from "@/types";

export const getPageVisibility = (note?: NoteEntity) => {
  if (!note?.noteId) {
    return PageVisibilityEnum.Draft;
  }
  else if (
    dayjs(note.metadata?.content?.date_published).isBefore(new Date())
  ) {
    // TODO
    // @ts-expect-error
    if (note?.local)
      return PageVisibilityEnum.Modified;

    else
      return PageVisibilityEnum.Published;
  }
  else {
    return PageVisibilityEnum.Scheduled;
  }
};
