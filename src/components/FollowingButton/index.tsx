import { type FC } from "react";

import { UserPlus } from "@tamagui/lucide-icons";
import type { CharacterEntity } from "crossbell.js";
import { Button } from "tamagui";

import { useFollow } from "@/hooks/use-follow";

interface Props {
  character: CharacterEntity
  children?: (
    props: {
      isFollowing: boolean
      isLoading: boolean
      subscribe: () => void
    }
  ) => React.ReactNode
}

export const FollowingButton: FC<Props> = ({ character, children }) => {
  const { isFollowing, isLoading, toggleSubscribe: subscribe } = useFollow({ character });

  if (children) {
    return (
      <>
        {
          children({
            isFollowing,
            isLoading,
            subscribe,
          })
        }
      </>
    );
  }

  return (
    <Button
      icon={<UserPlus size={"$1"}/>}
      size={35}
      bordered
      color={isFollowing ? "$primary" : "$color"}
      borderColor={isFollowing ? "$primary" : null}
      backgroundColor={isFollowing ? null : "$primary"}
      onPress={subscribe}
      disabled={isLoading}
    >
      {
        isFollowing
          ? "取消关注"
          : "关注"
      }
    </Button>
  );
};
