export const CATEGORIES = {
  baby: { label: "Baby milestone", color: "#C9694F" },
  family: { label: "Family visit", color: "#6E8F73" },
  shay: { label: "Shay's schedule", color: "#4E7391" },
  vacation: { label: "Vacation / time off", color: "#C79A34" },
  tbd: { label: "Undecided / TBD", color: "#8B7D95" }
};

export function getCategory(key) {
  return CATEGORIES[key] || CATEGORIES.tbd;
}

export function normalizeCategory(raw) {
  const key = String(raw || "tbd").trim().toLowerCase();
  return CATEGORIES[key] ? key : "tbd";
}
