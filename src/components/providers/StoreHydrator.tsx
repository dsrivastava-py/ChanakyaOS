"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";

export function StoreHydrator() {
  const hydrateStore = useUserStore((state) => state.hydrateStore);

  useEffect(() => {
    hydrateStore();
  }, [hydrateStore]);

  return null;
}
