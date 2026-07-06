// Pola header seksi client_wm: bar merah + eyebrow tracking lebar + heading raksasa
// dengan baris kedua merah, lalu subjudul muted.
export default function SectionHeader({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <div
        className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}
      >
        <span className="h-1 w-10 rounded-full bg-red-600" />
        <span className="text-xs font-black uppercase tracking-[0.4em] text-red-600">
          {eyebrow}
        </span>
      </div>
      <h2
        className={`mt-4 text-4xl font-black leading-none tracking-tighter md:text-5xl lg:text-6xl ${
          light ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        {title}
        {titleAccent && (
          <>
            {" "}
            <span className="text-red-600">{titleAccent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 max-w-2xl text-lg ${
            light ? "text-white/70" : "text-slate-500 dark:text-slate-400"
          } ${center ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
