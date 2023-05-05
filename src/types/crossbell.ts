import type { ReactElement } from "react";

import type { NoteEntity } from "crossbell.js";
import type { Note as UniNote, Profile as UniProfile } from "unidata.js";

export interface Site {
  id: string
  name: string
  subdomain: string
  icon?: string | null
}

export interface SiteSubscription {
  email?: boolean
}

export interface Viewer {
  id: string
  name: string
  username: string
  email: string
  avatar?: string | null
}

export enum PageVisibilityEnum {
  All = "all",
  Published = "published",
  Scheduled = "scheduled",
  Draft = "draft",
  Crossbell = "crossbell",
  Modified = "published and local modified",
}

export interface PostOnSiteHome {
  id: string
  title: string
  excerpt?: string | null
  autoExcerpt?: string | null
  slug: string
  publishedAt: string | Date
}

export interface Paginated<T> {
  nodes: T[]
  total: number
  hasMore: boolean
}

export interface Page {
  id: string
  title: string
  excerpt: string
  permalink: string
  publishedAt: Date
  published: boolean
}

export interface PostOnArchivesPage {
  id: string
  title: string
  slug: string
  publishedAt: string | Date
}

/**
 * The subscribe form data to store in loginToken
 */
export interface SubscribeFormData {
  email?: boolean
  siteId: string
}

export interface SiteNavigationItem {
  id: string
  label: string
  url: string
}

export type Note = UniNote & {
  slug?: string
  character?: Profile
  cover?: string
  audio?: string
  body?: {
    content?: string
    address?: string
    mime_type?: string
    element?: ReactElement
  }
  preview?: boolean
  views?: number
};

export type ExpandedNote = NoteEntity & {
  metadata: {
    content: {
      summary?: string
      cover?: string
      frontMatter?: Record<string, any>
      slug?: string
      views?: number
      score?: {
        number?: number
        reason?: string
      }
    }
  }
  stat?: {
    viewDetailCount: number
    hotScore?: number
  }
};

export interface Notes {
  total: number
  list: Note[]
  cursor?: string
}

export type Profile = UniProfile & {
  navigation?: SiteNavigationItem[]
  css?: string
  ga?: string
  custom_domain?: string
  description?: string
};

export interface Profiles {
  total: number
  list: Note[]
}
