export enum PageVisibilityEnum {
  All = "all",
  Published = "published",
  Scheduled = "scheduled",
  Draft = "draft",
  Modified = "published and local modified",
}

export type PagesSortTypes = "latest" | "hottest" | "commented";

export type NoteType = "post" | "page" | "portfolio" | "short";

export interface EditorValues {
  title?: string
  publishedAt?: string
  published?: boolean
  excerpt?: string
  slug?: string
  tags?: string
  content?: string
  cover?: {
    address?: string
    mime_type?: string
  }
  disableAISummary?: boolean
  externalUrl?: string
  images?: {
    address?: string
    mime_type?: string
  }[]
}

