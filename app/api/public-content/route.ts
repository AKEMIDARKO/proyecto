import { readPublicContent } from '@/lib/content-store';
export const dynamic='force-dynamic';
export async function GET() {
  const data=await readPublicContent();
  return Response.json(data,{status:data.unavailable?503:200,headers:{'Cache-Control':'no-store'}});
}
