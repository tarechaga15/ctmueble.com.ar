import { cn } from "@/lib/utils";

/**
 * Barra de navegación para filtrar por estado con conteo en vivo.
 * @param {Object} props
 * @param {Array<{ id: string|null, label: string, count?: number }>} props.tabs
 * @param {string|null} props.activeStatus
 * @param {(status: string|null) => void} props.onSelectStatus
 * @param {string} [props.className]
 */
export default function StatusFilterNav({
  tabs = [],
  activeStatus = null,
  onSelectStatus,
  className = "",
}) {
  return (
    <nav
      aria-label="Filtro por estado"
      className={cn(
        "no-scrollbar flex w-full items-center gap-1.5 overflow-x-auto border-b border-border/60 pb-2 pt-1",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive =
          (tab.id === null && activeStatus === null) || tab.id === activeStatus;
        return (
          <button
            key={tab.id ?? "all"}
            type="button"
            onClick={() => onSelectStatus(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 sm:text-sm",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-background/80 text-foreground/70 border border-border/50"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
