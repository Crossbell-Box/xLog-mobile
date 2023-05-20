import { DOMAIN } from "@/constants/index";

export const getSiteLink = ({
  domain,
  subdomain,
  noProtocol,
}: {
  domain?: string
  subdomain: string
  noProtocol?: boolean
}) => {
  if (domain) {
    return `https://${domain}`;
  }
  if (noProtocol) {
    return `${subdomain}.${DOMAIN}`;
  }

  return `https://${subdomain}.${DOMAIN}`;
};
