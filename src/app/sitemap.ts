import type { MetadataRoute } from "next";
import { navItems, publicCourses, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...navItems.map((item) => ({
      url: `${site.url}${item.href === "/" ? "" : item.href}`,
      lastModified: new Date(),
    })),
    { url: `${site.url}/login`, lastModified: new Date() },
    { url: `${site.url}/cadastro`, lastModified: new Date() },
    { url: `${site.url}/ferramentas/tiktok-autocreator`, lastModified: new Date() },
    ...publicCourses.map((course) => ({
      url: `${site.url}/cursos/${course.slug}`,
      lastModified: new Date(),
    })),
  ];
}
