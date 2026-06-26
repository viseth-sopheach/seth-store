export default function Badge({ stock }: { stock?: number }) {
  if (stock === undefined) return null;
  const inStock = stock > 0;
  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border ${
        inStock
          ? "bg-emerald-400/20 text-emerald-700 border-emerald-300/50"
          : "bg-red-400/20 text-red-600 border-red-300/50"
      }`}
    >
      {inStock ? `${stock} in stock` : "Out of stock"}
    </span>
  );
}
