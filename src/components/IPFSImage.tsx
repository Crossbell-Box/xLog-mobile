import type { FC } from "react";
import { useMemo } from "react";

import type { ImageProps } from "expo-image";
import { Image } from "expo-image";

import { toGateway } from "@/utils/ipfs-parser";

export interface Props extends ImageProps {

}

export const IPFSImage: FC<Props> = (_props) => {
  const props = useMemo(() => {
    if (typeof _props.source === "object" && "uri" in _props.source)
      _props.source.uri = toGateway(_props.source.uri);

    return _props;
  }, [_props]);

  return <Image {...props} />;
};
