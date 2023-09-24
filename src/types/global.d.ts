import type { NoteEntity } from "crossbell";

declare module "*.png" {
  const value: any;
  export = value;
}
declare module "*.svg" {
  const value: any;
  export = value;
}

declare module "crossbell" {
  interface NoteEntity {
    stat: {
      viewDetailCount: number
    }
  }
}

declare const _WORKLET: boolean;
