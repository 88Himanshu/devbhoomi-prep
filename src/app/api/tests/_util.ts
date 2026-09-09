import { TestError } from "@/lib/services/tests";

export function handleTestError(err: unknown): Response {
  if (err instanceof TestError) return Response.json({ error: err.message }, { status: err.status });
  console.error(err);
  return Response.json({ error: "Something went wrong" }, { status: 500 });
}
