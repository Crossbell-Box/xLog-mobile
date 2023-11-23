import { createContext } from "react";

import type { EditorValues, NoteType } from "@/types";

export type TaskType = {
  assets: string[]
  characterId?: number
  type?: NoteType
} & EditorValues;

export interface PostIndicatorContextType {
  addPostTask: (task: TaskType) => void
  isProcessing: boolean
}

export const PostIndicatorContext = createContext<PostIndicatorContextType | null>(null);
