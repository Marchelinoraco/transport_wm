import Image from "next/image";

// Tile logo Welcome Manado — pola brand tile client_wm (rounded-2xl, ring, shadow)
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-label="Welcome Manado Transport"
      className="relative inline-block overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-slate-200/60 dark:ring-slate-700"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="Welcome Manado Transport"
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority
      />
    </span>
  );
}
