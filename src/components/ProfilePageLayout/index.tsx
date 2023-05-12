import React from "react";

import { YStack } from "tamagui";

export interface ProfilePageLayoutProps extends React.ComponentProps<typeof YStack> {

}

export const ProfilePageLayout: React.FC<ProfilePageLayoutProps> = (props) => {
  return <YStack flex={1} padding="$4" {...props} />;
};
