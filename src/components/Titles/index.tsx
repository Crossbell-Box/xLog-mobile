import { Terminal } from "@tamagui/lucide-icons";
import type { IconProps } from "@tamagui/lucide-icons/types/IconProps";
import { XStack } from "tamagui";

import { useColors } from "@/hooks/use-colors";

import data from "../../data/titles.json";

const icons: {
  [key: string]: React.ExoticComponent<IconProps>
} = {
  "xLog contributor": Terminal,
};

export const Titles: React.FC<{
  characterId?: number
}> = ({ characterId }) => {
  const { color } = useColors();
  if (!characterId)
    return null;

  const list = data.filter(title => title.list.includes(characterId));

  if (!list.length)
    return null;

  return (
    <XStack>
      {list.map((title) => {
        const Icon = icons[title.name];
        return (
          <Icon key={title.name} size={16} color={color}/>
        );
      })}
    </XStack>
  );
};
