export const DEFAULT_CATEGORIES = {
  tbd: { label: "Undecided / TBD", color: "#8B7D95" }
};

export let CATEGORIES = { ...DEFAULT_CATEGORIES };

export function setCategories(categories) {
  CATEGORIES = { ...DEFAULT_CATEGORIES, ...categories };
}

export function getCategory(key) {
  return CATEGORIES[key] || CATEGORIES.tbd;
}

export function normalizeCategory(raw) {
  const key = String(raw || "tbd").trim().toLowerCase();
  return key || "tbd";
}
