import { getCv } from "@/lib/cv/queries";
import { buildLlmsTxt } from "@/lib/cv/llms";
import { getLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

export async function GET() {
  const locale = await getLocale();
  const cv = await getCv(locale);
  return new Response(buildLlmsTxt(cv, SITE_URL, locale), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
