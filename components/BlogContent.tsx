import Link from "next/link";
import { Check, MessageCircle } from "lucide-react";
import type { Block } from "@/lib/blog";
import { waLink } from "@/lib/whatsapp";

/** Render inline: **tebal** dan [label](/path atau https://...). */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith("/")) {
        return (
          <Link key={i} href={href} className="font-medium text-red-600 hover:underline">
            {label}
          </Link>
        );
      }
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-red-600 hover:underline"
        >
          {label}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function BlogContent({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="mt-10 scroll-mt-24 text-2xl font-bold text-slate-900 dark:text-white"
              >
                {renderInline(b.text)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-6 text-xl font-semibold text-slate-900 dark:text-white">
                {renderInline(b.text)}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="leading-relaxed text-slate-600 dark:text-slate-300">
                {renderInline(b.text)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-2.5 text-slate-600 dark:text-slate-300">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-red-600" />
                    <span className="leading-relaxed">{renderInline(it)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-slate-600 dark:text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-xs font-bold text-red-600">
                      {j + 1}
                    </span>
                    <span className="leading-relaxed">{renderInline(it)}</span>
                  </li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={i} className="my-2 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-red-200 dark:border-red-900/40">
                      {b.headers.map((h, j) => (
                        <th
                          key={j}
                          className="px-3 py-2.5 text-left font-semibold text-slate-900 dark:text-white"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr
                        key={r}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className={`px-3 py-2.5 ${
                              c === 0
                                ? "font-medium text-slate-800 dark:text-slate-200"
                                : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {b.caption && (
                  <p className="mt-2 text-xs text-slate-400">{b.caption}</p>
                )}
              </div>
            );
          case "callout":
            return (
              <div
                key={i}
                className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 p-4 leading-relaxed text-slate-700 dark:bg-red-900/10 dark:text-slate-200"
              >
                {renderInline(b.text)}
              </div>
            );
          case "cta":
            return (
              <div
                key={i}
                className="my-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800"
              >
                <p className="text-slate-700 dark:text-slate-200">{renderInline(b.text)}</p>
                <a
                  href={waLink(b.wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:opacity-90"
                >
                  <MessageCircle className="h-5 w-5" /> Chat WhatsApp Sekarang
                </a>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
