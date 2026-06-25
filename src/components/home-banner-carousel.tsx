"use client";

import { useEffect, useMemo, useState } from "react";

type HomeBanner = {
  id: string;
  title: string | null;
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;
  image_url?: string | null;
  redirect_url?: string | null;
  link_url?: string | null;
};

function getDesktopUrl(banner: HomeBanner) {
  return banner.desktop_image_url || banner.image_url || banner.mobile_image_url || "";
}

function getMobileUrl(banner: HomeBanner) {
  return banner.mobile_image_url || getDesktopUrl(banner);
}

export function HomeBannerCarousel({ banners }: { banners: HomeBanner[] }) {
  const validBanners = useMemo(() => banners.filter((banner) => getDesktopUrl(banner)), [banners]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (validBanners.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % validBanners.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [validBanners.length]);

  if (validBanners.length === 0) return null;

  const current = validBanners[currentIndex] || validBanners[0];
  const content = (
    <picture>
      <source media="(max-width: 767px)" srcSet={getMobileUrl(current)} />
      <img
        src={getDesktopUrl(current)}
        alt={current.title || "Banner MKTBR Site"}
        className="aspect-[16/7] w-full rounded-2xl object-cover shadow-2xl shadow-[#05281f]/15 md:aspect-[21/7]"
      />
    </picture>
  );

  return (
    <section className="bg-[#f4f8f3] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {current.redirect_url || current.link_url ? (
          <a href={current.redirect_url || current.link_url || "#"} className="block focus:outline-none focus:ring-4 focus:ring-[#00c853]/30">
            {content}
          </a>
        ) : (
          content
        )}
        {validBanners.length > 1 ? (
          <div className="mt-4 flex justify-center gap-2">
            {validBanners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Mostrar banner ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${index === currentIndex ? "w-8 bg-[#00c853]" : "w-2.5 bg-slate-300"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
