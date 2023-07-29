import type { ReactNode } from "react";
import React from "react";

type ProviderElement = React.ReactElement<React.PropsWithChildren<any>>;

interface ProviderComposerProps {
  providers: ProviderElement[]
  children: ReactNode
}

const ProviderComposer: React.FC<ProviderComposerProps> = ({ providers, children }) => {
  return (
    <>
      {
        providers.reduceRight(
          (children, providerElement) => React.cloneElement(providerElement, {}, children),
          children,
        )
      }
    </>
  );
};

export default ProviderComposer;
