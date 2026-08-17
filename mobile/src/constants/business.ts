export const BUSINESS_TYPES = [
  { value: "Retail", label: "Retail", icon: "🛒", desc: "Shops, boutiques, supermarkets" },
  { value: "Wholesale", label: "Wholesale", icon: "📦", desc: "Bulk selling, distributors" },
  { value: "Restaurant", label: "Restaurant", icon: "🍔", desc: "Cafes, food stalls, eateries" },
  { value: "Service", label: "Service", icon: "🛠️", desc: "Consulting, salon, repairs" },
  { value: "Manufacturing", label: "Manufacturing", icon: "🏭", desc: "Production, assembly" },
  { value: "Other", label: "Other", icon: "✨", desc: "Any other operations" }
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number]["value"];
