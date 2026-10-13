import { readPublicContent } from '@/lib/content-store';
import { sitemapXml } from '@/lib/seo-routes';
import { isLang } from '@/lib/locales';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale.endsWith('.xml') ? locale.slice(0, -4) : '';
  if (!isLang(lang)) return new Response('Not found', { status: 404 });
  const content = await readPublicContent();
  return new Response(sitemapXml(content.articles, content.kiokus, lang), { status: content.unavailable ? 503 : 200, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': content.unavailable ? 'no-store' : 'public, max-age=300' } });
}
