import { cn } from "@/lib/utils";

export default function Card({ children, onClick, className }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex h-full w-full flex-col gap-2 overflow-hidden rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10 transition-colors",
        onClick && "cursor-pointer hover:bg-muted/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
