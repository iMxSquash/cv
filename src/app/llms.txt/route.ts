import { getCv } from "@/lib/cv/queries";
import { buildLlmsTxt } from "@/lib/cv/llms";
import { SITE_URL } from "@/lib/site";

// Same daily refresh as the pages; /admin writes revalidate it immediately.
export const revalidate = 86400;

export async function GET() {
  const cv = await getCv();
  return new Response(buildLlmsTxt(cv, SITE_URL), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
