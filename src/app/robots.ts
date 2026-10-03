import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
 * One rule for every crawler, AI ones included (GPTBot, ClaudeBot,
 * PerplexityBot): being cited by answer engines is a goal. A dedicated group
 * per bot would replace this one for that bot and drop the disallows.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/print"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
