import { useState } from "react";

import { Check } from "@tamagui/lucide-icons";
import type { SelectProps } from "tamagui";
import { Adapt, Image, Input, Select, Sheet, Text, XStack, YStack } from "tamagui";

import { countries } from "@/constants/countries";

const countryList = Object.values(countries);

export function CountryPicker(props: SelectProps) {
  const [search, setSearch] = useState("");
  const [val, setVal] = useState(props.defaultValue);

  return (
    <Select value={val} onValueChange={setVal} {...props}>
      <Adapt platform="touch">
        <Sheet modal dismissOnSnapToBottom snapPoints={[45]}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay backgroundColor={"rgba(0,0,0,0.5)"}/>
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport>
          <YStack paddingTop="$4" gap="$2">
            <Input
              placeholder="Search for a country"
              marginHorizontal="$2"
              onChangeText={setSearch}
            />
            <Select.Group space="$0">
              {
                countryList.filter((item) => {
                  if (search.length > 0) {
                    const codeMatched = item.en.toLowerCase().includes(search.toLowerCase());
                    const nameMatched = item.alpha2.toLowerCase().includes(search.toLowerCase());
                    return codeMatched || nameMatched;
                  }
                  return true;
                })
                  .map((item, i) => {
                    const countryCode = item.alpha2.toLowerCase();
                    return (
                      <Select.Item index={i} key={countryCode} value={countryCode}>
                        <Select.Content>
                          <XStack justifyContent="flex-start" alignItems="center" gap="$2">
                            <Image
                              source={item.flag}
                              width={24}
                              height={24}
                            />
                            <Text>
                              {item.en}
                            </Text>
                          </XStack>
                        </Select.Content>
                        <Select.ItemIndicator marginLeft="auto">
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    );
                  })
              }
            </Select.Group>
          </YStack>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}
