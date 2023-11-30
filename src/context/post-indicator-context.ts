import { createContext } from "react";

import type { EditorValues, NoteType } from "@/types";

export interface Asset {
  uri: string
  dimensions?: {
    width: number
    height: number
  }
}

export type TaskType = {
  assets: Array<Asset>
  characterId?: number
  type?: NoteType
} & EditorValues;

export interface PostIndicatorContextType {
  addPostTask: (task: TaskType) => void
  isProcessing: boolean
}

export const PostIndicatorContext = createContext<PostIndicatorContextType | null>(null);
