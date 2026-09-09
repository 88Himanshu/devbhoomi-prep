import { apiAdmin } from "@/lib/auth/session";
import { TEMPLATE_CSV } from "@/lib/services/questions-import";

export async function GET() {
  const auth = await apiAdmin();
  if ("error" in auth) return auth.error;
  return new Response(TEMPLATE_CSV, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="questions-template.csv"' },
  });
}
