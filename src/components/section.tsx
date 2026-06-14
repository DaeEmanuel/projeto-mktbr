import type { ReactNode } from "react";

export function Section({
  eyebrow,
  title,
  text,
  children,
  dark,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section className={dark ? "bg-[#061421] text-white" : "bg-white text-[#061421]"}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-[#00c853]">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
          <p className={`mt-4 text-lg leading-8 ${dark ? "text-white/70" : "text-slate-600"}`}>
            {text}
          </p>
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
