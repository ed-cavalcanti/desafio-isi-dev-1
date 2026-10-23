"use client";

import { createContext, useContext, useMemo, useState } from "react";

type BreadcrumbLabel = {
  pathname: string;
  label: string;
};

type BreadcrumbLabelContextValue = {
  label: BreadcrumbLabel | null;
  setLabel: (label: BreadcrumbLabel | null) => void;
};

const BreadcrumbLabelContext =
  createContext<BreadcrumbLabelContextValue | null>(null);

export function BreadcrumbLabelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [label, setLabel] = useState<BreadcrumbLabel | null>(null);
  const value = useMemo(() => ({ label, setLabel }), [label]);

  return (
    <BreadcrumbLabelContext.Provider value={value}>
      {children}
    </BreadcrumbLabelContext.Provider>
  );
}

export function useBreadcrumbLabel() {
  const context = useContext(BreadcrumbLabelContext);

  if (!context) {
    throw new Error(
      "useBreadcrumbLabel deve ser usado dentro de BreadcrumbLabelProvider.",
    );
  }

  return context;
}
