// ─── ProductCardSkeleton — same outer shape/border/spacing as ProductCard,
// shown on first paint (e.g. right after Ctrl+R) before data arrives.

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`bg-white/40 rounded-md animate-pulse ${className}`} />;
}

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden flex flex-col">
      {/* Image */}
      <div className="h-36 sm:h-40 bg-white/10 flex items-center justify-center overflow-hidden">
        <Pulse className="w-full h-full rounded-none" />
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Pulse className="h-4 w-2/3" />
          <Pulse className="h-5 w-16 rounded-full" />
        </div>

        <Pulse className="h-3 w-1/3" />

        <Pulse className="h-4 w-1/4 rounded-full" />

        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-4/5" />

        <div className="mt-auto flex items-center justify-between pt-2">
          <Pulse className="h-5 w-14" />
        </div>

        <div className="flex gap-2 pt-2">
          <Pulse className="flex-1 h-8 rounded-xl" />
          <Pulse className="flex-1 h-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}