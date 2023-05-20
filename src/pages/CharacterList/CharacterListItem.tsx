import React, { memo } from "react";

import { useConnectedAccount } from "@crossbell/react-account";
import type { CharacterEntity } from "crossbell";
import { ListItem, Text, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { BlockchainInfoIcon } from "@/components/BlockchainInfoIcon";
import { FollowingButton } from "@/components/FollowingButton";
import { UniLink } from "@/components/UniLink";
import { CSB_SCAN } from "@/constants/env";

const CharacterListItem: React.FC<{
  character: CharacterEntity
  sub: any
}> = ({ character, sub }) => {
  const isCurrentUser = useConnectedAccount()?.characterId === character?.characterId;

  return (
    <ListItem
      icon={(
        <Avatar
          useDefault
          character={character}
          size={40}
        />
      )}
      title={character?.metadata?.content?.name}
      gap={"$0.5"}
      subTitle={(
        <XStack alignItems="center" gap="$2">
          <Text height={24} color={"$color"}>@{character?.handle}</Text>
          <UniLink url={`${CSB_SCAN}/tx/${sub.metadata?.proof || sub.transactionHash}`}>
            <BlockchainInfoIcon size={20} renderOnly/>
          </UniLink>
        </XStack>
      )}
      iconAfter={(
        !isCurrentUser && <FollowingButton character={character}/>
      )}
    />
  );
};

export default memo(CharacterListItem);
