import { Delta } from "@/components/delta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatItem = {
  label: string;
  value: string;
  delta: number;
  hasDelta: boolean;
  footnote: string;
  lowerIsBetter?: boolean;
};

export function StatCards({ items }: { items: StatItem[] }) {
  return (
    <>
      {items.map((s) => (
        <Card key={s.label}>
          <CardHeader>
            <CardTitle className="font-body font-bold text-muted text-[11px] uppercase tracking-[.07em]">
              {s.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p className="font-mono font-bold text-[26px] tabular-nums tracking-[-.02em] text-dark leading-none">
              {s.value}
            </p>
            <div className="flex items-center gap-1.5 text-[11.5px]">
              {s.hasDelta ? (
                <Delta value={s.delta} lowerIsBetter={s.lowerIsBetter} />
              ) : (
                <span className="text-muted">—</span>
              )}
              <span className="text-muted">{s.footnote}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function ListRow({
  dot,
  dotColor,
  pulse,
  title,
  sub,
  right,
  className,
}: {
  dot?: React.ReactNode;
  dotColor: string;
  pulse?: boolean;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("flex items-center gap-3 px-5 py-3", className)}>
      {dot ?? (
        <span className="relative flex size-2.5 shrink-0">
          {pulse && (
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
              style={{ background: dotColor }}
            />
          )}
          <span
            className="relative inline-flex size-2.5 rounded-full"
            style={{ background: dotColor }}
          />
        </span>
      )}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="line-clamp-1 text-[12.5px] font-semibold text-dark leading-snug">{title}</p>
        {sub && <p className="text-[11px] text-muted tabular-nums">{sub}</p>}
      </div>
      {right}
    </li>
  );
}
