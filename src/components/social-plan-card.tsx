import Link from "next/link";

export function SocialPlanCard({
  name,
  price,
  badge,
  description,
  benefits,
  href,
  featured,
}: {
  name: string;
  price: string;
  badge: string;
  description: string;
  benefits: string[];
  href: string;
  featured: boolean;
}) {
  const external = href.startsWith("https://");

  const buttonClass = featured
    ? "bg-[#00c853] text-[#061421] hover:bg-[#00b84c]"
    : "bg-[#061421] text-white hover:bg-black";

  return (
    <article
      className={
        featured
          ? "rounded-lg border-4 border-[#00c853] bg-white p-6 shadow-2xl shadow-[#00c853]/20"
          : "rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      }
    >
      <span className="rounded-full bg-[#00c853]/15 px-3 py-1 text-xs font-black text-[#128C3E]">
        {badge}
      </span>
      <h3 className="mt-5 text-2xl font-black text-[#061421]">{name}</h3>
      <p className="mt-3 text-4xl font-black text-[#061421]">{price}</p>
      <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 grid gap-2">
        {benefits.map((benefit) => (
          <p key={benefit} className="text-sm font-semibold text-slate-700">
            {benefit}
          </p>
        ))}
      </div>
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 text-sm font-black transition ${buttonClass}`}
        >
          Assinar {name}
        </a>
      ) : (
        <Link
          href={href}
          className={`mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-md px-5 text-sm font-black transition ${buttonClass}`}
        >
          Comecar gratis
        </Link>
      )}
    </article>
  );
}
