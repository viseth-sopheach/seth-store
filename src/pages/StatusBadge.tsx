import type { ComputerShopOrderStatus } from "../api/fetchApi";

const STATUS_META: Record<
  ComputerShopOrderStatus,
  { label: string; textClass: string; bgClass: string }
> = {
  pending: {
    label: "Pending",
    textClass: "text-amber-700",
    bgClass: "bg-amber-100",
  },
  confirmed: {
    label: "Confirmed",
    textClass: "text-blue-700",
    bgClass: "bg-blue-100",
  },
  delivered: {
    label: "Delivered",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    textClass: "text-red-700",
    bgClass: "bg-red-100",
  },
};

export default function StatusBadge({
  status,
}: {
  status: ComputerShopOrderStatus;
}) {
  const { label, textClass, bgClass } = STATUS_META[status];

  return (
    <span
      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide inline-block ${bgClass} ${textClass}`}
    >
      {label}
    </span>
  );
}
