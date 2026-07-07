import { useState, useEffect } from "react";
import api from "./api";
import { ITEM_TYPES, METAL_TYPES, PURITIES, STONE_TYPES } from "./constants";

// Static defaults — used while loading and if the request fails.
const FALLBACK = {
  itemTypes: ITEM_TYPES,
  metalTypes: METAL_TYPES,
  purities: PURITIES,
  stoneTypes: STONE_TYPES,
};

// Cached for the session so we don't refetch on every form open.
let cache = null;

export function useAttributes() {
  // Show the cached lists instantly, then revalidate in the background so
  // admin changes are picked up on the next mount (no full reload needed).
  const [attrs, setAttrs] = useState(cache || FALLBACK);

  useEffect(() => {
    let active = true;
    api
      .get("/attributes")
      .then((res) => {
        const d = res.data || {};
        cache = {
          itemTypes: d.itemTypes?.length ? d.itemTypes : FALLBACK.itemTypes,
          metalTypes: d.metalTypes?.length ? d.metalTypes : FALLBACK.metalTypes,
          purities: d.purities?.length ? d.purities : FALLBACK.purities,
          stoneTypes: d.stoneTypes?.length ? d.stoneTypes : FALLBACK.stoneTypes,
        };
        if (active) setAttrs(cache);
      })
      .catch((err) => {
        console.warn("Could not load option lists; using defaults.", err?.message || err);
      });
    return () => {
      active = false;
    };
  }, []);

  return attrs;
}
