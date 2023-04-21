import { toGateway } from "@/utils/ipfs-parser";
import { Image, ImageProps } from "expo-image";
import { FC, useMemo } from "react";

export interface Props extends ImageProps {

}

export const IPFSImage: FC<Props> = (_props) => {
    const props = useMemo(() => {

        if (typeof _props.source === "object" && 'uri' in _props.source) {
            _props.source.uri = toGateway(_props.source.uri)
        }

        return _props
    }, [_props])

    return <Image {...props} />
}