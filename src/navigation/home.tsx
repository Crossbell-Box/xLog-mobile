import type { FC } from "react";

import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Text, useWindowDimensions } from "tamagui";

import { useColor } from "@/hooks/styles";
import { i18n } from "@/i18n";
import { FeedPage } from "@/pages/Feed";

import type { HomeDrawerParamList } from "./types";

const HomeDrawerStack = createDrawerNavigator<HomeDrawerParamList>();

const DrawerContent: FC<DrawerContentComponentProps> = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      {/* TODO */}
      <DrawerItemList {...props} />
      {/* {
                DRAWER_TABS_MOCK.map((item, index) => {
                    const { icon: Icon } = item
                    // TODO
                    const isFocused = index === 0;
                    const color = isFocused ? primary : null
                    return <DrawerItem
                        key={index}
                        focused={isFocused}
                        activeTintColor={color}
                        icon={() => <Icon color={color} />}
                        label={item.label}
                        onPress={() => { }}
                    />
                })
            } */}
    </DrawerContentScrollView>
  );
};

export const HomeNavigator = () => {
  const { primary } = useColor();
  const { width } = useWindowDimensions();

  return (
    <HomeDrawerStack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: primary,
        drawerLabel(props) {
          return <Text>{props.color}</Text>;
        },
        drawerStyle: {
          width: width * 0.8,
        },
        sceneContainerStyle: { backgroundColor: "white" },
      }}
      drawerContent={DrawerContent}
    >
      <HomeDrawerStack.Screen
        name={"Feed"}
        component={FeedPage}
        options={{ drawerLabel: i18n.t("feed") }}
      />
    </HomeDrawerStack.Navigator>
  );
};
