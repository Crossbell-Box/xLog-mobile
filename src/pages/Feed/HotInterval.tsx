import { useState } from "react";

import { Check } from "@tamagui/lucide-icons";
import type { SelectProps } from "tamagui";
import {
  Adapt,
  Sheet,
  Select,
  XStack,
} from "tamagui";

import { i18n } from "@/i18n";

export function HotInterval(props: SelectProps) {
  const [val, setVal] = useState(props.defaultValue);

  return (
    <Select value={val} onValueChange={setVal} {...props}>
      <Adapt platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPoints={[25]}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport>
          <XStack>
            <Select.Group space="$0">
              {items.map((item, i) => {
                return (
                  <Select.Item index={i} key={item.name} value={item.interval.toString()}>
                    <Select.ItemText color={"$color"}>{item.name}</Select.ItemText>
                    <Select.ItemIndicator marginLeft="auto">
                      <Check size={16} />
                    </Select.ItemIndicator>
                  </Select.Item>
                );
              })}
            </Select.Group>
          </XStack>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}

const items = [
  {
    name: i18n.t("Today"),
    interval: 1,
  },
  {
    name: i18n.t("This week"),
    interval: 7,
  },
  {
    name: i18n.t("This month"),
    interval: 30,
  },
  {
    name: i18n.t("All time"),
    interval: 0,
  },
];
