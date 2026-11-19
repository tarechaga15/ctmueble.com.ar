import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

export default function InsightStatCard({
  title,
  value,
  numericValue,
  counterPrefix = "",
  counterSuffix = "",
  subtitle,
  icon,
  tone = "default",
  className,
  badge,
  isLoading = false,
  onClick,
}) {
  const toneBg = {
    default: "bg-card text-card-foreground border-border/70",
    success: "bg-emerald-500/5 border-emerald-500/25 text-card-foreground",
    warning: "bg-amber-500/5 border-amber-500/25 text-card-foreground",
    destructive: "bg-rose-500/5 border-rose-500/25 text-card-foreground",
    info: "bg-sky-500/5 border-sky-500/25 text-card-foreground",
    purple: "bg-purple-500/5 border-purple-500/25 text-card-foreground",
  }[tone] || "bg-card text-card-foreground";

  const iconColor = {
    default: "text-muted-foreground bg-muted/60",
    success: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
    warning: "text-amber-700 dark:text-amber-400 bg-amber-500/10",
    destructive: "text-rose-700 dark:text-rose-400 bg-rose-500/10",
    info: "text-sky-700 dark:text-sky-400 bg-sky-500/10",
    purple: "text-purple-700 dark:text-purple-400 bg-purple-500/10",
  }[tone] || "text-muted-foreground bg-muted/60";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "overflow-hidden transition-all shadow-xs hover:shadow-md border",
        toneBg,
        onClick && "cursor-pointer hover:border-primary/40",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          {badge}
        </div>
        {icon ? (
          <div className={cn("rounded-lg p-2 transition-transform duration-200 group-hover:scale-105", iconColor)}>
            {icon}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? (
          <div className="space-y-2 py-0.5">
            <Skeleton className="h-7 w-20 rounded bg-muted/70" />
            <Skeleton className="h-3.5 w-36 rounded bg-muted/50" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">
              {numericValue !== undefined && numericValue !== null ? (
                <AnimatedCounter
                  value={numericValue}
                  prefix={counterPrefix}
                  suffix={counterSuffix}
                />
              ) : (
                value
              )}
            </div>
            {subtitle ? (
              <div className="text-xs text-muted-foreground leading-relaxed flex items-center gap-1.5 flex-wrap">
                {subtitle}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
