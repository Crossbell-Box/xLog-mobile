import { Heart } from "@tamagui/lucide-icons";
import { SizableText, XStack } from "tamagui";

interface Props {
  characterId: number
  noteId: number
}

export const ReactionTip: React.FC<Props> = () => {
  return (
    <XStack alignItems="center" gap="$1.5">
      <Heart size={"$1"} />
      <SizableText color={"$color"}>
                0
      </SizableText>
    </XStack>
  );
};
