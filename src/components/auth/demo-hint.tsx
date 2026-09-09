import { isDemoMode } from "@/lib/env";

export function DemoAccountsHint() {
  if (!isDemoMode()) return null;
  return (
    <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-xs text-brand-900">
      <p className="font-semibold">Demo mode accounts</p>
      <ul className="mt-1.5 space-y-0.5">
        <li><span className="font-medium">Student:</span> student@example.com</li>
        <li><span className="font-medium">Admin:</span> admin@devbhoomiprep.in</li>
        <li><span className="font-medium">Password:</span> demo1234</li>
      </ul>
      <p className="mt-1.5 text-brand-700">Emails (verification / reset) appear at <span className="font-medium">/dev/outbox</span>.</p>
    </div>
  );
}
