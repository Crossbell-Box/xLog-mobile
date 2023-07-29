import { Link } from "@react-navigation/native";

import { useColors } from "@/hooks/use-colors";

interface UniLinkProps {
  url: string
  onPress?: () => void
}

export const UniLink: React.FC<React.PropsWithChildren<UniLinkProps>> = ({
  url,
  onPress,
  children,
}) => {
  const { subtitle } = useColors();

  return (
    <Link numberOfLines={1} style={{ color: subtitle, textDecorationLine: "underline" }} onPress={onPress} to={{
      screen: "Web",
      params: {
        url,
      },
    }}>
      {children}
    </Link>
  );
};
