import Link from "next/link";
import { socialTools } from "@/lib/social-ia";

export function SocialFeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {socialTools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link
            key={tool.title}
            href={tool.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-[#00c853]"
          >
            <Icon className="text-[#00c853]" size={26} />
            <h3 className="mt-4 text-lg font-black text-[#061421]">{tool.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
