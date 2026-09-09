import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="animate-fade-up">
      <Card className="shadow-card-hover">
        <CardContent className="px-6 pt-7 pb-7 sm:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </CardContent>
      </Card>
      {footer && <div className="mt-5 text-center text-sm text-ink-500">{footer}</div>}
    </div>
  );
}
