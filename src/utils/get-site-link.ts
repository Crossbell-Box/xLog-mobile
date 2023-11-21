import { NAKED_APP_HOST } from "@/constants/env";
import { IS_DEV } from "@/constants/index";

export const getSiteLink = ({
  domain,
  subdomain,
  noProtocol,
}: {
  domain?: string
  subdomain: string
  noProtocol?: boolean
}) => {
  const protocol = IS_DEV ? "http://" : "http://";

  if (domain) {
    return `${protocol}${domain}`;
  }
  if (noProtocol) {
    return `${subdomain}.${NAKED_APP_HOST}`;
  }

  return `${protocol}${subdomain}.${NAKED_APP_HOST}`;
};
