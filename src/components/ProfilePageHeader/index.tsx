import React from "react";

import { H3, SizableText, YStack } from "tamagui";

export interface ProfilePageHeaderProps {
  title: string
  description: React.ReactNode
}

export const ProfilePageHeader: React.FC<ProfilePageHeaderProps> = (props) => {
  const { title, description } = props;
  return (
    <YStack margin="$3" marginBottom="$6">
      <H3 marginBottom={description ? "$3" : "$-3"}>{title}</H3>
      {description && <SizableText size={"$4"} color={"$colorSubtitle"}>{description}</SizableText>}
    </YStack>
  );
};
