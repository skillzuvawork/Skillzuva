import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/about", "/contact", "/terms", "/privacy"],
        disallow: ["/dashboard/", "/login", "/signup", "/reset-password", "/forgot-password"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
