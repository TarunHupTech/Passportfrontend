// Option lists shared by the add/edit form and the filters.
// These mirror the enums declared on the server's Product model.

export const ITEM_TYPES = [
  "Necklace",
  "Ring",
  "Earrings",
  "Bracelet",
  "Bangle",
  "Pendant",
  "Chain",
  "Other",
];

export const METAL_TYPES = ["Gold", "Rose Gold", "White Gold", "Silver", "Platinum"];

export const PURITIES = ["24k", "22k", "21k", "18k", "14k", "925"];

export const STONE_TYPES = [
  "None",
  "Diamond",
  "Ruby",
  "Emerald",
  "Sapphire",
  "Pearl",
  "Other",
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "value-high", label: "Value: high to low" },
  { value: "value-low", label: "Value: low to high" },
  { value: "name", label: "Name (A–Z)" },
];
