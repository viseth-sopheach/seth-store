export default function StatCard({
  label,
  value,
  borderTopClass,
}: {
  label: string;
  value: string | number;
  borderTopClass: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 border-t-4 rounded-xl p-5 min-w-40 flex-1 basis-40 ${borderTopClass}`}
    >
      <div className="text-2xl font-bold text-gray-900 tracking-tight">
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1 font-medium tracking-widest uppercase">
        {label}
      </div>
    </div>
  );
}
