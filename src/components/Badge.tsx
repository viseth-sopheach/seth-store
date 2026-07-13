interface BadgeProps {
  stock?: number;
}

export default function Badge({ stock }: BadgeProps) {
  if (stock === undefined) return null;

  const inStock = stock > 0;

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        inStock
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {inStock ? `${stock} in stock` : "Out of stock"}
    </span>
  );
}
