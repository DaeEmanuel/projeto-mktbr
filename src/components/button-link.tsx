import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "dark";
}) {
  const variants = {
    primary: "bg-[#00c853] text-[#061421] hover:bg-[#00b84c]",
    secondary:
      "border border-white/20 bg-white/10 text-white hover:border-[#00c853] hover:bg-white/15",
    dark: "bg-[#061421] text-white hover:bg-black",
  };

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-md px-5 text-sm font-black transition ${variants[variant]}`}
    >
      {children}
    </Link>
  );
}
