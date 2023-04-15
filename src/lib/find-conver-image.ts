import { IS_PROD } from "@/constants";
import { toGateway } from "./ipfs-parser";

const isExternLink = (url: string) => /^https?:\/\//.test(url)

export function findCoverImage(text: string) {
    const imageRegex = /!\[.*?\]\((.*?)\)/gi;
    const imageLinks = [];

    let match;
    while ((match = imageRegex.exec(text)) !== null) {
        if (match[1]) {
            const url = match[1];
            
            const ipfsUrl = toGateway(url)

            if (isExternLink(url) || (!url.startsWith("https:") && IS_PROD)) {
                continue
            }

            imageLinks.push(ipfsUrl);
        }
    }

    return imageLinks;
}