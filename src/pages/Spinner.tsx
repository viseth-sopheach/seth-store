export default function Spinner({
  size = 20,
  color = "text-indigo-600",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <div
      className={`animate-spin inline-block rounded-full border-2 border-current border-t-transparent ${color}`}
      style={{ width: size, height: size }}
    />
  );
}
