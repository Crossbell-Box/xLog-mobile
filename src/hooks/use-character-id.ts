import { useAccountState } from "@crossbell/react-account";

export function useCharacterId() {
  return useAccountState().computed?.account?.characterId;
}
