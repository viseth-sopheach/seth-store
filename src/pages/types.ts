import { type Product } from "../api/fetchApi";

// Fix 3: Utility to safely extract category name as a plain string
export function getCategoryString(category?: Product["category"]): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name ?? "";
}