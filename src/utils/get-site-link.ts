import { DOMAIN, IS_DEV } from "@/constants/index";

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
    return `${subdomain}.${DOMAIN}`;
  }

  return `${protocol}${subdomain}.${DOMAIN}`;
};
