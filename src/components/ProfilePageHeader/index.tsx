import React from "react";

import { H3, SizableText, YStack } from "tamagui";

export interface ProfilePageHeaderProps {
  title: string
  description: React.ReactNode
}

export const ProfilePageHeader: React.FC<ProfilePageHeaderProps> = (props) => {
  const { title, description } = props;
  return (
    <YStack marginBottom="$6">
      <H3 marginBottom="$3">{title}</H3>
      {description && <SizableText size={"$sm"} color={"$colorSubtitle"}>{description}</SizableText>}
    </YStack>
  );
};
