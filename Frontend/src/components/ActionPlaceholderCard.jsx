export default function ActionPlaceholderCard({
  legend,
  onClick,
  icon,
  className = "",
  iconClassName = "",
  legendClassName = "",
}) {
  const defaultIcon = (
    <svg className="size-8 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => event.key === "Enter" && onClick(event) : undefined}
      onClick={onClick}
      className={[
        "flex min-h-[120px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-6 text-foreground transition-colors",
        onClick ? "cursor-pointer hover:bg-muted/70" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["flex items-center justify-center text-muted-foreground", iconClassName].filter(Boolean).join(" ")}>
        {icon != null ? icon : defaultIcon}
      </div>
      {legend ? <p className={["m-0 text-center text-sm font-medium", legendClassName].filter(Boolean).join(" ")}>{legend}</p> : null}
    </div>
  );
}
